// Import Mongoose Package
const mongoose = require("mongoose");

const options = { discriminatorKey: 'role', collection: 'users' };

// Make UserSchema 
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
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
        required: true
    },
    lastlogin: {
        type: Date,
        default: Date.now  // Corrected typo here
    },
    changePassword: {
        type: Boolean, 
        default: false
    },
    resetPasswordtoken: String,
    resetPasswordtokenExpiresAt: Number,
    verifiedtoken: String,
    verifiedtokenExpiresAt: Number,
    verified:{
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: true,
        enum: ['Individual', 'Property Owner', 'Hospital System/Managed Care Organizations', 'Real Estate Professionals', 'Service Provider', 'Non Profits'],
        default: 'Individual'
      }
},options, {timestamps: true});

// Exports User Schema
module.exports = mongoose.model("user", userSchema);
