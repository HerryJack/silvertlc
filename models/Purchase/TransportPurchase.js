const mongoose = require("mongoose");

const transportPurchaseSchema = ({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    transportpurchase: [{
        transportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transport'
        },
        purchaseDate: { 
            type: Date,
            default: Date.now
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Transport Purchase", transportPurchaseSchema);