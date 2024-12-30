const express = require("express");
const router = express.Router();

// Models
const postService_Form_Model = require("../models/Form/Corporate/PostServiceOrPropertyFormModel");
const service_Form_Model = require("../models/Form/Corporate/ServiceFormModel");
const transport_Form_Model = require("../models/Form/Corporate/TransportFormModel");
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");

// Test Route (Simple route to check if the service is running)
router.get("/", (req, res) => {
    res.send("Corporate is Running");
});

// Post-Service Form Router
// ? Create
router.post("/postservice-form/submit", checkTokenVerify, async(req,res) => {
    try{

        let {postServiceFormData} = req.body;

        // Middleware data
        const user = req.user;

        if(!postServiceFormData){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Post Service Form Data
        const {
            propertyDetails: {
                title,
                listingID,
                address,
                price,
                propertyType,
                status,
                numberOfBedrooms,
                numberOfBathrooms,
                squareFootage,
                yearBuiltOrRemodeled,
                parking,
                utilities,
                heatingAndCooling,
                extraRooms,
                Appliances,
                outdoorAreas,
                amenities,
                wheelchairRamp,
                description
              },
              location: {
                unitTitle,
                address: locationAddress,
                city,
                state,
                zip,
                bedrooms,
                baths,
                managedBy,
                amenities: locationAmenities
              },
              neighborhood: {
                facts,
                petsAllowed,
                smokingAllowed
              },
              uploadFiles
        } = postServiceFormData;
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Add Post Service form data in Service user model
        const postservice = await postService_Form_Model.create({ 
            userId: user._id,
            propertyDetails: {
                title,
                listingID,
                address,
                price,
                propertyType,
                status,
                numberOfBedrooms,
                numberOfBathrooms,
                squareFootage,
                yearBuiltOrRemodeled,
                parking,
                utilities,
                heatingAndCooling,
                extraRooms,
                Appliances,
                outdoorAreas,
                amenities,
                wheelchairRamp,
                description
              },
              location: {
                unitTitle,
                address,
                city,
                state,
                zip,
                bedrooms,
                baths,
                managedBy,
                amenities
              },
              neighborhood: {
                facts,
                petsAllowed,
                smokingAllowed
              },
              uploadFiles: uploadFiles,
            createdAt: new Date()
        });

        if (!postservice) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting Form" });
        }

        // Post Service Form Submitted Successfully
        res.status(200).json({status: true, message: "Post Service Form Submitted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/postservice-form/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data 
        const user = req.user;

        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get Post Service form data
        const postservice_form_data = await postService_Form_Model.find({ userId: user._id });

        if (!postservice_form_data) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Post Service Form Data Send Successfully
        res.status(200).json({status: true, message: "Post Service Form Data Send Successfully", form_data: postservice_form_data});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/postservice-form/update", checkTokenVerify, async(req,res) => {
    try{

        let {postServiceFormData, form_id} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!postServiceFormData || !form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Post Service Form Data
        const {
            propertyDetails: {
                title,
                listingID,
                address,
                price,
                propertyType,
                status,
                numberOfBedrooms,
                numberOfBathrooms,
                squareFootage,
                yearBuiltOrRemodeled,
                parking,
                utilities,
                heatingAndCooling,
                extraRooms,
                Appliances,
                outdoorAreas,
                amenities,
                wheelchairRamp,
                description
              },
              location: {
                unitTitle,
                address: locationAddress,
                city,
                state,
                zip,
                bedrooms,
                baths,
                managedBy,
                amenities: locationAmenities
              },
              neighborhood: {
                facts,
                petsAllowed,
                smokingAllowed
              },
              uploadFiles
        } = postServiceFormData;
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // File Uploader Check 
        let fileUploader = false;

        // Check File is in Array Format or Not
        if (Array.isArray(uploadFiles)){
            if(uploadFiles.length>0){
                // Ture File Uploader if array length is greater than 0
                fileUploader = true;
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Update Post Service form data
        const postservice = await postService_Form_Model.findOneAndUpdate(
            { _id: form_id },
            {
                $set: {
                    propertyDetails: {
                        title,
                        listingID,
                        address,
                        price,
                        propertyType,
                        status,
                        numberOfBedrooms,
                        numberOfBathrooms,
                        squareFootage,
                        yearBuiltOrRemodeled,
                        parking,
                        utilities,
                        heatingAndCooling,
                        extraRooms,
                        Appliances,
                        outdoorAreas,
                        amenities,
                        wheelchairRamp,
                        description
                    },
                    location: {
                        unitTitle,
                        address,
                        city,
                        state,
                        zip,
                        bedrooms,
                        baths,
                        managedBy,
                        amenities
                    },
                    neighborhood: {
                        facts,
                        petsAllowed,
                        smokingAllowed
                    }
                }
            }
        );

        if (!postservice) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Update Files 
        if (fileUploader) {
            // Push the files into the UploadFiles Array
            postservice.uploadFiles.push(...uploadFiles);
            await postservice.save();
        }

        // Post Service Form Updated Successfully
        res.status(200).json({status: true, message: "Post Service Form Updated Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.delete("/postservice-form/delete", checkTokenVerify, async(req,res) => {
    try{

        let {form_id} = req.body;

        // Middleware data
        const user = req.user;

        if(!form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Delete Post Service form data
        const postservice = await postService_Form_Model.findOneAndDelete({ _id: form_id });

        if (!postservice) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Post Service Form Deleted Successfully
        res.status(200).json({status: true, message: "Post Service Form Deleted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Transport Form Router
// ? Create
router.post("/transport-form/submit", checkTokenVerify, async(req,res) => {
    try{

        let {transportFormData} = req.body;

        // Middleware data
        const user = req.user;

        // Check Transform data
        if(!transportFormData){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }
        // Destructuring Transport Form Data
        const {
            vehicleDetails:{
                name,
                email,
                phone,
                pickUpLocation,
                dropOffLocation,
                pickUpDate,
                pickUpTime,
                distance,
                companions,
                waitTime,
            },
            uploadFiles
        } = transportFormData;
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Add transport form data 
        const transport = await transport_Form_Model.create({ 
            userId: user._id,
            vehicleDetails:{
                name,
                email,
                phone,
                pickUpLocation,
                dropOffLocation,
                pickUpDate,
                pickUpTime,
                distance,
                companions,
                waitTime,
            },
            uploadFiles : uploadFiles,
            createdAt: new Date()
        });

        if (!transport) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting Form" });
        }

        // Transport Form Submitted Successfully
        res.status(200).json({status: true, message: "Transport Form Submitted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

//? Read
router.post("/transport-form/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get transport form data 
        const transport_form_data = await transport_Form_Model.find({ userId: user._id });

        if (!transport_form_data) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Transport Form Data Send Successfully
        res.status(200).json({status: true, message: "Transport Form Data Send Successfully", form_data: transport_form_data});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

//? Update
router.put("/transport-form/update", checkTokenVerify, async(req,res) => {
    try{

        let {transportFormData, form_id} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!transportFormData || !form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Transport Form Data
        const {
            vehicleDetails:{
                name,
                email,
                phone,
                pickUpLocation,
                dropOffLocation,
                pickUpDate,
                pickUpTime,
                distance,
                companions,
                waitTime,
            },
            uploadFiles
        } = transportFormData;
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // File Uploader Check 
        let fileUploader = false;

        // Check File is in Array Format or Not
        if (Array.isArray(uploadFiles)){
            if(uploadFiles.length>0){
                // Ture File Uploader if array length is greater than 0
                fileUploader = true;
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Update transport form data 
        const transport = await transport_Form_Model.findOneAndUpdate(
            { _id: form_id },
            {
                $set: {
                    vehicleDetails:{
                        name,
                        email,
                        phone,
                        pickUpLocation,
                        dropOffLocation,
                        pickUpDate,
                        pickUpTime,
                        distance,
                        companions,
                        waitTime,
                    }
                }
            }
        );

        if (!transport) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Update Files
        if (fileUploader) {
            // Push the files into the UploadFiles Array
            transport.uploadFiles.push(...uploadFiles);
            await transport.save();
        }

        // Transport Form Updated Successfully
        res.status(200).json({status: true, message: "Transport Form Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

//? Delete
router.delete("/transport-form/delete", checkTokenVerify, async(req,res) => {
    try{

        let {form_id} = req.body;

        // Middleware data
        const user = req.user;

        if(!form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Delete transport form data 
        const transport = await transport_Form_Model.findOneAndDelete({ _id: form_id });

        if (!transport) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be any technical problem" });
        }

        // Transport Form Deleted Successfully
        res.status(200).json({status: true, message: "Transport Form Deleted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Service Form Submission Router
// ? Create
router.post("/service-form/submit", checkTokenVerify, async(req,res) => {
    try{

        let {serviceFormData} = req.body;

        // Middleware data
        const user = req.user;

        if(!serviceFormData){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Service form Data
        const {
            serviceDetails:{
                companyName,
                address1,
                address2,
                phone,
                email,
                contactPerson,
                officeHours,
                website,
                indrustry1,
                serviceProvided1,
                specialityServices,
                advanceServiceShedule,
                indrustry2,
                serviceProvided2,
            },
            uploadFiles
        } = serviceFormData;
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Add Service form data in Service Provider model
        const service = await service_Form_Model.create({ 
            userId: user._id,
            serviceDetails:{
                companyName,
                address1,
                address2,
                phone,
                email,
                contactPerson,
                officeHours,
                website,
                indrustry1,
                serviceProvided1,
                specialityServices,
                advanceServiceShedule,
                indrustry2,
                serviceProvided2,
            },
            uploadFiles : uploadFiles,
            createdAt: new Date()
        });

        if (!service) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting Form" });
        }

        // Service Form Submitted Successfully
        res.status(200).json({status: true, message: "Service Form Submitted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/service-form/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check if the given user role is Sevice Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get Service form data
        const service_form_data = await service_Form_Model.find({ userId: user._id });

        if (!service_form_data) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be some technical probelm" });
        }

        // Service Form Data Send Successfully
        res.status(200).json({status: true, message: "Service Form Data Send Successfully", form_data: service_form_data});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/service-form/update", checkTokenVerify, async(req,res) => {
    try{

        let {serviceFormData, form_id} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!serviceFormData || !form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Service form Data
        const {
            serviceDetails:{
                companyName,
                address1,
                address2,
                phone,
                email,
                contactPerson,
                officeHours,
                website,
                indrustry1,
                serviceProvided1,
                specialityServices,
                advanceServiceShedule,
                indrustry2,
                serviceProvided2,
            },
            uploadFiles
        } = serviceFormData;
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // File Uploader Check 
        let fileUploader = false;

        // Check File is in Array Format or Not
        if (Array.isArray(uploadFiles)){
            if(uploadFiles.length>0){
                // Ture File Uploader if array length is greater than 0
                fileUploader = true;
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Update Service form data
        const service = await service_Form_Model.findOneAndUpdate(
            { _id: form_id },
            {
                $set: {
                    serviceDetails:{
                        companyName,
                        address1,
                        address2,
                        phone,
                        email,
                        contactPerson,
                        officeHours,
                        website,
                        indrustry1,
                        serviceProvided1,
                        specialityServices,
                        advanceServiceShedule,
                        indrustry2,
                        serviceProvided2,
                    },
                }
            }
        );

        if (!service) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be some technical probelm" });
        }

        // Update Files
        if (fileUploader) {
            // Push the files into the UploadFiles Array
            service.uploadFiles.push(...uploadFiles);
            await service.save();
        }

        // Service Form Updated Successfully
        res.status(200).json({status: true, message: "Service Form Updated Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.delete("/service-form/delete", checkTokenVerify, async(req,res) => {
    try{

        let {form_id} = req.body;

        // Middleware data
        const user = req.user;

        if(!form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }
        
        // Check if the given user role is Service Provider or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Delete Service form data
        const service = await service_Form_Model.findOneAndDelete({ _id: form_id });

        if (!service) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be some technical probelm" });
        }

        // Service Form Deleted Successfully
        res.status(200).json({status: true, message: "Service Form Deleted Successfully"});

    }catch(error){
        // Handle server errors
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

module.exports = router;