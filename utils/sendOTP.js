const {generateOTP} = require("./generateOTP");
const {emailsender} = require("./nodemailer");

// Function to Send OTP to the user
const sendOTP = async (user) => {
    try {
        // Generate a new OTP
        const otp = generateOTP();
        
        // Send OTP via email
        await emailsender(user.email, otp);

        // Set OTP details and expiration time (2 minutes from now)
        const otpCode = otp.join(""); // Convert array to a string if needed
        const otpExpirationTime = Date.now() + 2 * 60 * 1000;

        // Update the user model with OTP and expiration time
        user.resetPasswordToken = otpCode;
        user.resetPasswordTokenExpiresAt = otpExpirationTime;
        await user.save();
    } catch (error) {
        console.error("Error sending OTP:", error.message);
        throw new Error("Failed to send OTP. Please try again.");
    }
};

module.exports = { sendOTP };