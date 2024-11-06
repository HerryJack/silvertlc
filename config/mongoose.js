// Import Packages
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// use to acces the enivornment variables
dotenv.config();

// Mongoose Connect
mongoose.connect(process.env.MONGOOSE)
.then( function(){
    console.log("Connected");
}).catch(function(err){
    console.log(err);
})

module.exports = mongoose.connection;