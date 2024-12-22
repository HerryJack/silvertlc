const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// MiddleWares
const { generateToken } = require("../middlewares/generateToken");

// Models
const userModel = require("../models/userModel");
const individualModel = require("../models/individualModel");
const rentalApplicationModel = require("../models/Form/Individual/RentalApplicationModel");
const leaseFormModel = require("../models/Form/Individual/LeaseFormModel");


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

        // Create Lease Form
        await leaseFormModel.create({
                userId : user._id,
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
        );

        // Lease Form Submitted Successfully
        res.status(200).json({status: true, message: "Lease Form Submitted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Lease Form Get Data Router
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

        // Get the Lease Form data
        const leaseForm_data = await leaseFormModel.find({userId: user._id});

        // Lease Form Submitted Successfully
        res.status(200).json({status: true, message: "Lease Form Data", leaseFormData: leaseForm_data});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Lease Form Update
router.put("/leaseform/update", async(req,res) => {
    try{

        let {leaseFormData, form_id, token} = req.body;
        
        if(!leaseFormData || !form_id){
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

        
        // Update Lease form data 
        const leaseform = await leaseFormModel.findOneAndUpdate(
            { _id: form_id },
            {
                $set: {
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
                }
            }
        );

        if(!leaseform){
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Lease Form Updated Successfully
        res.status(200).json({status: true, message: "Lease Form Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Lease Form Update
router.delete("/leaseform/update", async(req,res) => {
    try{

        let {form_id, token} = req.body;
        
        if(!form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
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
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Lease Form Delete
        const leaseform = leaseFormModel.findOneAndDelete({_id: form_id})

        if(!leaseform){
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Lease Form Updated Successfully
        res.status(200).json({status: true, message: "Lease Form Deleted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Rental Application Submission Router
router.post("/rentalapplication/submit", async(req,res) => {
    try{

        // Get Date From the body
        let {rentalapplicationdata, token} = req.body;
        
        if(!rentalapplicationdata){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
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
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Create Rental Application for Individual Model
        await rentalApplicationModel.create({
            userId: user._id,
            details:{
                date: rentalapplicationdata.details.date,
                firstName: rentalapplicationdata.details.firstName,
                lastName:  rentalapplicationdata.details.lastName,
                socialSecurity: rentalapplicationdata.details.socialSecurity,
                otherLastNames: rentalapplicationdata.details.otherLastNames,
                disabled: rentalapplicationdata.details.disabled,
                email: rentalapplicationdata.details.email,
                homePhone: rentalapplicationdata.details.homePhone,
                workPhone: rentalapplicationdata.details.workPhone,
                cellPhone: rentalapplicationdata.details.cellPhone,
                autoMobile: rentalapplicationdata.details.autoMobile,
                license: rentalapplicationdata.details.license,
                state: rentalapplicationdata.details.state,
                hearingFeedback: rentalapplicationdata.details.hearingFeedback,
            },
            employmentHistory:{
                companyName:{
                    currentEmployer: rentalapplicationdata.employmentHistory.companyName.currentEmployer,
                    previousEmployer: rentalapplicationdata.employmentHistory.companyName.previousEmployer
                },
                address:{
                    currentEmployer: rentalapplicationdata.employmentHistory.address.currentEmployer,
                    previousEmployer: rentalapplicationdata.employmentHistory.address.previousEmployer
                },
                phone:{
                    currentEmployer: rentalapplicationdata.employmentHistory.phone.currentEmployer,
                    previousEmployer: rentalapplicationdata.employmentHistory.phone.previousEmployer
                },
                supervisor:{
                    currentEmployer: rentalapplicationdata.employmentHistory.supervisor.currentEmployer,
                    previousEmployer: rentalapplicationdata.employmentHistory.supervisor.previousEmployer
                },
                position:{
                    currentEmployer: rentalapplicationdata.employmentHistory.position.currentEmployer,
                    previousEmployer: rentalapplicationdata.employmentHistory.position.previousEmployer
                },
                datesOfEmployment:{
                    currentEmployer: rentalapplicationdata.employmentHistory.datesOfEmployment.currentEmployer,
                    previousEmployer: rentalapplicationdata.employmentHistory.datesOfEmployment.previousEmployer
                },
                monthlyIncome:{
                    currentEmployer: rentalapplicationdata.employmentHistory.monthlyIncome.currentEmployer,
                    previousEmployer: rentalapplicationdata.employmentHistory.monthlyIncome.previousEmployer
                }
            },
            rentalHistory:{
                street:{
                    currentResidence: rentalapplicationdata.rentalHistory.street.currentResidence,
                    previousResidence: rentalapplicationdata.rentalHistory.street.previousResidence
                },
                cityStateZIP:{
                    currentResidence: rentalapplicationdata.rentalHistory.cityStateZIP.currentResidence,
                    previousResidence: rentalapplicationdata.rentalHistory.cityStateZIP.previousResidence
                },
                landlordManager:{
                    currentResidence: rentalapplicationdata.rentalHistory.landlordManager.currentResidence,
                    previousResidence: rentalapplicationdata.rentalHistory.landlordManager.previousResidence
                },
                phoneNumber:{
                    currentResidence: rentalapplicationdata.rentalHistory.phoneNumber.currentResidence,
                    previousResidence: rentalapplicationdata.rentalHistory.phoneNumber.previousResidence
                },
                monthlyPayment:{
                    currentResidence: rentalapplicationdata.rentalHistory.monthlyPayment.currentResidence,
                    previousResidence: rentalapplicationdata.rentalHistory.monthlyPayment.previousResidence
                },
                dates:{
                    currentResidence: rentalapplicationdata.rentalHistory.dates.currentResidence,
                    previousResidence: rentalapplicationdata.rentalHistory.dates.previousResidence
                },
                leavingReason:{
                    currentResidence: rentalapplicationdata.rentalHistory.leavingReason.currentResidence,
                    previousResidence: rentalapplicationdata.rentalHistory.leavingReason.previousResidence
                }
            },
            rentalHistoryBool:{
                bankruptcy: rentalapplicationdata.rentalHistoryBool.bankruptcy,
                convictedFelony: rentalapplicationdata.rentalHistoryBool.convictedFelony,
                rentalResidence: rentalapplicationdata.rentalHistoryBool.rentalResidence,
                rentalPayment: rentalapplicationdata.rentalHistoryBool.rentalPayment,
                payRent: rentalapplicationdata.rentalHistoryBool.payRent
            },
            emergencyContact1:{
                firstName: rentalapplicationdata.emergencyContact1.firstName,
                lastName: rentalapplicationdata.emergencyContact1.lastName,
                mi: rentalapplicationdata.emergencyContact1.mi,
                homePhone: rentalapplicationdata.emergencyContact1.homePhone,
                workPhone: rentalapplicationdata.emergencyContact1.workPhone,
                cellPhone: rentalapplicationdata.emergencyContact1.cellPhone
            },
            emergencyContact2:{
                firstName: rentalapplicationdata.emergencyContact2.firstName,
                lastName: rentalapplicationdata.emergencyContact2.lastName,
                mi: rentalapplicationdata.emergencyContact2.mi,
                homePhone: rentalapplicationdata.emergencyContact2.homePhone,
                workPhone: rentalapplicationdata.emergencyContact2.workPhone,
                cellPhone: rentalapplicationdata.emergencyContact2.cellPhone
            },
            authorizationReleaseInformation:{
                signature: rentalapplicationdata.authorizationReleaseInformation.signature,
                date: rentalapplicationdata.authorizationReleaseInformation.date
            },
            createdAt: new Date()
        });

        // Lease Form Submitted Successfully
        res.status(200).json({status: true, message: "Lease Form Submitted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Rental Application Get Data Router
router.post("/rentalapplication/get-data", async(req,res) => {
    try{

        // Get Date From the body
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

        // Get Rental Application Data
        const rentalapplication = await rentalApplicationModel.find({_id: form_id});

        // Rental Application Form Data Sent Successfully
        res.status(200).json({status: true, message: "Rental Application Form", rentalApplication_data: rentalapplication});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Rental Application Form Update
router.put("/rentalapplication/update", async(req,res) => {
    try{

        let {rentalapplicationdata, form_id, token} = req.body;
        
        if(!rentalapplicationdata || !form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
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
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        
        // Update Rental Application form data 
        const rentalapplication = await rentalApplicationModel.findOneAndUpdate(
            { _id: form_id },
            {
                $set: {
                    details:{
                        date: rentalapplicationdata.details.date,
                        firstName: rentalapplicationdata.details.firstName,
                        lastName:  rentalapplicationdata.details.lastName,
                        socialSecurity: rentalapplicationdata.details.socialSecurity,
                        otherLastNames: rentalapplicationdata.details.otherLastNames,
                        disabled: rentalapplicationdata.details.disabled,
                        email: rentalapplicationdata.details.email,
                        homePhone: rentalapplicationdata.details.homePhone,
                        workPhone: rentalapplicationdata.details.workPhone,
                        cellPhone: rentalapplicationdata.details.cellPhone,
                        autoMobile: rentalapplicationdata.details.autoMobile,
                        license: rentalapplicationdata.details.license,
                        state: rentalapplicationdata.details.state,
                        hearingFeedback: rentalapplicationdata.details.hearingFeedback,
                    },
                    employmentHistory:{
                        companyName:{
                            currentEmployer: rentalapplicationdata.employmentHistory.companyName.currentEmployer,
                            previousEmployer: rentalapplicationdata.employmentHistory.companyName.previousEmployer
                        },
                        address:{
                            currentEmployer: rentalapplicationdata.employmentHistory.address.currentEmployer,
                            previousEmployer: rentalapplicationdata.employmentHistory.address.previousEmployer
                        },
                        phone:{
                            currentEmployer: rentalapplicationdata.employmentHistory.phone.currentEmployer,
                            previousEmployer: rentalapplicationdata.employmentHistory.phone.previousEmployer
                        },
                        supervisor:{
                            currentEmployer: rentalapplicationdata.employmentHistory.supervisor.currentEmployer,
                            previousEmployer: rentalapplicationdata.employmentHistory.supervisor.previousEmployer
                        },
                        position:{
                            currentEmployer: rentalapplicationdata.employmentHistory.position.currentEmployer,
                            previousEmployer: rentalapplicationdata.employmentHistory.position.previousEmployer
                        },
                        datesOfEmployment:{
                            currentEmployer: rentalapplicationdata.employmentHistory.datesOfEmployment.currentEmployer,
                            previousEmployer: rentalapplicationdata.employmentHistory.datesOfEmployment.previousEmployer
                        },
                        monthlyIncome:{
                            currentEmployer: rentalapplicationdata.employmentHistory.monthlyIncome.currentEmployer,
                            previousEmployer: rentalapplicationdata.employmentHistory.monthlyIncome.previousEmployer
                        }
                    },
                    rentalHistory:{
                        street:{
                            currentResidence: rentalapplicationdata.rentalHistory.street.currentResidence,
                            previousResidence: rentalapplicationdata.rentalHistory.street.previousResidence
                        },
                        cityStateZIP:{
                            currentResidence: rentalapplicationdata.rentalHistory.cityStateZIP.currentResidence,
                            previousResidence: rentalapplicationdata.rentalHistory.cityStateZIP.previousResidence
                        },
                        landlordManager:{
                            currentResidence: rentalapplicationdata.rentalHistory.landlordManager.currentResidence,
                            previousResidence: rentalapplicationdata.rentalHistory.landlordManager.previousResidence
                        },
                        phoneNumber:{
                            currentResidence: rentalapplicationdata.rentalHistory.phoneNumber.currentResidence,
                            previousResidence: rentalapplicationdata.rentalHistory.phoneNumber.previousResidence
                        },
                        monthlyPayment:{
                            currentResidence: rentalapplicationdata.rentalHistory.monthlyPayment.currentResidence,
                            previousResidence: rentalapplicationdata.rentalHistory.monthlyPayment.previousResidence
                        },
                        dates:{
                            currentResidence: rentalapplicationdata.rentalHistory.dates.currentResidence,
                            previousResidence: rentalapplicationdata.rentalHistory.dates.previousResidence
                        },
                        leavingReason:{
                            currentResidence: rentalapplicationdata.rentalHistory.leavingReason.currentResidence,
                            previousResidence: rentalapplicationdata.rentalHistory.leavingReason.previousResidence
                        }
                    },
                    rentalHistoryBool:{
                        bankruptcy: rentalapplicationdata.rentalHistoryBool.bankruptcy,
                        convictedFelony: rentalapplicationdata.rentalHistoryBool.convictedFelony,
                        rentalResidence: rentalapplicationdata.rentalHistoryBool.rentalResidence,
                        rentalPayment: rentalapplicationdata.rentalHistoryBool.rentalPayment,
                        payRent: rentalapplicationdata.rentalHistoryBool.payRent
                    },
                    emergencyContact1:{
                        firstName: rentalapplicationdata.emergencyContact1.firstName,
                        lastName: rentalapplicationdata.emergencyContact1.lastName,
                        mi: rentalapplicationdata.emergencyContact1.mi,
                        homePhone: rentalapplicationdata.emergencyContact1.homePhone,
                        workPhone: rentalapplicationdata.emergencyContact1.workPhone,
                        cellPhone: rentalapplicationdata.emergencyContact1.cellPhone
                    },
                    emergencyContact2:{
                        firstName: rentalapplicationdata.emergencyContact2.firstName,
                        lastName: rentalapplicationdata.emergencyContact2.lastName,
                        mi: rentalapplicationdata.emergencyContact2.mi,
                        homePhone: rentalapplicationdata.emergencyContact2.homePhone,
                        workPhone: rentalapplicationdata.emergencyContact2.workPhone,
                        cellPhone: rentalapplicationdata.emergencyContact2.cellPhone
                    },
                    authorizationReleaseInformation:{
                        signature: rentalapplicationdata.authorizationReleaseInformation.signature,
                        date: rentalapplicationdata.authorizationReleaseInformation.date
                    }
                }
            }
        );

        if(!rentalapplication){
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Rental Application Form Updated Successfully
        res.status(200).json({status: true, message: "Rental Application Form Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Rental Application Form Update
router.delete("/rentalapplication/update", async(req,res) => {
    try{

        let {form_id, token} = req.body;
        
        if(!form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
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
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Rental Application Form Delete
        const rentalapplication = rentalApplicationModel.findOneAndDelete({_id: form_id})

        if(!rentalapplication){
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Rental Application Form Updated Successfully
        res.status(200).json({status: true, message: "Rental Application Form Deleted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


module.exports = router;