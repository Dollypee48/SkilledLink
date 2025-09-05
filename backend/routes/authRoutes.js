const express = require("express");
const router = express.Router();
const { register, login, refreshToken, updateProfile, changePassword, verifyEmail, resendVerificationEmail, forgotPassword, verifyResetCode, resetPassword } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.put("/profile", auth, updateProfile);
router.put("/change-password", auth, changePassword);

module.exports = router;
