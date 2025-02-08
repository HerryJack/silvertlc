const mongoose = require("mongoose");

// Schema for Corporate User -----> Transport Information Form
const TransportSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true 
    },
    vehicleDetails:{
        name: {type: String, required: true},
        email: {type: String, required: true},
        phone: {type: String, required: true},
        pickUpLocation: {type: String, required: true},
        dropOffLocation: {type: String, required: true},
        pickUpDate: {type: Date, required: true},
        pickUpTime: {type: Date, required: true},
        distance: {type: String, required: true},
        companions: {type: String, required: true},
        waitTime: {type: String, required: true},
    },
    uploadFiles: [],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transport', TransportSchema);  
