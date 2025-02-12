const mongoose = require("mongoose");

const propertyPurchaseSchema = ({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    propertypurchase: [{
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property'
        },
        approved:{
            type: Boolean,
            default: false
        },
        reject:{
            type: Boolean,
            default: false
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

module.exports = mongoose.model("Property Purchase", propertyPurchaseSchema);