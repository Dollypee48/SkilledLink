const express = require("express");
const router = express.Router();
const { register, login, refreshToken, updateProfile, changePassword } = require("../controllers/authController");
const auth = require("../middleware/auth");

// Middleware for parsing JSON
router.use(express.json());

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

module.exports = router;
