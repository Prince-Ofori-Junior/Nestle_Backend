const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFile = async (filePath, folder = 'tickets') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, { folder });
        return result.secure_url;
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        throw err;
    }
};

module.exports = { cloudinary, uploadFile };
