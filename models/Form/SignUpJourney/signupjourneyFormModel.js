const mongoose = require("mongoose");

// Sign Up Journey Form Schema
const signUpJourneyFormSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true 
    },
    role: {
        type: String, 
        required: true
    },
    personalDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String , required: true},
        mobileNumber: { type: String, required: true },
        address: { type: String , required: true},
        city: { type: String , required: true},
        education: { type: String , required: true},
        countryOfBirth: { type: String , required: true},
        birthDate: { type: Date , required: true},
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SignUpJourney', signUpJourneyFormSchema);
