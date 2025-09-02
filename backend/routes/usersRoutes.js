const express = require('express');
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
// const multer = require('multer');
// const path = require('path');

const router = express.Router();

// Multer setup for profile image uploads - DISABLED to use Cloudinary instead
// const profileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/profileImages'); // Directory for profile images
//   },
//   filename: (req, file, cb) => {
//     cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

// const profileUpload = multer({
//   storage: profileStorage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPEG and PNG images are allowed!'), false);
//     }
//   },
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// });

router.get('/profile', auth, userController.getProfile);
// router.put('/profile', auth, userController.updateProfile); // DISABLED - using authController.updateProfile instead
router.delete('/profile', auth, userController.deleteProfile);
// router.post('/profile/picture', auth, profileUpload.single('profileImage'), userController.uploadProfilePicture); // DISABLED - using Cloudinary instead

module.exports = router;