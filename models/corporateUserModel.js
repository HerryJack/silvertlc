const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Corporate User
const corporateUserSchema = mongoose.Schema({
  servicesProvider: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Corporate User', corporateUserSchema);