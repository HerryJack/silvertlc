const express = require("express");
const router = express.Router();

// Models
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");
const signupjourneyFormModel = require("../models/Form/SignUpJourney/signupjourneyFormModel");


// Sign Up Journey Form
// ? Create
router.post("/create", checkTokenVerify, async(req,res) => {
    try{

        // Get Profile Details
        let {profileDetails} = req.body;

        // Middleware data
        const user = req.user;
        
        // If Profile Details not get
        if(!profileDetails){
            return res.status(400).json({status: false, message:  "Required fields are missing"});
        }

        const {
            firstName,
            lastName,
            email,
            mobileNumber,
            address,
            city,
            education,
            countryOfBirth,
            birthDate
        } = profileDetails;

        if(!firstName || !lastName || !email || !mobileNumber || !address || !city || !education || !countryOfBirth || !birthDate){
            return res.status(400).json({status: false, message:  "Required fields are missing"});
        }

        const signupJourneyForm_find = await signupjourneyFormModel.findOne({userId: user._id});

        if(signupJourneyForm_find){
            return res.status(403).send({status: false, messgae: "User already filled sign up journey form"});
        }

        const userProfile = await signupjourneyFormModel.create({
            userId: user._id,
            role: user.role,
            personalDetails:{
                firstName,
                lastName,
                email,
                mobileNumber,
                address,
                city,
                education,
                countryOfBirth,
                birthDate
            }
        });

        if (!userProfile) {
            return res.status(404).json({ status: false, message: "Something Went Wrong While Purchasing" });
        }

        // Sign Up Journey Form Submitted Successfully
        res.status(200).json({status: true, message: "Sign Up Journey Form Submitted Successfully"});

    }catch(error){
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// ? Read
router.post("/get", checkTokenVerify, async(req,res) => {
    try{

        // Middleware data
        const user = req.user;

        const signupJourneyForm_find = await signupjourneyFormModel.findOne({userId: user._id});

        if(!signupJourneyForm_find){
            return res.status(404).send({status: false, messgae: "Sign Up Journey Form not found or may be user not filled the form"});
        }

        // Sign up Journey Data Send Successfully
        res.status(200).json({status: true, message: "Sign up Journey Data Send Successfully", signUpJourneyData: signupJourneyForm_find});

    }catch(error){
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


module.exports = router;