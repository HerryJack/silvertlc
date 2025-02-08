// const  {uploadFileToCloudinary} = require("./cloudinary");

// // Function to Upload File to Cloudinary
// const uploadFile = async (file, foldername) => {
//     try {
//         let uploadFile_URL_arr = [];
        
//         // File Upload One by one using for...of
//         if (Array.isArray(file)) {
//             for (const image of file) {
//                 // File Upload
//                 const uploadFile_URL = await uploadFileToCloudinary(image.tempFilePath, foldername );

//                 // If File is not Uploaded Successfully
//                 if (!uploadFile_URL) {
//                     return res.status(400).json({ status: false, message: "Error in File Uploading on the Cloudinary" });
//                 }

//                 // Push to the array
//                 uploadFile_URL_arr.push(uploadFile_URL.secure_url);
//             }
//             return uploadFile_URL_arr;
//         } else{
//             throw new Error("File Sending Format is Wrong");
//         }
//     } catch (error) {
//         console.error("Error during file upload:", error);
//         throw error;
//     }
// };

// module.exports = {uploadFile};

const { uploadFileToCloudinary } = require("./cloudinary");

// Function to Upload File to Cloudinary
const uploadFile = async (file, foldername) => {
    try {
        let uploadFile_URL_arr = [];

        // If file is an array, handle multiple uploads
        if (Array.isArray(file)) {
            for (const image of file) {
                const uploadFile_URL = await uploadFileToCloudinary(image.tempFilePath, foldername);
                if (!uploadFile_URL) {
                    throw new Error("Error in File Uploading on Cloudinary");
                }
                uploadFile_URL_arr.push(uploadFile_URL.secure_url);
            }
        } else {
            // Handle single file upload
            const uploadFile_URL = await uploadFileToCloudinary(file.tempFilePath, foldername);
            if (!uploadFile_URL) {
                throw new Error("Error in File Uploading on Cloudinary");
            }
            uploadFile_URL_arr.push(uploadFile_URL.secure_url);
        }

        return uploadFile_URL_arr;
    } catch (error) {
        console.error("Error during file upload:", error);
        throw error;
    }
};

module.exports = { uploadFile };
