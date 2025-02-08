const mongoose = require("mongoose");

const chatroomSchema = mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupType:{
        type: String,
        enum: ["private", "public"],
        default: "private"
    },
    groupMessages:[{
        sender: {
            type: String,
            required: true
        },
        imageMessage: [{
            type: String,
        }],
        textMessage:{
            type: String,
        },
        date:{
            type: Date,
            default: Date.now
        }
    }],
    totalMembers: {
        type: Number,
        required: true,
        default: 0
    },
    members: [{
        email:{
            type: String,
            required: true
        },
        unreadCount: {
            type: Number,
            default: 0
        }
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('chat room', chatroomSchema);