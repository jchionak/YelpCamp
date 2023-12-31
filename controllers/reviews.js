const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const id = req.params.id;
    const foundCampground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    foundCampground.reviews.push(review);
    await review.save();
    await foundCampground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${foundCampground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted review!')
    res.redirect(`/campgrounds/${id}`)
}