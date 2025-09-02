const express = require("express");
const router = express.Router();
const { createReview, getMyReviews, getArtisanReviews, getPublicArtisanReviews, updateReview, deleteReview } = require("../controllers/reviewController");
const auth = require("../middleware/auth");

router.post("/", auth, createReview);       // POST /api/reviews
router.get("/me", auth, getMyReviews);      // GET  /api/reviews/me
router.get("/artisan", auth, getArtisanReviews); // GET /api/reviews/artisan
router.get("/public/artisan/:artisanId", getPublicArtisanReviews); // GET /api/reviews/public/artisan/:artisanId (public)
router.put("/:id", auth, updateReview);     // PUT  /api/reviews/:id
router.delete("/:id", auth, deleteReview);  // DELETE /api/reviews/:id

module.exports = router;
