const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Utils
const { uploadFile } = require("../utils/fileupload");

// Models
const userModel = require("../models/Role/userModel");
const Profile_Form_Model = require("../models/Form/ProfileFormModel");
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");

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

        // Get the No Profit Form data 
        const profile_form = await Profile_Form_Model.find({ userId: user._id });

        if (!profile_form) {
            return res.status(404).json({ status: false, message: "Id is incorrect or may be other technical problem" });
        }

        // Non Profit Form Send Successfully
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

module.exports = router;