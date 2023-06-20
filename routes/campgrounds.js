const express = require('express');
const wrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const Campground = require('../models/campground');

const router = express.Router();

router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', isLoggedIn, (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Sign in to add new campgrounds.');
        return res.redirect('/login');
    }
    res.render('campgrounds/new');
})

router.post('/', isLoggedIn, validateCampground, wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Created new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id', wrapAsync(async (req, res) => {
    const id = req.params.id;
    try {
        const foundCampground = await Campground.findById(id).populate(
            {
                path: 'reviews',
                populate: {
                    path: 'author'
                }
            }
        ).populate('author');
        res.render('campgrounds/show', { campground: foundCampground });
    }
    catch (e) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
}))

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(async (req, res) => {
    const id = req.params.id;
    try {
        const foundCampground = await Campground.findById(id);
        res.render('campgrounds/edit', { campground: foundCampground })
    }
    catch (e) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
}))

router.put('/:id', isLoggedIn, isAuthor, validateCampground, wrapAsync(async (req, res) => {
    const id = req.params.id;
    try {
        const foundCampground = await Campground.findById(id);
        await Campground.updateOne({ _id: foundCampground._id }, req.body.campground)
        req.flash('success', 'Updated campground!')
        res.redirect(`/campgrounds/${foundCampground._id}`);
    }
    catch (e) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
}))

router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted campground!')
    res.redirect('/campgrounds');
}))

module.exports = router;