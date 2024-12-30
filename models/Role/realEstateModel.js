const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Service Provider
const realStateModel = mongoose.Schema({
    realState: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Real Estate Professionals', realStateModel);