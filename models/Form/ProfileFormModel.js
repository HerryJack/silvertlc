const mongoose = require("mongoose");

// Profile Form Schema for all the user role ----> Excluded Individual
const ProfileSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true 
    },
    role: {
        type: String, 
        required: true, 
        enum: ['Property Owner', 'Hospital System/Managed Care Organizations', 'Real Estate Professionals', 'Service Provider', 'Non Profits']
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
    uploadFiles: {
        productPortfolio: [],
        awards: [],
        testimonials: [],
        certificate: [],
        specialDesigned: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Profile', ProfileSchema);
