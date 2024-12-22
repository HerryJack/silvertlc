// Cloudinary Configuration
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET,
});

// Function to Upload File to Cloudinary
const uploadFileToCloudinary = async (filePath, folderName) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folderName,
        });
        // Clean up temporary files from the temp folder after upload to Cloudinary
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    throw new Error(`Cloudinary Upload Failed: ${err.message}`);
                }
            });
        }
        return result; 
    } catch (error) {
        throw new Error(`Cloudinary Upload Failed: ${error.message}`);
    }
};

module.exports = {uploadFileToCloudinary};