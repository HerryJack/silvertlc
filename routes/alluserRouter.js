const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Utils
const { uploadFile } = require("../utils/fileupload");

// Models
const userModel = require("../models/Role/userModel");
const service_Form_Model = require("../models/Form/Corporate/ServiceFormModel");
const transport_Form_Model = require("../models/Form/Corporate/TransportFormModel");
const postService_Form_Model = require("../models/Form/Corporate/PostServiceOrPropertyFormModel");
const Profile_Form_Model = require("../models/Form/ProfileFormModel");
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");
const signupjourneyFormModel = require("../models/Form/SignUpJourney/signupjourneyFormModel");

// Test Route (Simple route to check if the service is running)
router.get("/", (req, res) => {
    res.send("allUser Route is Running");
});

// File Upload Route
router.post("/upload-file", async (req, res) => {
    try {
        // Check if file is uploaded
        if (!req.files || !req.files.uploadFiles) {
            return res.status(400).json({ status: false, message: "No file uploaded" });
        }

        // Extract the file from the request
        const file = req.files.uploadFiles;

        console.log(file)

        // Extract token and foldername from request body
        let {token, foldername } = req.body;  

        if(!foldername || !token){
            return res.status(400).send({status: false, message: "Required fields are missing"})
        }
        
        // Check token data is in the string format or not
         if (typeof token === 'string') {
            token = JSON.parse(token);
        }
        
        // Verify the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);  // Verifying the JWT token
        } catch (err) {
            return res.status(401).json({ status: false, message: "Invalid or Expired Token" });
        }

        // Find the user based on the decoded token
        const user = await userModel.findOne({ name: decoded.name, email: decoded.email, role: decoded.role });
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }

        // Check the given user role 
        if(!["Individual", "Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Upload the file to Cloudinary
        const uploadFile_URL_arr = await uploadFile(file, foldername);  // Upload the file to Cloudinary

        // Return the URL of the uploaded file
        res.status(200).json({ status: true, message: "File uploaded successfully", filesURL: uploadFile_URL_arr });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message });
    }
});

// Profile Form Router
// ? Create
router.post("/profile-form/submit", checkTokenVerify, async(req,res) => {
    try{

        let {profileFormData} = req.body;

        // Middleware data
        const user = req.user;
        
        if(!profileFormData || !profileFormData.personalDetails || !profileFormData.businessProfile || !profileFormData.uploadFiles){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Profile Form Data
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
            uploadFiles
        } = profileFormData;

        const{
            productPortfolio,
            awards,
            testimonials,
            certificate,
            specialDesigned
        } = uploadFiles;

        if(!productPortfolio || !awards || !testimonials || !certificate || !specialDesigned ){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Add Profile Form data in user model
        const profile_form = await Profile_Form_Model.create({ 
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
            uploadFiles : {
                productPortfolio: productPortfolio,
                awards: awards,
                testimonials: testimonials,
                certificate: certificate,
                specialDesigned: specialDesigned
            },
            createdAt: new Date()
        });

        if (!profile_form) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Submitting" });
        }

        const signupJourneyForm_find = await signupjourneyFormModel.findOneAndDelete({userId: user._id});

        // Profile Form Submitted Successfully
        res.status(200).json({status: true, message: `${user.role} user profile form submitted successfully`});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/profile-form/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Get the Profile Form data 
        const profile_form = await Profile_Form_Model.find({ userId: user._id });

        if (!profile_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Profile Form Send Successfully
        res.status(200).json({status: true, message: `${user.role} user profile form data send successfully`, form_data: profile_form});

    }catch(error){
        // Handle server errors gracefully
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

        if(!profileFormData || !form_id || !profileFormData.personalDetails || !profileFormData.businessProfile){
            return res.status(400).json({status: false, message: "Required fields are missing"})
        }

        // Destructuring Profile Form Data
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
            uploadFiles
        } = profileFormData;

        const{
            productPortfolio,
            awards,
            testimonials,
            certificate,
            specialDesigned
        } = uploadFiles

        if(!uploadFiles || !productPortfolio || !awards || !testimonials || !certificate || !specialDesigned){
            return res.status(400).json({status: false, message: "Required fields are missing"})
        }

        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }


        // File Uploader Check 
        let productPortfolioUploader = false;
        let awardsUploader = false;
        let testimonialsUploader = false;
        let certificateUploader = false;
        let specialDesignedUploader = false;

        // Check File is in Array Format or Not --------> productPortfolio
        if (Array.isArray(productPortfolio)){
            if(productPortfolio.length>0){
                // Ture File Uploader if array length is greater than 0
                productPortfolioUploader = true
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Check File is in Array Format or Not --------> awards
        if (Array.isArray(awards)){
            if(awards.length>0){
                // Ture File Uploader if array length is greater than 0
                awardsUploader = true
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Check File is in Array Format or Not --------> testimonials
        if (Array.isArray(testimonials)){
            if(testimonials.length>0){
                // Ture File Uploader if array length is greater than 0
                testimonialsUploader = true
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Check File is in Array Format or Not --------> certificate
        if (Array.isArray(certificate)){
            if(certificate.length>0){
                // Ture File Uploader if array length is greater than 0
                certificateUploader = true
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Check File is in Array Format or Not --------> certificate
        if (Array.isArray(certificate)){
            if(certificate.length>0){
                // Ture File Uploader if array length is greater than 0
                certificateUploader = true
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Check File is in Array Format or Not --------> specialDesigned
        if (Array.isArray(specialDesigned)){
            if(specialDesigned.length>0){
                // Ture File Uploader if array length is greater than 0
                specialDesignedUploader = true
            }
        }else{
            return res.status(409).send({status: false, message: "File Sending Format is Wrong"});
        }

        // Update Profile Form data 
        const profile_form = await Profile_Form_Model.findOneAndUpdate(
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

        if (!profile_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        const fileuploadRT = profile_form.uploadFiles;

        // Update the Files 
        if (productPortfolioUploader) {
            // Push the files into the UploadFiles Array
            fileuploadRT.productPortfolio.push(...productPortfolio);
            await profile_form.save();
        }
        // Update the Files 
        if (awardsUploader) {
            // Push the files into the UploadFiles Array
            fileuploadRT.awards.push(...awards);
            await profile_form.save();
        }
        // Update the Files 
        if (testimonialsUploader) {
            // Push the files into the UploadFiles Array
            fileuploadRT.testimonials.push(...testimonials);
            await profile_form.save();
        }
        // Update the Files 
        if (certificateUploader) {
            // Push the files into the UploadFiles Array
            fileuploadRT.certificate.push(...certificate);
            await profile_form.save();
        }
        // Update the Files 
        if (specialDesignedUploader) {
            // Push the files into the UploadFiles Array
            fileuploadRT.specialDesigned.push(...specialDesigned);
            await profile_form.save();
        }

        const signupJourneyForm_find = await signupjourneyFormModel.findOneAndDelete({userId: user._id});

        // Profile Form Updated Successfully
        res.status(200).json({status: true, message: `${user.role} user profile form updated successfully`});

    }catch(error){
        // Handle server errors gracefully
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
            return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        }

        // Delete Profile Form data 
        const profile_form = await Profile_Form_Model.findOneAndDelete({ _id: form_id });

        if (!profile_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Profile Form Deleted Successfully
        res.status(200).json({status: true, message: `${user.role} user profile form deleted successfully`});

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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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

// ? Get Transport Form Data of all the users
router.get("/transport-form/get-alluser", async(req,res) => {
    try{
        // Get the Transport Form data 
        const transport_form_data = await transport_Form_Model.find();

        // Transport Form Data Send Successfully
        res.status(200).json({status: true, message: "Transport form data send successfully", transportFormData: transport_form_data});

    }catch(error){
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
                industry1,
                serviceProvided1,
                specialityServices,
                advanceServiceShedule,
                industry2,
                serviceProvided2,
            },
            uploadFiles
        } = serviceFormData;
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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
                industry1,
                serviceProvided1,
                specialityServices,
                advanceServiceShedule,
                industry2,
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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
                industry1,
                serviceProvided1,
                specialityServices,
                advanceServiceShedule,
                industry2,
                serviceProvided2,
            },
            uploadFiles
        } = serviceFormData;
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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
                        industry1,
                        serviceProvided1,
                        specialityServices,
                        advanceServiceShedule,
                        industry2,
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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

// ? Get Service Form Data of all the users
router.get("/service-form/get-alluser", async(req,res) => {
    try{
        // Get the Transport Form data 
        const service_form_data = await service_Form_Model.find();

        // Service Form Data Send Successfully
        res.status(200).json({status: true, message: "Service form data send successfully", serviceFormData: service_form_data});

    }catch(error){
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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

        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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
        
        // Check the given user role 
        if(!["Service Provider", "Property Owner", "Hospital System/Managed Care Organizations", "Real Estate Professionals", "Non Profits"].includes(user.role)){
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

// ? Get PostService Form Data of all the users
router.get("/postservice-form/get-alluser", async(req,res) => {
    try{
        // Get the PostService Form data 
        const postService_form_data = await postService_Form_Model.find();

        // PostService Form Data Send Successfully
        res.status(200).json({status: true, message: "PostService form data send successfully", postServiceFormData: postService_form_data});

    }catch(error){
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// All User Get
router.get("/get-userdata", async(req,res)=>{
    try{

        const userfind = await userModel.find({verified: true}).select('-password -changePassword -verifiedtoken -verified -verifiedtokenExpiresAt -lastlogin -resetPasswordtoken -resetPasswordtokenExpiresAt -__v')

        res.status(200).json({status: true, message: "User Data Send Successfully", usersData: userfind});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// All User Get - With Name
router.get("/get-userdata-name", async(req,res)=>{
    try{
        const {name} = req.query;
         // Validate input
         if (!name) {
            return res.status(400).json({ status: false, message: "Name parameter is required" });
        }
        const userfind = await userModel.find({name: name, verified: true}).select('-password -changePassword -verifiedtoken -verified -verifiedtokenExpiresAt -lastlogin -resetPasswordtoken -resetPasswordtokenExpiresAt -__v')

        res.status(200).json({status: true, message: "User Data Send Successfully", usersData: userfind});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

module.exports = router;