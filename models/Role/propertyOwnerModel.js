const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Service Provider
const propertyOwnerSchema = mongoose.Schema({
  propertyOwner: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Property Owner', propertyOwnerSchema);;