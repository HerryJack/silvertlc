// Import All the Packages
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// Initialize Express App
const app = express();

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
const mongoose = require("./config/mongoose");

// Import Routers
const authenticationRouter = require("./routes/authenticationRouter");

// Middleware Configurations
app.use(cors()); // Enable CORS for frontend connection
app.use(express.json({ limit: '50mb' })); // Increase JSON body limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Routes
app.use("/authentication", authenticationRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ message: "An internal server error occurred." });
});

// Define Port and Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
