// Import All the Packages
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");

// Initialize Express App
const app = express();

// Load Environment Variables
dotenv.config();

// Connect to MongoDB
const mongoose = require("./config/mongoose");

// Import Routers
const authRouter = require("./routes/authRouter");
const individualRouter = require("./routes/individualRouter");
const serviceProviderRouter = require("./routes/serviceProviderRouter");
const messageRouter = require("./routes/messageRouter");
const alluserRouter = require("./routes/alluserRouter");
const purchaseRouter = require("./routes/purchaseRoute");
const signupjourneyRouter = require("./routes/signupjourneyRouter");
const propertypurchaseformRouter = require("./routes/propertyPurchaseRouter");

// 
const userModel = require("./models/Role/userModel");
const chatroomModel = require("./models/Message/CharRoomModel");
const jwt = require("jsonwebtoken");

// Middleware Configurations
app.use(cors()); // Enable CORS for frontend connection
app.use(cookieParser());

// File Upload Middleware
app.use(fileUpload({useTempFiles: true, tempFileDir: '/tmp'}));
app.use(express.json({ limit: '50mb' })); // Increase JSON body limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/individual", individualRouter);
app.use("/api/v1/serviceprovider", serviceProviderRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/alluser", alluserRouter);
app.use("/api/v1/userpurchase", purchaseRouter);
app.use("/api/v1/signupjourney", signupjourneyRouter);
app.use("/api/v1/propertypurchaseform", propertypurchaseformRouter);


// Define Port and Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
