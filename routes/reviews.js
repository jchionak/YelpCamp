const express = require('express');
const wrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews');

const router = express.Router({ mergeParams: true });

router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview));

module.exports = router;