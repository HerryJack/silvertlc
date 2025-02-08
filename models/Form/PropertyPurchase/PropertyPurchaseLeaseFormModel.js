const mongoose = require("mongoose");

// Schema for property purchase Lease Form
const propertyPurchaseleaseFormSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true 
    },
    propertyOwnerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true 
    },
    propertyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property', 
        required: true 
    },
    propertyFormId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property Purchase', 
        required: true 
    },
    landlord: String,
    landlordAddress: String,
    tenant: String,
    tenantHomeAddress: String,
    tenantTradeName: String,
    demisedProperty: String,
    leaseTerm: String,
    commencementDate: Date,
    rentalForTerm: Number,
    securityDeposit: Number,
    totalAtCommencement: Number,
    permittedUse: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});
    
module.exports = mongoose.model('Property Purchase lease Form', propertyPurchaseleaseFormSchema);
