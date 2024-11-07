const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// MiddleWares
const { generateToken } = require("../middlewares/generateToken");
// Utilities
const { sendOTP } = require("../utils/sendOTP");

// Models
const userModel = require("../models/userModel");
const individualModel = require("../models/individualModel");
const corporateUserModel = require("../models/corporateUserModel");
const insuranceCompanyModel = require("../models/insuranceCompanyModel");
const serviceProviderModel = require("../models/serviceProviderModel");

// Test Route (Simple route to check if the service is running)
router.get("/", (req, res) => {
    res.send("User Authentication Service Active");
});

// Register Route (User Registration)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phonenumber, role } = req.body;

        // Check if the user already exists by email or phone number
        const emailExists = await userModel.findOne({ email });
        const phoneExists = await userModel.findOne({ phonenumber });

        // If Email or Phone Number is already in use, send a conflict response
        if (emailExists || phoneExists) {
            return res.status(409).json({ status: false, message: "User already exists" });
        }

        // Hash password before saving to the database to protect user data
        const salt = await bcrypt.genSalt(10);  // Generate salt for bcrypt
        const hashedPassword = await bcrypt.hash(password, salt);  // Encrypt the password

        // Role-based user creation
        if (role === 'Individual') {
            await individualModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role});
        } else if (role === 'Corporate User') {
            await corporateUserModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role});
        } else if (role === 'Service Provider') {
            await serviceProviderModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role});
        } else if (role === 'Insurance Company') {
            await insuranceCompanyModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role});
        } else {
            // If an incorrect role is provided, return a 404 error
            return res.status(404).json({ status: false, message: "Choose Correct Role", error: null });
        }

        // Successful registration response
        res.status(201).json({ status: true, message: "Registered Successfully" });
    } catch (error) {
        // In case of any error (e.g., database issues), return a server error
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// User Login Route (Handles user authentication and token generation)
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Find user based on email and role
        const user = await userModel.findOne({ email, role });
        if (!user) {
            return res.status(404).json({ status: false, message: "Invalid email or password" });
        }

        // Compare provided password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: false, message: "Invalid email or password" });
        }

        // Generate JWT token for the user upon successful login
        const token = generateToken(user);
        res.status(200).json({ status: true, message: "Login Successful", token });
    } catch (error) {
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// Forgot Password Route (Initiates password reset process by sending OTP)
router.post("/forgotpassword", async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists based on provided email
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Send OTP to user and generate a token for further steps
        await sendOTP(user);
        const token = generateToken(user);

        // Return success response with token
        res.status(200).json({ status: true, message: "OTP sent successfully", token });
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// OTP Verification Route (Verifies the OTP sent for password reset)
router.post("/otpcheck", async (req, res) => {
    try {
        const { otp, token } = req.body;

        // Decode the token to extract user data
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);  // Verifying the JWT token
        } catch (err) {
            // If token is invalid or expired, return a 401 Unauthorized response
            return res.status(401).json({ status: false, message: "Invalid or Expired Token" });
        }

        // Find user by the decoded token's data
        const user = await userModel.findOne({ name: decoded.name, email: decoded.email, role: decoded.role });
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Check if OTP is correct and verify its expiration time
        if (otp !== user.resetPasswordtoken || Date.now() > user.resetPasswordtokenExpiresAt) {
            return res.status(401).json({ status: false, message: "Invalid or expired OTP" });
        }

        // Allow password change by updating user record
        user.changePassword = true;
        await user.save();

        // Generate new token for further actions
        const newToken = generateToken(user);
        res.status(200).json({ status: true, message: "OTP verified successfully", token: newToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// Change Password Route (Handles changing the user's password after OTP verification)
router.post("/changepassword", async (req, res) => {
    try {
        const { password, token } = req.body;

        // Decode the token to extract user data
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);  // Verifying the JWT token
        } catch (err) {
            // If token is invalid or expired, return a 401 Unauthorized response
            return res.status(401).json({ status: false, message: "Invalid or Expired Token" });
        }
        
        // Find user based on decoded token data
        const user = await userModel.findOne({ name: decoded.name, email: decoded.email });
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Ensure the user is authorized to change their password
        if (!user.changePassword) {
            return res.status(403).json({ status: false, message: "Password change not authorized" });
        }

        // Hash the new password and update it in the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        user.changePassword = false;  // Mark the password change as completed
        await user.save();

        // Generate new token with updated information
        const newToken = generateToken(user);
        res.status(200).json({ status: true, message: "Password changed successfully", token: newToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
