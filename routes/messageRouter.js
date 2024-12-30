const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// MiddleWares
const { generateToken } = require("../middlewares/generateToken");
// Utilities
const { sendOTP } = require("../utils/sendOTP");
const userModel = require("../models/Role/userModel");
const messageModel = require("../models/Message/MessageModel");
const chatRoomModel = require("../models/Message/CharRoomModel");
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");
// const {generateOTP} = require("../utils/generateOTP");

router.get("/", (req,res)=>{
    console.log(req.query.sender)
    res.send({message:"jidfhjd"})
})

// Lease Form Submission Router
router.post("/send", async(req,res) => {
    try{

        let {messageData, token} = req.body;
        
        if(!messageData){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Destructuring Message Data
        const {
            sender,
            reciever,
            text
        } = messageData;

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

        const senderemail = await userModel.findOne({email: sender});
        const recieveremail = await userModel.findOne({email: reciever});

        if(!senderemail){
            return res.status(404).json({status: false, message: "Sender not found"});
        }else if(!recieveremail){
            return res.status(404).json({status: false, message: "Reciever not found"});
        }else if(!senderemail.verified){
            return res.status(404).json({status: false, message: "Sender Account is not Verified"});
        }else if(!recieveremail.verified){
            return res.status(404).json({status: false, message: "Reciever Account is not Verified"});
        }
        
        // Check if the given user role is Individual or not
        // if(user.role !== "Individual"){
        //     return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        // }

        await messageModel.create({
            sender,
            reciever,
            text,
            date: new Date()
        });

        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


// Lease Form Submission Router
router.get("/coversation", async(req,res) => {
    try{

        let {sender, reciever} = req.query;
        
        if(!sender || !reciever){
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

        const senderemail = await userModel.findOne({email: sender});
        const recieveremail = await userModel.findOne({email: reciever});


        if(!senderemail){
            return res.status(404).json({status: false, message: "Sender not found"});
        }else if(!recieveremail){
            return res.status(404).json({status: false, message: "Reciever not found"});
        }else if(!senderemail.verified){
            return res.status(404).json({status: false, message: "Sender Account is not Verified"});
        }else if(!recieveremail.verified){
            return res.status(404).json({status: false, message: "Reciever Account is not Verified"});
        }
        
        // Check if the given user role is Individual or not
        // if(user.role !== "Individual"){
        //     return res.status(403).json({status: false, message: "Access denied. Insufficient permissions"});
        // }

        const messages = await messageModel.find({
            $or:[
                {sender: sender, reciever: reciever},
                {sender: reciever, reciever: sender},
            ]
        }).sort({timestamp: 1});

        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully", message:messages});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


//  Chat Room Create Router
router.post("/chatroom/create", async(req,res) => {
    try{

        let {members, groupName, token} = req.body;
        
        if(!groupName || !token || !members){
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
        
        let members_list = [];
        if(members.length > 0){
            for(const email of members){
                members_list.push({email: email})
            }
        }

        const chatRoom_exist = await chatRoomModel.findOne({groupName});
        if(chatRoom_exist){
            return res.status(409).send({status: false, message: "Group already exists"});
        }

        await chatRoomModel.create({
            groupName,
            groupMessages:[],
            totalMembers: members_list.length,
            members: members_list,
            createdAt: new Date()
        });

        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


//  Chat Room Update Router
router.put("/chatroom/update", async(req,res) => {
    try{

        let {members, groupName, token} = req.body;
        
        if(!groupName || !token || !members){
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

        const chatRoom = await chatRoomModel.findOne({groupName});

        if(!chatRoom){
            return res.status(404).send({status: false, message: "Group not found"});
        }

        if(!chatRoom.members.some(member => member.email === user.email)){
            return res.status(409).send({status: false, message: "You are not a member of this group"});
        }
        
        let members_list = [];
        if (members.length > 0) {
            for (const email of members) {
                // Check if the email exists in chatRoom.members
                const memberExists = chatRoom.members.some(alemail => alemail.email === email);
                // IF member is not exist then add into a members_list 
                if (!memberExists) {
                    members_list.push({ email });
                }
            }
        }

        // Update the totalMembers count
        chatRoom.totalMembers += members_list.length;

        // Add the new members to the existing members array
        chatRoom.members = [...chatRoom.members, ...members_list];

        // Save the updated chatRoom
        await chatRoom.save();

        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

//  Chat Room Update Router
router.post("/chatroom/get-message", async(req,res) => {
    try{

        let {groupName, token} = req.body;
        
        if(!groupName || !token){
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

        const chatRoom = await chatRoomModel.findOne({groupName});
        if(!chatRoom){
            return res.status(404).send({status: false, message: "Group not found"});
        }
        
        if(!chatRoom.members.some(member => member.email === user.email)){
            return res.status(409).send({status: false, message: "You are not a member of this group"});
        }

        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully", groupMessages: chatRoom.groupMessages});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});


// Today
router.post("/usergroup", checkTokenVerify, async(req,res)=>{
  try{

        // Middleware data
        const user = req.user;
  
        const groups = await chatRoomModel.find({"members.email": user.email});
  
        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully", groups: groups, email: user.email});
  
    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
})


module.exports = router;