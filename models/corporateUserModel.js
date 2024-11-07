const User = require('./userModel');
const mongoose = require("mongoose");

const corporateUserSchema = mongoose.Schema({
  servicesProvider: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Corporate User', corporateUserSchema);;