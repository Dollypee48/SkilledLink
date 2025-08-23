const express = require("express");
const router = express.Router();
const { createReview, getMyReviews, updateReview } = require("../controllers/reviewController");
const auth = require("../middleware/auth");

router.post("/", auth, createReview);       // POST /api/reviews
router.get("/me", auth, getMyReviews);      // GET  /api/reviews/me
router.put("/:id", auth, updateReview);     // PUT  /api/reviews/:id

module.exports = router;
