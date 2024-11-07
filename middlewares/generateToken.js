const jwt  = require("jsonwebtoken");

// Function to Generate Token
const generateToken = (user) => {
    try {
        // Check if the required environment variable for JWT key is available
        if (!process.env.JWT_KEY) {
            throw new Error("JWT key is not defined in the environment variables.");
        }

        // Generate token using the user's name and email
        return jwt.sign({ name: user.name, email: user.email, role: user.role },process.env.JWT_KEY);
    } catch (error) {
        console.error("Error generating token:", error.message);
        throw new Error("Token generation failed. Please try again.");
    }
};

module.exports = { generateToken };