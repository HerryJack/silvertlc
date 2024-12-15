const mongoose = require("mongoose");

// Schema for Corporate User -----> Service Information Form
const ServiceinfoSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corporate User', 
        required: true 
    },
    serviceDetails:{
        companyName: {type: String, required: true},
        address1: {type: String, required: true},
        address2: {type: String, required: true},
        phone: {type: String, required: true},
        email: {type: String, required: true},
        contactPerson: {type: String, required: true},
        officeHours: {type: String, required: true},
        website: {type: String, required: true},
        indrustry1: {type: String, required: true},
        serviceProvided1: {type: String, required: true},
        specialityServices: {type: String, required: true},
        advanceServiceShedule: {type: String, required: true},
        indrustry2: {type: String, required: true},
        serviceProvided2: {type: String, required: true},
    },
    uploadFiles: [],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Serviceinfo', ServiceinfoSchema);  
