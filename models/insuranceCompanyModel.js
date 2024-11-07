const User = require('./userModel');
const mongoose = require("mongoose");

const insuranceCompanySchema = mongoose.Schema({
  insuranceProvide: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Insurance Company', insuranceCompanySchema);;