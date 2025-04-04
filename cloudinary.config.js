const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "whatsapp";
    let resourceType = "auto"; // Default
    let format;

    // 🔹 Check File Type
    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
      format = "png";
    } else if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
      format = "mp4";
    } else if (file.mimetype.startsWith("audio/")) {
      resourceType = "video";
      format = "mp3";
    } else if (file.mimetype === "application/pdf") {
      resourceType = "raw"; // PDFs must be uploaded as 'raw'
      format = "pdf";
    } else {
      resourceType = "raw"; // Fallback for other file types
    }

    return {
      folder: folder,
      resource_type: resourceType,
      format: format,
      type: "upload",
    };
  },
});

module.exports = { cloudinary, storage };
