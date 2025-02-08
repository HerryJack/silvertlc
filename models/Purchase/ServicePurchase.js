const mongoose = require("mongoose");

const servicePurchaseSchema = ({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    servicepurchase: [{
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Serviceinfo'
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

module.exports = mongoose.model("Service Purchase", servicePurchaseSchema);