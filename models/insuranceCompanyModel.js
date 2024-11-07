const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Insurance Company
const insuranceCompanySchema = mongoose.Schema({
  insuranceProvide: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Insurance Company', insuranceCompanySchema);;