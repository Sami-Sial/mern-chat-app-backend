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
    let resourceType = "auto";
    let format;

    // 🔹 Check file type
    if (file.mimetype.startsWith("image/")) {
      resourceType = "image";
      format = "png";
    } else if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
      format = "mp4";
    } else if (file.mimetype.startsWith("audio/")) {
      resourceType = "video"; // Cloudinary handles audio under 'video'
      format = "mp3";
    } else if (file.mimetype === "application/pdf") {
      resourceType = "raw";
      format = "pdf";
    } else if (
      file.mimetype === "application/zip" ||
      file.mimetype === "application/x-zip-compressed"
    ) {
      resourceType = "raw";
      format = "zip";
    } else if (file.mimetype === "text/plain") {
      resourceType = "raw";
      format = "txt";
    } else {
      resourceType = "raw";
    }

    return {
      folder,
      resource_type: resourceType,
      format,
      type: "upload",
    };
  },
});

module.exports = { cloudinary, storage };
