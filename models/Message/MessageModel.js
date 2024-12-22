const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    sender:{
        type:String,
        required: true
    },
    reciever:{
        type: String,
        required: true
    },
    text:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('message', messageSchema);