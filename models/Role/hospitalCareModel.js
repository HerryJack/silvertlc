const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Service Provider
const hospitalCareModel = mongoose.Schema({
  hospitalCare: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Hospital System/Managed Care Organizations', hospitalCareModel);