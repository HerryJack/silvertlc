const express = require("express");
const router = express.Router();

// Utils

// Models
const postService_Form_Model = require("../models/Form/Corporate/PostServiceOrPropertyFormModel");
const Service_Form_Model = require("../models/Form/Corporate/ServiceFormModel");
const Transport_Form_Model = require("../models/Form/Corporate/TransportFormModel");
const propertyPurchase_Model = require("../models/Purchase/PropertyPurchase");
const ServicePurchaseFormModel = require("../models/Purchase/ServicePurchase");
const TransportPurchaseFormModel = require("../models/Purchase/TransportPurchase");
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");

router.get("/", (req,res)=>{
    res.send("Done");
})

// Poperty Purchase Router
// ? Create/Update
router.post("/property/add", checkTokenVerify, async(req,res) => {
    try{

        // Get Propert Form Id
        let {propertyFormId} = req.body;

        // Middleware data
        const user = req.user;
        
        // If Property Form Id not get
        if(!propertyFormId){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Check Property Exists or not 
        const propertyFind = await postService_Form_Model.findOne({_id: propertyFormId});

        // If propert doesnot exists
        if(!propertyFind){
            return res.status(404).send({status: false, message: "This property not found"})
        }

        // If current user already buy any property
        let propertyPurchase_Form_Find = await propertyPurchase_Model.findOne({userId: user._id});

        if(propertyPurchase_Form_Find){
            // Update the current user property purchase details
            if(propertyPurchase_Form_Find.propertypurchase)
            propertyPurchase_Form_Find.propertypurchase.push({propertyId: propertyFormId});
            propertyPurchase_Form_Find.save();
            // Property Purchased Successfully
            return res.status(200).json({status: true, message: "Property Purchased Successfully"});
        }

        // If current user doesnot purchase any property before
        propertyPurchase_Form_Find = await propertyPurchase_Model.create({
            userId: user._id,
            propertypurchase:[
                {
                    propertyId: propertyFormId
                }
            ]
        })

        if (!propertyPurchase_Form_Find) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Purchasing" });
        }

        // Property Purchased Successfully
        res.status(200).json({status: true, message: "Property Purchased Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/property/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Check if the user purchase any property or not
        const propertyPurchase_Find = await propertyPurchase_Model.findOne({userId: user._id}).populate([
            { path: "userId", select: "-password -changePassword -verifiedtoken -verified -verifiedtokenExpiresAt -lastlogin -resetPasswordtoken -resetPasswordtokenExpiresAt -__v" },      
            { path: "propertypurchase.propertyId", select: "-__v" } 
        ]);

        // If propert doesnot exists
        if(!propertyPurchase_Find){
            return res.status(404).send({status: false, message: "This user doesnot purchase any property"});
        }

        // Property Purchase Data Send Successfully
        res.status(200).json({status: true, message: "Property Purchase Data Send Successfully", propertyPurchaseData: propertyPurchase_Find});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.post("/property/delete", checkTokenVerify, async(req,res) => {
    try{

        // Get Propert Purchase Id
        let {propertyPurchaseId} = req.body;

        // Middleware data
        const user = req.user;
        
        // If Property Purchase Id not get
        if(!propertyPurchaseId){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Property Purchase Find
        const propertyPurchase_Find = await propertyPurchase_Model.findOne({ "propertypurchase._id": { $in: propertyPurchaseId } });
        if(!propertyPurchase_Find){
            return res.status(404).send({status: false, message: "Somehting went wrong or may be id is incorrect"});
        }

        // Delete the User Property Purchase
        const propertyPurchase_Delete = await propertyPurchase_Model.updateOne(
            { "propertypurchase._id": { $in: propertyPurchaseId } }, 
            { $pull: { propertypurchase: { _id: { $in: propertyPurchaseId } } } } 
        );

        if(!propertyPurchase_Delete){
            return res.status(404).send({status: false, message: "Somehting went wrong or may be id is incorrect"});
        }

        // Property Purchase Deleted Send Successfully
        res.status(200).json({status: true, message: "Property Purchase Deleted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Service Purchase Router
// ? Create/Update
router.post("/service/add", checkTokenVerify, async(req,res) => {
    try{

        // Get Service Form Id
        let {serviceFormId} = req.body;

        // Middleware data
        const user = req.user;
        
        // If Service Form Id not get
        if(!serviceFormId){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Check Service Exists or not 
        const serviceFind = await Service_Form_Model.findOne({_id: serviceFormId});

        // If service doesnot exists
        if(!serviceFind){
            return res.status(404).send({status: false, message: "This service not found"})
        }

        // If current user already buy any service
        let servicePurchase_Form_Find = await ServicePurchaseFormModel.findOne({userId: user._id});

        if(servicePurchase_Form_Find){
            // Update the current user service purchase details
            if(servicePurchase_Form_Find.servicepurchase)
                servicePurchase_Form_Find.servicepurchase.push({serviceId: serviceFormId});
                servicePurchase_Form_Find.save();
            // Property Purchased Successfully
            return res.status(200).json({status: true, message: "Service Purchased Successfully"});
        }

        // If current user doesnot purchase any service before
        servicePurchase_Form_Find = await ServicePurchaseFormModel.create({
            userId: user._id,
            servicepurchase:[
                {
                    serviceId: serviceFormId
                }
            ]
        })

        if (!servicePurchase_Form_Find) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Purchasing" });
        }

        // Service Purchased Successfully
        res.status(200).json({status: true, message: "Service Purchased Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/service/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Check if the user purchase any service or not
        const servicePurchase_Find = await ServicePurchaseFormModel.findOne({userId: user._id}).populate([
            { path: "userId", select: "-password -changePassword -verifiedtoken -verified -verifiedtokenExpiresAt -lastlogin -resetPasswordtoken -resetPasswordtokenExpiresAt -__v" },      
            { path: "servicepurchase.serviceId", select: "-__v" } 
        ]);

        // If service doesnot exists
        if(!servicePurchase_Find){
            return res.status(404).send({status: false, message: "This user doesnot purchase any service"});
        }

        // Service Purchase Data Send Successfully
        res.status(200).json({status: true, message: "Service Purchase Data Send Successfully", servicePurchaseData: servicePurchase_Find});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.post("/service/delete", checkTokenVerify, async(req,res) => {
    try{

        // Get Service Purchase Id
        let {servicePurchaseId} = req.body;

        // Middleware data
        const user = req.user;
        
        // If Service Purchase Id not get
        if(!servicePurchaseId){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Service Purchase Find
        const servicePurchase_Find = await ServicePurchaseFormModel.findOne({ "servicepurchase._id": { $in: servicePurchaseId } });
        if(!servicePurchase_Find){
            return res.status(404).send({status: false, message: "Somehting went wrong or may be id is incorrect"});
        }

        // Delete the User Service Purchase
        const servicePurchase_Delete = await ServicePurchaseFormModel.updateOne(
            { "servicepurchase._id": { $in: servicePurchaseId } }, 
            { $pull: { servicepurchase: { _id: { $in: servicePurchaseId } } } } 
        );

        if(!servicePurchase_Delete){
            return res.status(404).send({status: false, message: "Somehting went wrong or may be id is incorrect"});
        }

        // Service Purchase Deleted Successfully
        res.status(200).json({status: true, message: "Service Purchase Deleted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Poperty Purchase Router
// ? Create/Update
router.post("/transport/add", checkTokenVerify, async(req,res) => {
    try{

        // Get Transport Form Id
        let {transportFormId} = req.body;

        // Middleware data
        const user = req.user;
        
        // If Transport Form Id not get
        if(!transportFormId){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Check Transport Service Exists or not 
        const transportFind = await Transport_Form_Model.findOne({_id: transportFormId});

        // If transport service doesnot exists
        if(!transportFind){
            return res.status(404).send({status: false, message: "This transport service not found"})
        }

        // If current user already buy any transport service
        let transportPurchase_Form_Find = await TransportPurchaseFormModel.findOne({userId: user._id});

        if(transportPurchase_Form_Find){
            // Update the current user transport service purchase details
            if(transportPurchase_Form_Find.transportpurchase)
                transportPurchase_Form_Find.transportpurchase.push({transportId: transportFormId});
                transportPurchase_Form_Find.save();
                // Transport Service Purchased Successfully
                return res.status(200).json({status: true, message: "Transport Service Purchased Successfully"});
        }

        // If current user doesnot purchase any transport service before
        transportPurchase_Form_Find = await TransportPurchaseFormModel.create({
            userId: user._id,
            transportpurchase:[
                {
                    transportId: transportFormId
                }
            ]
        })

        if (!transportPurchase_Form_Find) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Purchasing" });
        }

        // Transport Service Purchased Successfully
        res.status(200).json({status: true, message: "Transport Service Purchased Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/transport/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Check if the user purchase any transport service or not
        const transportPurchase_Find = await TransportPurchaseFormModel.findOne({userId: user._id}).populate([
            { path: "userId", select: "-password -changePassword -verifiedtoken -verified -verifiedtokenExpiresAt -lastlogin -resetPasswordtoken -resetPasswordtokenExpiresAt -__v" },      
            { path: "transportpurchase.transportId", select: "-__v" } 
        ]);

        // If transport service doesnot exists
        if(!transportPurchase_Find){
            return res.status(404).send({status: false, message: "This user doesnot purchase any transport service"});
        }

        // Transport Service Purchase Data Send Successfully
        res.status(200).json({status: true, message: "Transport Service Purchase Data Send Successfully", transportPurchaseData: transportPurchase_Find});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.post("/transport/delete", checkTokenVerify, async(req,res) => {
    try{

        // Get Transport Purchase Id
        let {transportPurchaseId} = req.body;

        // Middleware data
        const user = req.user;
        
        // If Transport Purchase Id not get
        if(!transportPurchaseId){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check the given user role 
        if(!(user.role === "Individual")){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Transport Purchase Find
        const transportPurchase_Find = await TransportPurchaseFormModel.findOne({ "transportpurchase._id": { $in: transportPurchaseId } });
        if(!transportPurchase_Find){
            return res.status(404).send({status: false, message: "Somehting went wrong or may be id is incorrect"});
        }

        // Delete the User Transport Service Purchase
        const transportPurchase_Delete = await TransportPurchaseFormModel.updateOne(
            { "transportpurchase._id": { $in: transportPurchaseId } }, 
            { $pull: { transportpurchase: { _id: { $in: transportPurchaseId } } } } 
        );
        if(!transportPurchase_Delete){
            return res.status(404).send({status: false, message: "Somehting went wrong or may be id is incorrect"});
        }

        // Transport Service Purchase Deleted Successfully
        res.status(200).json({status: true, message: "Transport Service Purchase Form Deleted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});



module.exports = router;