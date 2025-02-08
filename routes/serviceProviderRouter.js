const express = require("express");
const router = express.Router();

// Models
const { checkTokenVerify } = require("../middlewares/checkTokenVerify");

// Test Route (Simple route to check if the service is running)
router.get("/", (req, res) => {
    res.send("Corporate is Running");
});


module.exports = router;