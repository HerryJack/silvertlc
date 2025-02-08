const mongoose = require("mongoose");

// Schema for Porperty Purchase Rental Application
const propertyPurchaserentalApplicationSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true 
    },
    propertyOwnerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true 
    },
    propertyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property', 
        required: true 
    },
    propertyFormId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property Purchase', 
        required: true 
    },
    details:{
        date:{
            type: String,
            required: true
        },
        firstName:{
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        },
        socialSecurity:{
            type: String,
            required: true
        },
        otherLastNames:{
            type: String,
            required: true
        },
        disabled:{
            type: Boolean,
            required: true
        },
        email:{
            type: String,
            required: true
        },
        homePhone:{
            type: String,
            required: true
        },
        workPhone:{
            type: String,
            required: true
        },
        cellPhone:{
            type: String,
            required: true
        },
        autoMobile:{
            type: String,
            required: true
        },
        license:{
            type: String,
            required: true
        },
        state:{
            type: String,
            required: true
        },
        hearingFeedback:{
            type: String,
            required: true
        }
    },
    employmentHistory:{
        companyName:{
            currentEmployer: {
                type: String,
                required: true
            },
            previousEmployer:{
                type: String,
                required: true
            }
        },
        address:{
            currentEmployer: {
                type: String,
                required: true
            },
            previousEmployer:{
                type: String,
                required: true
            }
        },
        phone:{
            currentEmployer: {
                type: String,
                required: true
            },
            previousEmployer:{
                type: String,
                required: true
            }
        },
        supervisor:{
            currentEmployer: {
                type: String,
                required: true
            },
            previousEmployer:{
                type: String,
                required: true
            }
        },
        position:{
            currentEmployer: {
                type: String,
                required: true
            },
            previousEmployer:{
                type: String,
                required: true
            }
        },
        datesOfEmployment:{
            currentEmployer: {
                type: String,
                required: true
            },
            previousEmployer:{
                type: String,
                required: true
            }
        },
        monthlyIncome:{
            currentEmployer: {
                type: String,
                required: true
            },
            previousEmployer:{
                type: String,
                required: true
            }
        }
    },
    rentalHistory:{
        street:{
            currentResidence:{
                type: String,
                required: true
            },
            previousResidence:{
                type: String,
                required: true
            }
        },
        cityStateZIP:{
            currentResidence:{
                type: String,
                required: true
            },
            previousResidence:{
                type: String,
                required: true
            }
        },
        landlordManager:{
            currentResidence:{
                type: String,
                required: true
            },
            previousResidence:{
                type: String,
                required: true
            }
        },
        phoneNumber:{
            currentResidence:{
                type: String,
                required: true
            },
            previousResidence:{
                type: String,
                required: true
            }
        },
        monthlyPayment:{
            currentResidence:{
                type: String,
                required: true
            },
            previousResidence:{
                type: String,
                required: true
            }
        },
        dates:{
            currentResidence:{
                type: String,
                required: true
            },
            previousResidence:{
                type: String,
                required: true
            }
        },
        leavingReason:{
            currentResidence:{
                type: String,
                required: true
            },
            previousResidence:{
                type: String,
                required: true
            }
        }
    },
    rentalHistoryBool:{
        bankruptcy:{
            type: Boolean,
            required: true
        },
        convictedFelony:{
            type: Boolean,
            required: true
        },
        rentalResidence:{
            type: Boolean,
            required: true
        },
        rentalPayment:{
            type: Boolean,
            required: true
        },
        payRent:{
            type: Boolean,
            required: true
        }
    },
    emergencyContact1:{
        firstName:{
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        },
        mi:{
            type: String,
            required: true
        },
        homePhone:{
            type: String,
            required: true
        },
        workPhone:{
            type: String,
            required: true
        },
        cellPhone:{
            type: String,
            required: true
        }
    },
    emergencyContact2:{
        firstName:{
            type: String,
            required: true
        },
        lastName:{
            type: String,
            required: true
        },
        mi:{
            type: String,
            required: true
        },
        homePhone:{
            type: String,
            required: true
        },
        workPhone:{
            type: String,
            required: true
        },
        cellPhone:{
            type: String,
            required: true
        }
    },
    authorizationReleaseInformation:{
        signature:{
            type:String,
            required: true
        },
        date:{
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    approved:{
        type: Boolean,
        default: false
    },
    reject:{
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Propert Purchase Rental Application Approve', propertyPurchaserentalApplicationSchema);
