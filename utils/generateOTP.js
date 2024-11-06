const crypto = require('crypto');

// Functions to Generate Random 6 Digits Numbers For OTP Code
const generateOTP = () => {
  const otp = crypto.randomInt(100000, 1000000); 
  return otp.toString().split(""); // Returns an array of strings
};

module.exports = { generateOTP };
