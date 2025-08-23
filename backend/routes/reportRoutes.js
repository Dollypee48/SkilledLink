const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const { createReport, getReports, deleteReport } = require("../controllers/reportController");

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG or PNG files are allowed"));
  },
});

// Routes
router.post("/issues", auth, upload.single("file"), createReport);
router.get("/", auth, getReports);
router.delete("/:id", auth, deleteReport);

module.exports = router;
