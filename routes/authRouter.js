const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// MiddleWares
const { generateToken } = require("../middlewares/generateToken");
// Utilities
const { sendOTP } = require("../utils/sendOTP");

// Models
const userModel = require("../models/Role/userModel");
const individualModel = require("../models/Role/individualModel");
const serviceProviderModel = require("../models/Role/serviceProviderModel");
const propertyOwnerModel = require("../models/Role/propertyOwnerModel");
const hospitalCareModel = require("../models/Role/hospitalCareModel");
const realEstateModel = require("../models/Role/realEstateModel");
const nonProfitModel = require("../models/Role/nonProfitModel");
const { checkToken } = require("../middlewares/checkToken");

// Test Route (Simple route to check if the service is running)
router.get("/", (req, res) => {
    res.send("User Authentication Service Active");
});

// Register Route (User Registration)
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phonenumber, role } = req.body;

        // Validate input
        if(!name || !email || !password || !phonenumber || !role){
            return res.status(400).json({ status: false, message: "Required fields are missing" });
        }

        // Check if the user already exists by email 
        const emailExists = await userModel.findOne({ email });
        const phonenumberExists = await userModel.findOne({ phonenumber });

        // If Email or Phone Number is already in use, send a conflict response
        if (emailExists || phonenumberExists) {
            return res.status(409).json({ status: false, message: "User already exists" });
        }

        // Hash password before saving to the database to protect user data
        const salt = await bcrypt.genSalt(10);  // Generate salt for bcrypt
        const hashedPassword = await bcrypt.hash(password, salt);  // Encrypt the password

        // OTP Send
        const otp_details = sendOTP(email);

        // Role-based user creation
        if (role === 'Individual') {
            await individualModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role, verifiedtoken: otp_details.otpCode, verifiedtokenExpiresAt: otp_details.otpExpirationTime});
        } else if (role === 'Property Owner') {
            await propertyOwnerModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role, verifiedtoken: otp_details.otpCode, verifiedtokenExpiresAt: otp_details.otpExpirationTime});
        } else if (role === 'Service Provider') {
            await serviceProviderModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role, verifiedtoken: otp_details.otpCode, verifiedtokenExpiresAt: otp_details.otpExpirationTime});
        } else if (role === 'Hospital System/Managed Care Organizations') {
            await hospitalCareModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role, verifiedtoken: otp_details.otpCode, verifiedtokenExpiresAt: otp_details.otpExpirationTime});
        }else if (role === 'Real Estate Professionals') {
            await realEstateModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role, verifiedtoken: otp_details.otpCode, verifiedtokenExpiresAt: otp_details.otpExpirationTime});
        }else if (role === 'Non Profits') {
            await nonProfitModel.create({name: name, email: email, password: hashedPassword, phonenumber: phonenumber, role: role, verifiedtoken: otp_details.otpCode, verifiedtokenExpiresAt: otp_details.otpExpirationTime});
        }   else {
            // If an incorrect role is provided, return a 404 error
            return res.status(404).json({ status: false, message: "Choose Correct Role", error: null });
        }

        // Generate JWT token for the user upon successful login
        const user = {name, email, role};
        const token = generateToken(user);

        // Successful registration response
        res.status(201).json({ status: true, message: "Registered Successfully", data: {token: token}});
    } catch (error) {
        // In case of any error (e.g., database issues), return a server error
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// Again Send OTP for Verification
router.post("/otpcheck/account-verified/resend", checkToken, async (req, res) => {
    try {

        // Middleware data
        const user = req.user;

        if(user.verified){
            return res.status(409).json({ status: true, message: "User is already Verified"});
        }

        // OTP Send
        const otp_details = sendOTP(user.email);

        // Allow password change by updating user record
        user.verifiedtoken = otp_details.otpCode;
        user.verifiedtokenExpiresAt = otp_details.otpExpirationTime;
        await user.save();
        
        // Generate new token for further actions
        const newToken = generateToken(user);
        res.status(200).json({ status: true, message: "OTP Send Successfully successfully", data: {userid: user._id, name: user.name, email: user.email, role: user.role, token: newToken}  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// OTP Verification Route (Verifies the OTP sent For Account Verification)
router.post("/otpcheck/account-verified", checkToken, async (req, res) => {
    try {
        const { otp } = req.body;

        // Validate input
        if(!otp){
            return res.status(400).json({ status: false, message: "Please provide otp" });
        }
    
        // Middleware data
        const user = req.user;

        if(user.verified){
            return res.status(409).json({ status: true, message: "User is already Verified"});
        }

        // Check if OTP is correct and verify its expiration time
        if (otp !== user.verifiedtoken || Date.now() > user.verifiedtokenExpiresAt) {
            return res.status(401).json({ status: false, message: "Invalid or expired OTP" });
        }

        // True ---> User Account Verified
        user.verified = true;
        await user.save();

        // Generate new token for further actions
        const newToken = generateToken(user);
        res.status(200).json({ status: true, message: "Account verified successfully", data: {userid: user._id, name: user.name, email: user.email, role: user.role, token: newToken}  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// User Login Route (Handles user authentication and token generation)
router.post("/login", async (req, res) => {
    try {
        const { email, password} = req.body;

        // Validate input
        if(!email || !password){
            return res.status(400).json({ status: false, message: "Please provide email and password" });
        }

        // Find user based on email and role
        const user = await userModel.findOne({ email});
        if (!user) {
            return res.status(404).json({ status: false, message: "Invalid email or password" });
        }

        // If User Account is not verified
        if (!user.verified) {
            return res.status(409).json({ status: false, message: "User Account is not Verified" });
        }

        // Compare provided password with the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ status: false, message: "Invalid email or password" });
        }

        // Generate JWT token for the user upon successful login
        const token = generateToken(user);
        res.status(200).json({ status: true, message: "Login Successful", data: {userid: user._id, name: user.name, email: user.email, role: user.role, token: token} });
    } catch (error) {
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// Forgot Password Route (Initiates password reset process by sending OTP)
router.post("/forgotpassword", async (req, res) => {
    try {
        const { emailornumber } = req.body;

         // Validate input
        if(!emailornumber){
            return res.status(400).json({ status: false, message: "Please provide email or phone number" });
        }

        // Determine if `data` is an email or phone number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailornumber); // Simple email regex
        const query = isEmail ? { email: emailornumber } : { phonenumber: emailornumber }; // Decide query dynamically

        // Check if user exists based on provided email
        const user = await userModel.findOne(query);
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // OTP Send
        const otp_details = sendOTP(user.email);

        // Allow password change by updating user record
        user.resetPasswordtoken = otp_details.otpCode;
        user.resetPasswordtokenExpiresAt = otp_details.otpExpirationTime;
        await user.save();

        // Generate new token for further actions
        const token = generateToken(user);

        // Return success response with token
        res.status(200).json({ status: true, message: "OTP sent successfully", data: {userid: user._id, name: user.name, email: user.email, role: user.role, token: token}  });
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// OTP Verification Route (Verifies the OTP sent for password reset)
router.post("/otpcheck", checkToken, async (req, res) => {
    try {
        const { otp } = req.body;

        // Validate input
        if(!otp){
            return res.status(400).json({ status: false, message: "Please provide otp" });
        }

        // Middleware data
        const user = req.user;

        // If User Account is not verified
        if (!user.verified) {
            return res.status(409).json({ status: false, message: "User Account is not Verified" });
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
        res.status(200).json({ status: true, message: "OTP verified successfully", data: {userid: user._id, name: user.name, email: user.email, role: user.role, token: newToken}  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// Change Password Route (Handles changing the user's password after OTP verification)
router.post("/changepassword", checkToken, async (req, res) => {
    try {
        const { password } = req.body;

        // Validate input
        if(!password){
            return res.status(400).json({ status: false, message: "Please provide password" });
        }

        // Middleware data
        const user = req.user;

        // If User Account is not verified
        if (!user.verified) {
            return res.status(409).json({ status: false, message: "User Account is not Verified" });
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
        res.status(200).json({ status: true, message: "Password changed successfully", data: {userid: user._id, name: user.name, email: user.email, role: user.role, token: newToken}  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;
