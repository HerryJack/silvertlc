const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Utilities
const { generateToken } = require("../utils/generateToken");
const { sendOTP } = require("../utils/sendOTP");

// Models
const userModel = require("../models/userModel");
const individualModel = require("../models/individualModel");
const corporateUserModel = require("../models/corporateUserModel");
const insuranceCompanyModel = require("../models/insuranceCompanyModel");
const serviceProviderModel = require("../models/serviceProviderModel");

// Test Route
router.get("/", (req, res) => {
    res.send("User Authentication Service Active");
});

// Register Route
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phonenumber, role } = req.body;

        // Check if the user already exists by email or phone number
        const emailExists = await userModel.findOne({ email });
        const phoneExists = await userModel.findOne({ phonenumber });

        // If Email or Phone Number is already in use
        if (emailExists || phoneExists) {
            return res.status(409).json({ status: false, message: "User already exists"});
        }

        // Hash password before saving to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (role === 'Individual') {
            await individualModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role});
        } else if (role === 'Corporate User') {
            await corporateUserModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role});
        } else if (role === 'Service Provider') {
            await serviceProviderModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role});
        } else if (role === 'Insurance Company') {
            await insuranceCompanyModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role});
        }else{
            return res.status(404).json({status: false, message: "Choose Correct Role", error: nul});
        }

        res.status(201).json({ status: true, message: "Registered Successfully"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// User Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        const user = await userModel.findOne({ email, role });
        if (!user) {
            return res.status(404).json({ status: false, message: "Invalid email or password" });
        }

        // Compare provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: false, message: "Invalid email or password" });
        }

        // Generate token if authentication is successful
        const token = generateToken(user);
        res.status(200).json({ status: true, message: "Login Successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// Forgot Password Route
router.post("/forgotpassword", async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Send OTP and generate token
        await sendOTP(user);
        const token = generateToken(user);

        res.status(200).json({ status: true, message: "OTP sent successfully", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// OTP Verification Route
router.post("/otpcheck", async (req, res) => {
    try {
        const { otp, token } = req.body;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (err) {
            return res.status(401).json({ status: false, message: "Invalid or Expired Token" });
        }

        // Find user by token data
        const user = await userModel.findOne({ name: decoded.name, email: decoded.email, role: decoded.role });
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Verify OTP and its expiration
        if (otp !== user.resetPasswordtoken || Date.now() > user.resetPasswordtokenExpiresAt) {
            return res.status(401).json({ status: false, message: "Invalid or expired OTP" });
        }

        // Allow password change
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

// Change Password Route
router.post("/changepassword", async (req, res) => {
    try {
        const { password, token } = req.body;

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        
        // Find user based on decoded token data
        const user = await userModel.findOne({ name: decoded.name, email: decoded.email });
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Ensure user is authorized to change password
        if (!user.changePassword) {
            return res.status(403).json({ status: false, message: "Password change not authorized" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        user.changePassword = false;
        await user.save();

        // Generate new token for updated user
        const newToken = generateToken(user);
        res.status(200).json({ status: true, message: "Password changed successfully", token: newToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;