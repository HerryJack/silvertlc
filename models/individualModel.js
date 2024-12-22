const User = require('./userModel');
const mongoose = require("mongoose");

// Schema for Individual 
const individualSchema = mongoose.Schema({
  individual: {
    type: Array,
    default: []
  }
});

module.exports = User.discriminator('Individual', individualSchema);