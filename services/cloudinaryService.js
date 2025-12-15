const cloudinary = require("cloudinary").v2;
const fs = require("fs");

module.exports = {
    uploadFile: async (filePath) => {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                folder: "nestle_support_system",
            });

            // Delete local temp file
            fs.unlinkSync(filePath);

            return result.secure_url;
        } catch (err) {
            console.error("Cloudinary upload error:", err);
            throw new Error("Failed to upload file");
        }
    }
};
