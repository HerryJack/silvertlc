const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Service Provider
const serviceProviderSchema = mongoose.Schema({
  servicesProvider: {
    type: Array,
    default: []
  }

  // userAdditionalDetails:{
  //   firstName: String,
  //   lastName: String,
  //   phonenumber: {
  //     type: String,
  //     unique: true,
  //   },
  //   address: String,
  //   city: String,
  //   state: String,
  //   zip: String,
  //   email: {
  //     type: String,
  //     unique: true
  //   },
  //   education: String,
  //   countryOfBirth: String,
  //   birthOfDate: String
  // }
});

module.exports = User.discriminator('Service Provider', serviceProviderSchema);