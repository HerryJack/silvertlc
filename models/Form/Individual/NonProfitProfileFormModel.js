const mongoose = require("mongoose");

// Schema for Individual User -----> Non Profit Profile Form
const NonProfitProfileSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corporate User', 
        required: true 
    },
    personalDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        address: { type: String , required: true},
        city: { type: String , required: true},
        state: { type: String , required: true},
        zip: { type: String , required: true},
        email: { type: String , required: true},
        education: { type: String , required: true},
        countryOfBirth: { type: String , required: true},
        birthDate: { type: Date , required: true},
    },
    businessProfile: {
        industry: { type: String , required: true},
        companyName: { type: String, required: true },
        DBA: { type: String , required: true},
        dateOfEstablishment: { type: Date , required: true},
        address: { type: String , required: true},
        mailingAddress: { type: String , required: true},
        territoriesServiced: { type: String , required: true},
        phoneAndFaxNumbers: { type: String , required: true},
        emailAddress: { type: String , required: true},
        websiteURL: { type: String , required: true},
        noOfEmployees: { type: Number , required: true},
        businessDescription: { type: String , required: true},
        vision: { type: String , required: true},
        mission: { type: String , required: true},
        valueStatement: { type: String , required: true},
        servicesOffered: { type: String , required: true},
        industryInformation: { type: String , required: true},
    },
    uploadFiles: [],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NonProfitProfile', NonProfitProfileSchema);
