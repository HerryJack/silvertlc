const mongoose = require("mongoose");

const chatroomSchema = mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupMessages:[{
        sender: {
            type: String,
            required: true
        },
        isImage: {
            type: Boolean,
            required: true
        },
        message:{
            type: String,
            required: true
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
        }
    }],
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('chat room', chatroomSchema);