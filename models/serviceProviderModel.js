const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Service Provider
const serviceProviderSchema = mongoose.Schema({
  servicesProvider: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Service Provider', serviceProviderSchema);;