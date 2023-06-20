const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const wrapAsync = require('./utils/WrapAsync');

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to do that!');
        return res.redirect('/login');
    } else {
        next()
    }
}

module.exports.isLoggedIn = isLoggedIn;

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.storeReturnTo = storeReturnTo;

const isAuthor = wrapAsync(async (req, res, next) => {
    const id = req.params.id;
    const foundCampground = await Campground.findById(id);
    if (!foundCampground.author.equals(req.user.id)) {
        req.flash('error', 'You do not have permission to do that!')
        res.redirect(`/campgrounds/${foundCampground._id}`);
    }
    next();
})

module.exports.isAuthor = isAuthor;

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

module.exports.validateCampground = validateCampground;

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

module.exports.validateReview = validateReview;

const isReviewAuthor = wrapAsync(async (req, res, next) => {
    const campgroundId = req.params.id;
    const reviewId = req.params.reviewId;
    const foundReview = await Review.findById(reviewId);
    if (!foundReview.author.equals(req.user.id)) {
        req.flash('error', 'You do not have permission to do that!')
        res.redirect(`/campgrounds/${campgroundId}`);
    }
    next();
})

module.exports.isReviewAuthor = isReviewAuthor;