const express = require("express");
const router = express.Router();
const Pusher = require("pusher");
const jwt = require("jsonwebtoken");

// 
const chatRoomModel = require("../models/Message/CharRoomModel");
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");
const userModel = require("../models/Role/userModel");

// Utils
const { uploadFile } = require("../utils/fileupload");

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
});

// Chat Room Create Router - Public or Private
router.post("/chatroom/create", checkTokenVerify, async(req,res) => {
    try{

        let {members, groupName, groupType} = req.body;

        const user = req.user;

        if(!groupName || !members || !groupType){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }
        
        let members_list = [];
        members_list.push({email: user.email})
        if(members.length > 0){
            for(const email of members){
                if(user.email !== email){
                    members_list.push({email: email})
                }
            }
        }

        const chatRoom_exist = await chatRoomModel.findOne({groupName, groupType});
        if(chatRoom_exist){
            return res.status(409).send({status: false, message: "Group already exists"});
        }

        await chatRoomModel.create({
            groupName,
            groupType,
            groupMessages:[],
            totalMembers: members_list.length,
            members: members_list,
            createdAt: new Date()
        });

        // Chat Room Created Successfully
        res.status(200).json({status: true, message: "Chat Room Created Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// x---------------------------------x----------------------------x

// Chat Room Update Router - Private
router.put("/chatroom/update", checkTokenVerify, async(req,res) => {
    try{

        let {members, groupName} = req.body;
        
        if(!groupName || !members){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        //  Middleware Data
        const user = req.user;

        const chatRoom = await chatRoomModel.findOne({groupName, groupType: "private"});

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

        // Group Details Updated Successfully
        res.status(200).json({status: true, message: "Group Details Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Chat Room Get Message Router - Private
router.post("/chatroom/get-message", checkTokenVerify, async(req,res) => {
    try{

        let {groupName} = req.body;
        
        if(!groupName){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Middleware data
        const user = req.user;

        const chatRoom = await chatRoomModel.findOne({groupName, groupType: "private"});
        if(!chatRoom){
            return res.status(404).send({status: false, message: "Group not found"});
        }
        
        if(!chatRoom.members.some(member => member.email === user.email)){
            return res.status(409).send({status: false, message: "You are not a member of this group"});
        }

        // Group Messages Send Successfully
        res.status(200).json({status: true, message: "Group Messages Send Successfully", groupMessages: chatRoom.groupMessages});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// User Groups - Private
router.post("/usergroup", checkTokenVerify, async(req,res)=>{
  try{

        // Middleware data
        const user = req.user;
  
        const groups = await chatRoomModel.find({"members.email": user.email, groupType: "private"});
  
        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully", groups: groups});
  
    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
})

// Mark As Read - Private
router.post("/chatroom/markasread", checkTokenVerify, async(req,res)=>{
    try{
        // Middleware data
        const user = req.user;

        const {groupName} = req.body;

        if(!groupName){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }
        
        const chatRoom = await chatRoomModel.findOne({groupName, groupType: "private"});
        if(!chatRoom){
            return res.status(404).send({status: false, message: "Group not found"});
        }

        if(!chatRoom.members.some(member => member.email === user.email)){
            return res.status(409).send({status: false, message: "You are not a member of this group"});
        }

        // Reset unread count for this user
        chatRoom.members = chatRoom.members.map(member => {
            if (member.email === user.email) {
                member.unreadCount = 0;
            }
            return member;
        });

        await chatRoom.save();

        // Reset unread count Successfully
        res.status(200).json({status: true, message: "Reset unread count Successfully"});
      }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
      }
})

// PUSHER ------------->
// Send Message with pusher
router.post("/chatroom/sendmessage", async(req,res)=>{
    try{
        let {token, textMessage, groupName} = req.body;

        if(!token){
            return res.status(400).send({status: false, message: "Token is not provided"});
        }

        if(!groupName){
            return res.status(400).send({status: false, message: "Group Name is not provided"});
        }

        let isImage = true;

        // Check if file Send or not
        if (!req.files || !req.files.imageMessage) {
            isImage = false;
        }

        // Check if file or text message send or not
        if (!isImage && !textMessage) {
            return res.status(400).json({ status: false, message: "Message Data are missing. Please sent text or image message" });
        }

        let file;
        
        // If Image exits then extract the file from the request
        if(isImage){
            file = req.files.imageMessage;
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

        let uploadFile_URL_arr
        // Upload the file to Cloudinary
        if(isImage){
            uploadFile_URL_arr = await uploadFile(file, `Chat Message | ${groupName.trim()}`);  // Upload the file to Cloudinary
        }
        
        const chatRoom = await chatRoomModel.findOne({groupName});
        if(!chatRoom){
            return res.status(404).send({status: false, message: "Group not found"});
        }

        if(!chatRoom.members.some(member => member.email === user.email)){
            return res.status(409).send({status: false, message: "You are not a member of this group"});
        }

        const newMessage = {
            sender: user.email,
            imageMessage: isImage ? uploadFile_URL_arr : null,
            textMessage: textMessage || null,
            date: new Date(),
        };

        chatRoom.groupMessages.push(newMessage);

        // Update unread counts for other members
        chatRoom.members = chatRoom.members.map(member => {
            if (member.email !== user.email) {
                member.unreadCount += 1;
            }
            return member;
        });

        await chatRoom.save();

        pusher.trigger(groupName.replace(/ /g, ""), "send-message", {
            message: newMessage,
        });

        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully"});
      }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
      }
})

// x-------------------------------x-------------------------------x

// Chat Room Update Router - Public
router.put("/chatroom/public/update", checkTokenVerify, async(req,res) => {
    try{

        let {groupName} = req.body;
        
        if(!groupName){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        //  Middleware Data
        const user = req.user;

        const chatRoom = await chatRoomModel.findOne({groupName, groupType: "public"});

        if(!chatRoom){
            return res.status(404).send({status: false, message: "Group not found"});
        }
        
        let members_list = [];

        const memberExists = chatRoom.members.some(alemail => alemail.email === user.email);
        // IF member is not exist then add into a members_list 
        if (!memberExists) {
            chatRoom.members.push( {email: user.email} );
        }else{
            return res.status(403).send({status: false, message: "You have already member of this group"});
        }

        // Update the totalMembers count
        chatRoom.totalMembers += members_list.length;

        // Save the updated chatRoom
        await chatRoom.save();

        // Group Details Updated Successfully
        res.status(200).json({status: true, message: "Group Details Updated Successfully"});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// Chat Room Get Message Router
router.post("/chatroom/public/get-message", checkTokenVerify, async(req,res) => {
    try{

        let {groupName} = req.body;
        
        if(!groupName){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }

        // Middleware data
        const user = req.user;

        const chatRoom = await chatRoomModel.findOne({groupName, groupType: "public"});
        if(!chatRoom){
            return res.status(404).send({status: false, message: "Group not found"});
        }
        
        if(!chatRoom.members.some(member => member.email === user.email)){
            return res.status(409).send({status: false, message: "You are not a member of this group"});
        }

        // Group Messages Send Successfully
        res.status(200).json({status: true, message: "Group Messages Send Successfully", groupMessages: chatRoom.groupMessages});

    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
});

// User Groups
router.post("/public/usergroup", checkTokenVerify, async(req,res)=>{
  try{

        // Middleware data
        const user = req.user;
  
        const groups = await chatRoomModel.find({"members.email": user.email, groupType: "public"});
  
        // Message Send Successfully
        res.status(200).json({status: true, message: "Message Send Successfully", groups: groups});
  
    }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
    }
})

// Mark As Read
router.post("/chatroom/public/markasread", checkTokenVerify, async(req,res)=>{
    try{
        // Middleware data
        const user = req.user;

        const {groupName} = req.body;

        if(!groupName){
            return res.status(400).json({status: false, message:  "Required fields are missing"})
        }
        
        const chatRoom = await chatRoomModel.findOne({groupName, groupType: "public"});
        if(!chatRoom){
            return res.status(404).send({status: false, message: "Group not found"});
        }

        if(!chatRoom.members.some(member => member.email === user.email)){
            return res.status(409).send({status: false, message: "You are not a member of this group"});
        }

        // Reset unread count for this user
        chatRoom.members = chatRoom.members.map(member => {
            if (member.email === user.email) {
                member.unreadCount = 0;
            }
            return member;
        });

        await chatRoom.save();

        // Reset unread count Successfully
        res.status(200).json({status: true, message: "Reset unread count Successfully"});
      }catch(error){
        // Handle server errors gracefully
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error", error: error.message});
      }
})

// x---------------------------------x--------------------------------x

module.exports = router;