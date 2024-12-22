const mongoose = require("mongoose");

// Lease Form Schema
const leaseFormSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Individual', 
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
    
module.exports = mongoose.model('lease Form', leaseFormSchema);
