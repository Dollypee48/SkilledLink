// backend/routes/issueRoutes.js
const express = require("express");
const router = express.Router();
const {
  createIssue,
  getIssuesByReporter,
  updateIssueStatus,
} = require("../controllers/issueController");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Files will be saved in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Multer file filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG images are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });


router.post("/", auth, upload.single("file"), createIssue);


router.get("/me", auth, getIssuesByReporter);


router.put("/:id/status", auth, updateIssueStatus);

module.exports = router;
