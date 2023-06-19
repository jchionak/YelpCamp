const express = require('express');
const wrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas');
const Review = require('../models/review');
const Campground = require('../models/campground');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

const router = express.Router({ mergeParams: true });

router.post('/', validateReview, wrapAsync(async (req, res) => {
    const id = req.params.id;
    const foundCampground = await Campground.findById(id);
    const review = new Review(req.body.review);
    foundCampground.reviews.push(review);
    await review.save();
    await foundCampground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${foundCampground._id}`);
}))

router.delete('/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted review!')
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;