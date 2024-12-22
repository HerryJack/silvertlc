const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// MiddleWares
const { generateToken } = require("../middlewares/generateToken");
const cloudinary = require('cloudinary').v2;
// Utils
const { uploadFile } = require("../utils/fileupload");

// Models
const userModel = require("../models/userModel");
const coporateModel = require("../models/corporateUserModel");
const nonProfile_Form_Model = require("../models/Form/Corporate/NonProfitProfileFormModel");
const postService_Form_Model = require("../models/Form/Corporate/PostServiceOrPropertyFormModel");
const service_Form_Model = require("../models/Form/Corporate/ServiceFormModel");
const transport_Form_Model = require("../models/Form/Corporate/TransportFormModel");


// Test Route (Simple route to check if the service is running)
router.get("/", (req, res) => {
    res.send("Corporate is Running");
});

// Non-Profit Form Router
// ? Create
router.post("/nonprofit-form/submit", async(req,res) => {
    try{

        let {nonProfitFormData, token} = req.body;

        // Check both the data is in the string format or not
        if (typeof nonProfitFormData === 'string' || typeof token === 'string') {
            nonProfitFormData = JSON.parse(nonProfitFormData);
            token = JSON.parse(token);
        }
        
        if(!nonProfitFormData){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Non-Profit Form Data
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
            },
            businessProfile: {
                industry,
                companyName,
                DBA,
                dateOfEstablishment,
                address: bussinessAddress,
                mailingAddress,
                territoriesServiced,
                phoneAndFaxNumbers,
                emailAddress,
                websiteURL,
                noOfEmployees,
                businessDescription,
                vision,
                mission,
                valueStatement,
                servicesOffered,
                industryInformation,
            }
        } = nonProfitFormData;

        
        // Check If there is no File is uploaded
        const file = req.files.uploadFiles;
        if (!file) {
            return res.status(400).json({status: false, message: "No file uploaded" });
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
        
        // Check if the given user role is Corporate User or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Function to Upload the Files on Cloudinary One by One
        const uploadFile_URL_arr = await uploadFile(file);

        // Add No Profit Form data in Corporate user model
        const noProfit_form = await nonProfile_Form_Model.create({ 
            userId: user._id,
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
            businessProfile: {
                industry,
                companyName,
                DBA,
                dateOfEstablishment,
                address,
                mailingAddress,
                territoriesServiced,
                phoneAndFaxNumbers,
                emailAddress,
                websiteURL,
                noOfEmployees,
                businessDescription,
                vision,
                mission,
                valueStatement,
                servicesOffered,
                industryInformation,
            },
            uploadFiles : uploadFile_URL_arr,
            createdAt: new Date()
        });

        if (!noProfit_form) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting" });
        }

        // Non Profit Form Submitted Successfully
        res.status(200).json({status: true, message: "Non Profit Form Submitted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/nonprofit-form/get", async(req,res) => {
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
        
        // Check if the given user role is Corporate user or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get the No Profit Form data 
        const noProfit_form_data = await nonProfile_Form_Model.find({ userId: user._id });

        if (!noProfit_form_data) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Non Profit Form Send Successfully
        res.status(200).json({status: true, message: "Non Profit Form Data Send Successfully", form_data: noProfit_form_data});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/nonprofit-form/update", async(req,res) => {
    try{

        let {nonProfitFormData, form_id, token} = req.body;

        // Check both the data is in the string format or not
        if (typeof nonProfitFormData === 'string' || typeof token === 'string' || typeof form_id === 'string') {
            nonProfitFormData = JSON.parse(nonProfitFormData);
            token = JSON.parse(token);
            form_id = JSON.parse(form_id);
        }
        
        if(!nonProfitFormData || !form_id){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Non-Profit Form Data
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
            },
            businessProfile: {
                industry,
                companyName,
                DBA,
                dateOfEstablishment,
                address: bussinessAddress,
                mailingAddress,
                territoriesServiced,
                phoneAndFaxNumbers,
                emailAddress,
                websiteURL,
                noOfEmployees,
                businessDescription,
                vision,
                mission,
                valueStatement,
                servicesOffered,
                industryInformation,
            },
        } = nonProfitFormData;

        // Check If there is no File is uploaded
        const file = req.files.uploadFiles;
        if (!file) {
            return res.status(400).json({status: false, message: "No file uploaded" });
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
        
        // Check if the given user role is Corporate user or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // File Uploader Check 
        let fileUploader = false;
        let uploadFile_URL_arr;

        // Check File is in Array Format or Not
        if (Array.isArray(file)){
            if(file.length>0){
                // Ture File Uploader if array length is greater than 0
                fileUploader = true
                // Function to Upload the Files on Cloudinary One by One
                uploadFile_URL_arr = await uploadFile(file);
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Update No Profit Form data in Corporate user model
        const noProfit_form = await nonProfile_Form_Model.findOneAndUpdate(
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
                    },
                    businessProfile: {
                        industry,
                        companyName,
                        DBA,
                        dateOfEstablishment,
                        address,
                        mailingAddress,
                        territoriesServiced,
                        phoneAndFaxNumbers,
                        emailAddress,
                        websiteURL,
                        noOfEmployees,
                        businessDescription,
                        vision,
                        mission,
                        valueStatement,
                        servicesOffered,
                        industryInformation,
                    },
                }
            },
            { new: true }
        );

        if (!noProfit_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Update the Files 
        if (fileUploader) {
            // Push the files into the UploadFiles Array
            noProfit_form.uploadFiles.push(...uploadFile_URL_arr);
            await noProfit_form.save();
        }

        // Non Profit Form Updated Successfully
        res.status(200).json({status: true, message: "Non Profit Form Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.delete("/nonprofit-form/delete", async(req,res) => {
    try{

        let {form_id, token} = req.body;

        if(!nonProfitFormData || !form_id){
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
        
        // Check if the given user role is Corporate user or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Delete No Profit Form data in Corporate user model
        const noProfit_form = await nonProfile_Form_Model.findOneAndDelete({ _id: form_id });

        if (!noProfit_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Non Profit Form Deleted Successfully
        res.status(200).json({status: true, message: "Non Profit Form Deleted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


// Post-Service Form Router
// ? Create
router.post("/postservice-form/submit", async(req,res) => {
    try{

        let {postServiceFormData, token} = req.body;

        // Check both the data is in the string format or not
        if (typeof postServiceFormData === 'string' || typeof token === 'string') {
            postServiceFormData = JSON.parse(postServiceFormData);
            token = JSON.parse(token);
        }
        
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
        } = postServiceFormData;

        // Check If there is no File is uploaded
        const file = req.files.uploadFiles;
        if (!file) {
            return res.status(400).json({status: false, message: "No file uploaded" });
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
        
        // Check if the given user role is Corporate user or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }
        
        // Function to Upload the Files on Cloudinary One by One
        const uploadFile_URL_arr = await uploadFile(file);

        // Add Post Service form data in Corporate user model
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
              uploadFiles: uploadFile_URL_arr,
            createdAt: new Date()
        });

        if (!postservice) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting Form" });
        }

        // Post Service Form Submitted Successfully
        res.status(200).json({status: true, message: "Post Service Form Submitted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/postservice-form/get", async(req,res) => {
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
        
        // Check if the given user role is Coporate User or not
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
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/postservice-form/update", async(req,res) => {
    try{

        let {postServiceFormData, form_id, token} = req.body;

        // Check both the data is in the string format or not
        if (typeof postServiceFormData === 'string' || typeof token === 'string' || typeof form_id === 'string') {
            postServiceFormData = JSON.parse(postServiceFormData);
            token = JSON.parse(token);
            form_id = JSON.parse(form_id);
        }
        
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
        } = postServiceFormData;

        // Check If there is no File is uploaded
        const file = req.files.uploadFiles;
        if (!file) {
            return res.status(400).json({status: false, message: "No file uploaded" });
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
        
        // Check if the given user role is Coporate User or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // File Uploader Check 
        let fileUploader = false;
        let uploadFile_URL_arr;

        // Check File is in Array Format or Not
        if (Array.isArray(file)){
            if(file.length>0){
                // Ture File Uploader if array length is greater than 0
                fileUploader = true
                // Function to Upload the Files on Cloudinary One by One
                uploadFile_URL_arr = await uploadFile(file);
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
            postservice.uploadFiles.push(...uploadFile_URL_arr);
            await postservice.save();
        }

        // Post Service Form Updated Successfully
        res.status(200).json({status: true, message: "Post Service Form Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.delete("/postservice-form/delete", async(req,res) => {
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
        
        // Check if the given user role is Coporate User or not
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
router.post("/transport-form/submit", async(req,res) => {
    try{

        let {transportFormData, token} = req.body;
    
        // Check both the data is in the string format or not
        if (typeof transportFormData === 'string' || typeof token === 'string') {
            transportFormData = JSON.parse(transportFormData);
            token = JSON.parse(token);
        }

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
        } = transportFormData;

        // Check If there is no File is uploaded
        const file = req.files.uploadFiles;
        if (!file) {
            return res.status(400).json({status: false, message: "No file uploaded" });
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
        
        // Check if the given user role is Corporate User or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Function to Upload the Files on Cloudinary One by One
        const uploadFile_URL_arr = await uploadFile(file);

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
            uploadFiles : uploadFile_URL_arr,
            createdAt: new Date()
        });

        if (!transport) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting Form" });
        }

        // Transport Form Submitted Successfully
        res.status(200).json({status: true, message: "Transport Form Submitted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

//? Read
router.post("/transport-form/get", async(req,res) => {
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
        
        // Check if the given user role is Corporate User or not
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
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

//? Update
router.put("/transport-form/update", async(req,res) => {
    try{

        let {transportFormData, form_id, token} = req.body;

         // Check both the data is in the string format or not
         if (typeof transportFormData === 'string' || typeof token === 'string' || typeof form_id === 'string') {
            transportFormData = JSON.parse(transportFormData);
            token = JSON.parse(token);
            form_id = JSON.parse(form_id);
        }
        
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
        } = transportFormData;

        // Check If there is no File is uploaded
        const file = req.files.uploadFiles;
        if (!file) {
            return res.status(400).json({status: false, message: "No file uploaded" });
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
        
        // Check if the given user role is Corporate User or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // File Uploader Check 
        let fileUploader = false;
        let uploadFile_URL_arr;

        // Check File is in Array Format or Not
        if (Array.isArray(file)){
            if(file.length>0){
                // Ture File Uploader if array length is greater than 0
                fileUploader = true
                // Function to Upload the Files on Cloudinary One by One
                uploadFile_URL_arr = await uploadFile(file);
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
            transport.uploadFiles.push(...uploadFile_URL_arr);
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
router.delete("/transport-form/delete", async(req,res) => {
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
        
        // Check if the given user role is Corporate User or not
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
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Service Form Submission Router
// ? Create
router.post("/service-form/submit", async(req,res) => {
    try{

        let {serviceFormData, token} = req.body;

        // Check both the data is in the string format or not
        if (typeof serviceFormData === 'string' || typeof token === 'string') {
            serviceFormData = JSON.parse(serviceFormData);
            token = JSON.parse(token);
        }
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
            }
        } = serviceFormData;

        // Check If there is no File is uploaded
        const file = req.files.uploadFiles;
        if (!file) {
            return res.status(400).json({status: false, message: "No file uploaded" });
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
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }
        
        // Function to Upload the Files on Cloudinary One by One
        const uploadFile_URL_arr = await uploadFile(file);

        // Add Service form data in Corporate User model
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
            uploadFiles : uploadFile_URL_arr,
            createdAt: new Date()
        });

        if (!service) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting Form" });
        }

        // Service Form Submitted Successfully
        res.status(200).json({status: true, message: "Service Form Submitted Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/service-form/get", async(req,res) => {
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
        
        // Check if the given user role is Corporate user or not
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
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Update
router.put("/service-form/update", async(req,res) => {
    try{

        let {serviceFormData, form_id, token} = req.body;

         // Check both the data is in the string format or not
         if (typeof serviceFormData === 'string' || typeof token === 'string' || typeof form_id === 'string') {
            serviceFormData = JSON.parse(serviceFormData);
            token = JSON.parse(token);
            form_id = JSON.parse(form_id);
        }
        
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
        } = serviceFormData;

        // Check If there is no File is uploaded
        const file = req.files.uploadFiles;
        if (!file) {
            return res.status(400).json({status: false, message: "No file uploaded" });
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
        
        // Check if the given user role is Corporate user or not
        if(user.role !== "Service Provider"){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // File Uploader Check 
        let fileUploader = false;
        let uploadFile_URL_arr;

        // Check File is in Array Format or Not
        if (Array.isArray(file)){
            if(file.length>0){
                // Ture File Uploader if array length is greater than 0
                fileUploader = true
                // Function to Upload the Files on Cloudinary One by One
                uploadFile_URL_arr = await uploadFile(file);
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
            service.uploadFiles.push(...uploadFile_URL_arr);
            await service.save();
        }

        // Service Form Updated Successfully
        res.status(200).json({status: true, message: "Service Form Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Delete
router.delete("/service-form/delete", async(req,res) => {
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
        
        // Check if the given user role is Corporate user or not
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
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

module.exports = router;