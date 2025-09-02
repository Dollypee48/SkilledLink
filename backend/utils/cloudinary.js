const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Uploads a file buffer (e.g., from base64 data URL) to Cloudinary
exports.uploadFile = async (fileBuffer, fileType, folder) => {
  try {
    const result = await cloudinary.uploader.upload(`data:${fileType};base64,${fileBuffer}`, {
      folder: `skilledlink/${folder}`, // Store in a specific folder within Cloudinary
    });
    return result; // Return the full result object, not just the URL
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw new Error("Failed to upload file to Cloudinary");
  }
};
