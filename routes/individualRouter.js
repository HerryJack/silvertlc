const express = require("express");
const router = express.Router();

// Models
const rentalApplicationModel = require("../models/Form/Individual/RentalApplicationModel");
const leaseFormModel = require("../models/Form/Individual/LeaseFormModel");
const IndividualProfileFormModel = require("../models/Form/Individual/IndividualProfileFormModel");
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");
const signupjourneyFormModel = require("../models/Form/SignUpJourney/signupjourneyFormModel");


// Test Route (Simple route to check if the service is running)
router.get("/", (req, res) => {
    res.send("Individual is Running");
});

// Profile Form Router
// ? Create
router.post("/profile-form/submit", checkTokenVerify, async(req,res) => {
    try{

        let {profileFormData} = req.body;

        // Middleware Data
        const user = req.user;
        
        if(!profileFormData){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Profile form data
        const {
            personalDetails: {
                firstName,
                lastName,
                mobileNumber,
                address,
                city,
                state,
                zip,
                email,
                education,
                countryOfBirth,
                birthDate,
            }
        } = profileFormData;

        if(!profileFormData.personalDetails){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Add Profile Form data in Individual Profile Form Model
        const individualprofile_form = await IndividualProfileFormModel.create({ 
            userId: user._id,
            role: user.role,
            personalDetails: {
                firstName,
                lastName,
                mobileNumber,
                address,
                city,
                state,
                zip,
                email,
                education,
                countryOfBirth,
                birthDate,
            },
            createdAt: new Date()
        });

        if (!individualprofile_form) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting" });
        }

        const signupJourneyForm_find = await signupjourneyFormModel.findOneAndDelete({userId: user._id});

        // Profile Form Submitted Successfully
        res.status(200).json({status: true, message: `${user.role} user profile form submitted successfully`});

    }catch(error){
        // Handle server errors 
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/profile-form/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get the Individual Profile Form Data
        const individualprofile_form = await IndividualProfileFormModel.find({ userId: user._id });

        if (!individualprofile_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Profile Form Data Send Successfully
        res.status(200).json({status: true, message: `${user.role} user profile form data send successfully`, form_data: individualprofile_form});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/profile-form/update", checkTokenVerify, async(req,res) => {
    try{

        let {profileFormData, form_id} = req.body;

        // Middleware data
        const user = req.user;

        if(!profileFormData || !form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring profile form data
        const {
            personalDetails: {
                firstName,
                lastName,
                mobileNumber,
                address,
                city,
                state,
                zip,
                email,
                education,
                countryOfBirth,
                birthDate,
            }
        } = profileFormData;
        
        // Check the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Update Individual profile form data
        const individualprofile_form = await IndividualProfileFormModel.findOneAndUpdate(
            { _id: form_id },
            {
                $set: {
                    personalDetails: {
                        firstName,
                        lastName,
                        mobileNumber,
                        address,
                        city,
                        state,
                        zip,
                        email,
                        education,
                        countryOfBirth,
                        birthDate,
                    }
                }
            },
            { new: true }
        );

        if (!individualprofile_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        const signupJourneyForm_find = await signupjourneyFormModel.findOneAndDelete({userId: user._id});

        // Profile Form Updated Successfully
        res.status(200).json({status: true, message: `${user.role} user profile form updated successfully`});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.delete("/profile-form/delete", checkTokenVerify, async(req,res) => {
    try{

        let {form_id} = req.body;

        // Middleware data
        const user = req.user;

        if(!form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }
        
        // Check the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Delete profile form data
        const individualprofile_form = await IndividualProfileFormModel.findOneAndDelete({ _id: form_id });

        if (!individualprofile_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Profile Form Deleted Successfully
        res.status(200).json({status: true, message: `${user.role} user profile form deleted successfully`});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Lease Form Router
// ? Create
router.post("/leaseform/submit", checkTokenVerify, async(req,res) => {
    try{

        let {leaseFormData} = req.body;

        // Middleware data
        const user = req.user;
        
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
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/leaseform/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get the Lease Form data
        const leaseForm_data = await leaseFormModel.find({userId: user._id});

        res.status(200).json({status: true, message: "Lease Form Data", leaseFormData: leaseForm_data});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/leaseform/update", checkTokenVerify, async(req,res) => {
    try{

        let {leaseFormData, form_id} = req.body;

        // Middleware data
        const user = req.user;
        
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
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.delete("/leaseform/delete", checkTokenVerify, async(req,res) => {
    try{

        let {form_id} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!form_id){
            return res.status(400).json({status: false, message: "Required fields are missing"})
        }
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Lease Form Delete
        const leaseform = await leaseFormModel.findOneAndDelete({_id: form_id});
        if(!leaseform){
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Lease Form Deleted Successfully
        res.status(200).json({status: true, message: "Lease Form Deleted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read Specific Lease Form Data
router.post("/leaseform/get-specific", checkTokenVerify, async(req,res) => {
    try{

        const {formId} = req.body;

        // Get the Lease Form data
        const leaseForm_data = await leaseFormModel.findOne({_id: formId});

        if(!leaseForm_data){
            return res.status(404).send({status: false, message: "Something went wrong"});
        }

        res.status(200).json({status: true, message: "Lease Form Data", leaseFormData: leaseForm_data});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Get Lease Form Data of all the users
router.get("/leaseform/get-alluser", async(req,res)=>{
    try{
        const leaseForm_data = await leaseFormModel.find();
        res.status(200).json({status: true, message: "Lease Form Data Send Successfully", leaseFormData: leaseForm_data});
    }catch(error){
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Rental Application Router
// ? Create
router.post("/rentalapplication/submit", checkTokenVerify, async(req,res) => {
    try{

        // Get Date From the body
        let {rentalapplicationdata} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!rentalapplicationdata){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
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

        // Rental Application Form Submitted Successfully
        res.status(200).json({status: true, message: "Rental Application Form Submitted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/rentalapplication/get", checkTokenVerify, async(req,res) => {
    try{
        // Middleware Data
        const user = req.user;
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get Rental Application Data
        const rentalapplication = await rentalApplicationModel.find({userId: user._id});

        // Rental Application Form Data Sent Successfully
        res.status(200).json({status: true, message: "Rental Application Form", rentalApplication_data: rentalapplication});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/rentalapplication/update", checkTokenVerify, async(req,res) => {
    try{

        let {rentalapplicationdata, form_id} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!rentalapplicationdata || !form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
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

// ? Delete
router.delete("/rentalapplication/delete", checkTokenVerify, async(req,res) => {
    try{

        let {form_id} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
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

        // Rental Application Form Deleted Successfully
        res.status(200).json({status: true, message: "Rental Application Form Deleted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Get Rental Application Form Data of all the users
router.get("/rentalapplication/get-alluser", async(req,res)=>{
    try{
        const rentalApplication_data = await rentalApplicationModel.find();
        res.status(200).json({status: true, message: "Rental Application Form Data Send Successfully", rentalApplicationData: rentalApplication_data});
    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read Specific Rental Application Form Data
router.post("/rentalapplication/get-specific", checkTokenVerify, async(req,res) => {
    try{

        const {formId} = req.body;

        // Get Rental Application Data
        const rentalapplication = await rentalApplicationModel.find({_id: formId});

        
        if(!rentalapplication){
            return res.status(404).send({status: false, message: "Something went wrong"});
        }

        // Rental Application Form Data Sent Successfully
        res.status(200).json({status: true, message: "Rental Application Form", rentalApplication_data: rentalapplication});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


module.exports = router;