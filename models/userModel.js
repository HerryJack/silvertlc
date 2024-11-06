// Import Mongoose Package
const mongoose = require("mongoose");

// Make UserSchema 
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        // Remove the 'unique' constraint here
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        unique: true,
        required: true
    },
    lastlogin: {
        type: Date,
        default: Date.now  // Corrected typo here
    },
    changePassword: Boolean,
    resetPasswordtoken: String,
    resetPasswordtokenExpiresAt: Number
}, {timestamps: true});

// Exports User Schema
module.exports = mongoose.model("user", userSchema);
