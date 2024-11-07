// Import Mongoose Package
const mongoose = require("mongoose");

const options = { discriminatorKey: 'role', collection: 'users' };

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
    changePassword: {
        type: Boolean, 
        default: false
    },
    resetPasswordtoken: String,
    resetPasswordtokenExpiresAt: Number,
    role: {
        type: String,
        required: true,
        enum: ['Individual', 'Corporate User', 'Service Provider', 'Insurance Company'],
        default: 'Individual'
      }
},options, {timestamps: true});

// Exports User Schema
module.exports = mongoose.model("user", userSchema);
