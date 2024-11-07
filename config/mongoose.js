// Import Packages
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Access the environment variables
dotenv.config();

// Mongoose Connection Function
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
    }
};

// Call the function to connect
connectToDatabase();

// Export the mongoose connection
module.exports = mongoose.connection;
