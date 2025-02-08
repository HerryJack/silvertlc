const express = require("express");
const router = express.Router();

// Models
const propertyPurchase_LeaseForm_Model = require("../models/Form/PropertyPurchase/PropertyPurchaseLeaseFormModel");
const propertyPurchase_RentalApplication_Model = require("../models/Form/PropertyPurchase/PropertyPurchaseRentalApplicationModel");
const propertyPurchase_RentalApplication_Approved_Model = require("../models/Form/PropertyPurchase/PropertyPurchaseRentalApplicationApprovedModel");
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");
const PropertyPurchase = require("../models/Purchase/PropertyPurchase");
const PostServiceOrPropertyFormModel = require("../models/Form/Corporate/PostServiceOrPropertyFormModel");

router.get("/", (req, res) => {
    res.send("Individual is Running");
});

// Property Purchase Lease Form Router
// ? Create
router.post("/leaseform/submit", checkTokenVerify, async(req,res) => {
    try{

        let {leaseFormData, propertyFormId, propertyId} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!leaseFormData || !propertyFormId || !propertyId){
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

        // Check Property Exists or not 
        const propertyFind = await PostServiceOrPropertyFormModel.findOne({_id: propertyId});
        
        // If propert doesnot exists
        if(!propertyFind){
            return res.status(404).send({status: false, message: "This property not found"})
        }

        const isproperytPurchase = await PropertyPurchase.findOne({"propertypurchase.propertyId": propertyId, "propertypurchase._id": propertyFormId, userId: user._id});

        if(!isproperytPurchase){
            return res.status(403).send({status: false, message: "User doesnot purchase this property"});
        }

        // Check if the user filled the rental form of this property or not
        const isRentalFormFilled = await propertyPurchase_RentalApplication_Approved_Model.findOne({propertyFormId: propertyFormId});
        if(!isRentalFormFilled){
            return res.status(400).send({status: false, message: "First filled the Rental form of this property"});
        }

        // Check if the lease form is reject or not
        if(isRentalFormFilled.reject){
            return res.status(403).send({status: false, message: "Your Rental form is rejected by the property owner"});
        }

        // Check if the lease form is approved or not
        if(!isRentalFormFilled.approved){
            return res.status(403).send({status: false, message: "Your Rental form is not approved by the property owner"});
        }

        // Create Property Purchase Lease Form
        await propertyPurchase_LeaseForm_Model.create({
                userId : user._id,
                propertyOwnerId: propertyFind.userId,
                propertyId: propertyId,
                propertyFormId: propertyFormId,
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

        // Property Purchase Lease Form Submitted Successfully
        res.status(200).json({status: true, message: "Property Purchase Lease Form Submitted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read - Individual
router.post("/leaseform/get-individual", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get the Property Purchase Lease Form data
        const leaseForm_data = await propertyPurchase_LeaseForm_Model.find({userId: user._id}).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);
    
        if(!leaseForm_data){
            return res.status(404).send({status: false, message: "User doesnot filled any lease form"});
        }

        res.status(200).json({status: true, message: "Property Purchased Lease Form Data", leaseFormData: leaseForm_data});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read - Property Owner
router.post("/leaseform/get-propertyowner", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check the given user role
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        const userProperties  = await PostServiceOrPropertyFormModel.find({userId: user._id}).select("_id");

        if (userProperties.length === 0 || !userProperties) {
            return res.status(404).json({ status: false, message: "No properties found for this user." });
        }

        const purchasedProperties = await propertyPurchase_LeaseForm_Model.find({
            propertyId: userProperties.map(property => property._id.toString()) 
        }).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);

        if (purchasedProperties.length === 0 || !purchasedProperties) {
            return res.status(404).json({ status: false, message: "No properties are purchased." });
        }

        res.status(200).json({status: true, message: "Property Purchased Lease Form Data", LeaseFormData: purchasedProperties});

    }catch(error){
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
        
        // Update Property Purchase Lease form data 
        const leaseform = await propertyPurchase_LeaseForm_Model.findOneAndUpdate(
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

        // Property Purchase Lease Form Updated Successfully
        res.status(200).json({status: true, message: "Property Purchase Lease Form Updated Successfully"});

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

        // Property Purchase Lease Form Delete
        const leaseform = await propertyPurchase_LeaseForm_Model.findOneAndDelete({_id: form_id});
        if(!leaseform){
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Property Purchase Lease Form Deleted Successfully
        res.status(200).json({status: true, message: "Property Purchase Lease Form Deleted Successfully"});

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

        // Get the Property Purcahse Lease Form data
        const leaseForm_data = await propertyPurchase_LeaseForm_Model.findOne({_id: formId}).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);

        if(!leaseForm_data){
            return res.status(404).send({status: false, message: "Something went wrong"});
        }

        res.status(200).json({status: true, message: "Property Purchased Lease Form Data", leaseFormData: leaseForm_data});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


// Property Purchase Rental Application Router
// ? Create
router.post("/rentalapplication/submit", checkTokenVerify, async(req,res) => {
    try{

        // Get Date From the body
        let {rentalapplicationdata, propertyFormId, propertyId} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!rentalapplicationdata || !propertyFormId || !propertyId){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Check Property Exists or not 
        const propertyFind = await PostServiceOrPropertyFormModel.findOne({_id: propertyId});
        
        // If propert doesnot exists
        if(!propertyFind){
            return res.status(404).send({status: false, message: "This property not found"})
        }

        const isproperytPurchase = await PropertyPurchase.findOne({"propertypurchase.propertyId": propertyId, "propertypurchase._id": propertyFormId, userId: user._id});

        if(!isproperytPurchase){
            return res.status(403).send({status: false, message: "User doesnot purchase this property"});
        }

        // Check if the user filled the rental form of this property or not
        const isRentalFormFilled = await propertyPurchase_RentalApplication_Approved_Model.findOne({propertyFormId: propertyFormId});
        if(!isRentalFormFilled){
            return res.status(400).send({status: false, message: "First filled the Rental form of this property"});
        }

        // Check if the lease form is reject or not
        if(isRentalFormFilled.reject){
            return res.status(403).send({status: false, message: "Your Rental form is rejected by the property owner"});
        }

        // Check if the lease form is approved or not
        if(!isRentalFormFilled.approved){
            return res.status(403).send({status: false, message: "Your Rental form is not approved by the property owner"});
        }

        // Create Property Purchase Rental Application 
        await propertyPurchase_RentalApplication_Model.create({
            userId: user._id,
            propertyOwnerId: propertyFind.userId,
            propertyId: propertyId,
            propertyFormId: propertyFormId,
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

        // Property Purchase Rental Application Form Submitted Successfully
        res.status(200).json({status: true, message: "Property Purchase Rental Application Form Submitted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read - Individual
router.post("/rentalapplication/get-individual", checkTokenVerify, async(req,res) => {
    try{
        // Middleware Data
        const user = req.user;
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get Property Purchase Rental Application Data
        const rentalapplication = await propertyPurchase_RentalApplication_Model.find({userId: user._id}).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);

        res.status(200).json({status: true, message: "Property Purchased Rental Application Form", rentalApplication_data: rentalapplication});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read - Property Owner
router.post("/rentalapplication/get-propertyowner", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check the given user role
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        const userProperties = await PostServiceOrPropertyFormModel.find({userId: user._id}).select("_id");

        if (userProperties.length === 0 || !userProperties) {
            return res.status(404).json({ status: false, message: "No properties found for this user." });
        }

        const purchasedProperties = await propertyPurchase_RentalApplication_Model.find({
            propertyId: userProperties.map(property => property._id.toString()) 
        }).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);

        if (purchasedProperties.length === 0 || !purchasedProperties) {
            return res.status(404).json({ status: false, message: "No properties are purchased." });
        }

        res.status(200).json({status: true, message: "Property Purchased Rental Application Form Data", RentalFormData: purchasedProperties});

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
        const rentalapplication = await propertyPurchase_RentalApplication_Model.findOneAndUpdate(
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

        // Property Purchase Rental Application Form Updated Successfully
        res.status(200).json({status: true, message: "Property Purchase Rental Application Form Updated Successfully"});

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

        // Property Purchase Rental Application Form Delete
        const rentalapplication = propertyPurchase_RentalApplication_Model.findOneAndDelete({_id: form_id})

        if(!rentalapplication){
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Property Purchased Rental Application Form Deleted Successfully
        res.status(200).json({status: true, message: "Property Purchased Rental Application Form Deleted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read Specific Rental Application Form Data
router.post("/rentalapplication/get-specific", checkTokenVerify, async(req,res) => {
    try{

        const {formId} = req.body;

        // Get Rental Application Data
        const rentalapplication = await propertyPurchase_RentalApplication_Model.find({_id: formId}).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);

        if(!rentalapplication){
            return res.status(404).send({status: false, message: "Something went wrong"});
        }

        // Property Purchased Rental Application Form Data Sent Successfully
        res.status(200).json({status: true, message: "Property Purchased Rental Application Form", rentalApplication_data: rentalapplication});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Property Purchase Rental Application Approved Router
// ? Create
router.post("/rentalapplication-request/submit", checkTokenVerify, async(req,res) => {
    try{

        // Get Date From the body
        let {rentalapplicationdata, propertyFormId, propertyId} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!rentalapplicationdata || !propertyFormId || !propertyId){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Check Property Exists or not 
        const propertyFind = await PostServiceOrPropertyFormModel.findOne({_id: propertyId});

        // If propert doesnot exists
        if(!propertyFind){
            return res.status(404).send({status: false, message: "This property not found"})
        }

        const isproperytPurchase = await PropertyPurchase.findOne({"propertypurchase.propertyId": propertyId, "propertypurchase._id": propertyFormId, userId: user._id});

        if(!isproperytPurchase){
            return res.status(403).send({status: false, message: "User doesnot purchase this property"});
        }

        // Create Property Purchase Rental Application 
        await propertyPurchase_RentalApplication_Approved_Model.create({
            userId: user._id,
            propertyOwnerId: propertyFind.userId,
            propertyId: propertyId,
            propertyFormId: propertyFormId,
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

        // Property Purchase Rental Application Form Submitted Successfully
        res.status(200).json({status: true, message: "Property Purchase Rental Application Form Submitted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read - Individual
router.post("/rentalapplication-request/get-individual", checkTokenVerify, async(req,res) => {
    try{
        // Middleware Data
        const user = req.user;
        
        // Check if the given user role is Individual or not
        if(user.role !== "Individual"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get Property Purchase Rental Application Data
        const rentalapplication = await propertyPurchase_RentalApplication_Approved_Model.find({userId: user._id}).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);

        res.status(200).json({status: true, message: "Property Purchased Rental Application Form", rentalApplication_data: rentalapplication});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Approved or Reject - Property Owner
router.post("/rentalapplication-request/approved-propertyowner", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;

        const {form_id, approved, reject} = req.body;

        if(!form_id || approved === undefined || reject === undefined){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        if ((!approved && !reject) || (approved && reject)) {
            return res.status(400).json({ status: false, message: "Either approved or reject must be true" });
        }
        
        // Check the given user role
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        const RentalFormFormData = await propertyPurchase_RentalApplication_Approved_Model.findOneAndUpdate(
            { _id: form_id },
            {
                $set: {
                    approved,
                    reject
                }
            }
        );

        if (!RentalFormFormData) {
            return res.status(404).json({ status: false, message: "Something went wrong or may be ID is incorrect" });
        }

        res.status(200).json({status: true, message: `Property Purchased Rental Application Form Data ${approved ? "Approved" : "Rejected"} Successfully`});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read - Property Owner
router.post("/rentalapplication-request/get-propertyowner", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check the given user role
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        const userProperties = await PostServiceOrPropertyFormModel.find({userId: user._id}).select("_id");

        if (userProperties.length === 0 || !userProperties) {
            return res.status(404).json({ status: false, message: "No properties found for this user." });
        }

        const purchasedProperties = await propertyPurchase_RentalApplication_Approved_Model.find({
            propertyId: userProperties.map(property => property._id.toString()) 
        }).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);

        if (purchasedProperties.length === 0 || !purchasedProperties) {
            return res.status(404).json({ status: false, message: "No properties are purchased." });
        }

        res.status(200).json({status: true, message: "Property Purchased Rental Application Form Data", RentalFormData: purchasedProperties});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/rentalapplication-request/update", checkTokenVerify, async(req,res) => {
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
        const rentalapplication = await propertyPurchase_RentalApplication_Approved_Model.findOneAndUpdate(
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

        // Property Purchase Rental Application Form Updated Successfully
        res.status(200).json({status: true, message: "Property Purchase Rental Application Form Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.delete("/rentalapplication-request/delete", checkTokenVerify, async(req,res) => {
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

        // Property Purchase Rental Application Form Delete
        const rentalapplication = propertyPurchase_RentalApplication_Approved_Model.findOneAndDelete({_id: form_id})

        if(!rentalapplication){
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Property Purchased Rental Application Form Deleted Successfully
        res.status(200).json({status: true, message: "Property Purchased Rental Application Form Deleted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read Specific Rental Application Form Data
router.post("/rentalapplication-request/get-specific", checkTokenVerify, async(req,res) => {
    try{

        const {formId} = req.body;

        // Get Rental Application Data
        const rentalapplication = await propertyPurchase_RentalApplication_Approved_Model.find({_id: formId}).populate([
            { path: "userId", select: "-_id name email" },      
            { path: "propertyOwnerId", select: "-_id name email" } 
        ]);

        if(!rentalapplication){
            return res.status(404).send({status: false, message: "Something went wrong"});
        }

        // Property Purchased Rental Application Form Data Sent Successfully
        res.status(200).json({status: true, message: "Property Purchased Rental Application Form", rentalApplication_data: rentalapplication});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


module.exports = router;