const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Service Provider
const nonProfitModel = mongoose.Schema({
  nonProfit: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Non Profits', nonProfitModel);