const userModel = require("../models/Role/userModel");
const jwt = require("jsonwebtoken");

async function checkToken(req, res, next){
    try{
        const {token} = req.body;
        if (!token) {
            return res.status(401).json({ status: false, message: "Access denied. No token provided." });
        }
        // Decode the token to extract user data
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);  // Verifying the JWT token
        } catch (err) {
            // If token is invalid or expired, return a 401 Unauthorized response
            return res.status(401).json({ status: false, message: "Invalid or Expired Token" });
        }
        
        // Find user by the decoded token's data
        const user = await userModel.findOne({ name: decoded.name, email: decoded.email, role: decoded.role });
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        
        req.user = user;
        next();
    }catch(error){
        // Handle error 
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
    
}

module.exports = {checkToken}