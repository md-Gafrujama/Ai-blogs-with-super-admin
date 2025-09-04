import multer from "multer";
import path from "path";
import fs from "fs";

// Use /tmp directory which is writable in Vercel serverless functions
const uploadDir = "/tmp/uploads/";

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Fixed typo here
  }
});

const upload = multer({ storage });

export default upload;