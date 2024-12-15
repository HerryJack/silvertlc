const mongoose = require("mongoose");

// Schema for Corporate User -----> Property or Service Form
const PropertySchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Corporate User', 
        required: true 
    },
    propertyDetails: {
        title: { type: String, required: true },
        listingID: { type: String, required: true },
        address: { type: String, required: true },
        price: { type: Number, required: true },
        propertyType: { type: String, required: true },
        status: { type: String, required: true },
        numberOfBedrooms: {type: Number, required: true},
        numberOfBathrooms: {type: Number, required: true},
        squareFootage: { type: Number, required: true },
        yearBuiltOrRemodeled: { type: String, required: true },
        parking: { type: String, required: true },
        utilities: { type: String, required: true },
        heatingAndCooling: {type: String, required: true},
        extraRooms: {type: Number, required: true},
        Appliances: {type: String, required: true},
        outdoorAreas: {type: String, required: true},
        amenities: {type: String, required: true},
        wheelchairRamp: { type: Boolean, required: true },
        description: { type: String, required: true }
      },
      location: {
        unitTitle: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        bedrooms: { type: Number, required: true },
        baths: { type: Number, required: true },
        managedBy: { type: String, required: true },
        amenities: { type: String, required: true }
      },
      neighborhood: {
        facts: { type: String, required: true },
        petsAllowed: { type: String, required: true },
        smokingAllowed: { type: String, required: true }
      },
      uploadFiles: [],
      createdAt: {
        type: Date,
        default: Date.now
      }
});

module.exports = mongoose.model('Property', PropertySchema);  
