const User = require('./userModel');
const mongoose = require("mongoose");

// Lease Form Schema
const leaseFormSchema = new mongoose.Schema({
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

// Schema for Individual 
const individualSchema = mongoose.Schema({
  leaseForm: leaseFormSchema
});

module.exports = User.discriminator('Individual', individualSchema);