const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// MiddleWares
const { generateToken } = require("../middlewares/generateToken");

// Models
const userModel = require("../models/userModel");
const individualModel = require("../models/individualModel");


// Test Route (Simple route to check if the service is running)
router.get("/", (req, res) => {
    res.send("Individual is Running");
});

// Lease Form Submission Router
router.post("/leaseform/submit", async(req,res) => {
    try{

        let {leaseFormData, token} = req.body;
        
        if(!leaseFormData){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring leaseForm Data
        const {
            landlord,
            landlordAddress,
            tenant,
            tenantHomeAddress,
            tenantTradeName,
            demisedProperty,
            leaseTerm,
            commencementDate,
            rentalForTerm,
            securityDeposit,
            totalAtCommencement,
            permittedUse
        } = leaseFormData;

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
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Update or add lease form data in individual model
        const updatedUser = await individualModel.findOneAndUpdate(
            { _id: user._id },
            {
                $set: {
                    leaseForm: {
                        landlord,
                        landlordAddress,
                        tenant,
                        tenantHomeAddress,
                        tenantTradeName, 
                        demisedProperty,
                        leaseTerm,
                        commencementDate,
                        rentalForTerm,
                        securityDeposit,
                        totalAtCommencement,
                        permittedUse,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ status: false, message: "Individual not found" });
        }

        // Lease Form Submitted Successfully
        res.status(200).json({status: true, message: "Lease Form Submitted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// To the get the Lease Form data
router.post("/leaseform/get-data", async(req,res) => {
    try{

        let {token} = req.body;

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
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Lease Form Submitted Successfully
        res.status(200).json({status: true, message: "Lease Form Data", leaseFormData: user.leaseForm});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

module.exports = router;