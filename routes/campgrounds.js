const express = require('express');
const wrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../schemas')
const Campground = require('../models/campground');

const router = express.Router();

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    } else {
        next();
    }
}

router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Created new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id', wrapAsync(async (req, res) => {
    const id = req.params.id;
    const foundCampground = await Campground.findById(id);
    if (!foundCampground) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    foundCampground.populate('reviews');
    res.render('campgrounds/show', { campground: foundCampground });
}))

router.get('/:id/edit', wrapAsync(async (req, res) => {
    const id = req.params.id;
    const foundCampground = await Campground.findById(id);
    if (!foundCampground) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground: foundCampground })
}))

router.put('/:id', validateCampground, wrapAsync(async (req, res) => {
    const id = req.params.id;
    const foundCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Updated campground!')
    res.redirect(`/campgrounds/${foundCampground._id}`);
}))

router.delete('/:id', wrapAsync(async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted campground!')
    res.redirect('/campgrounds');
}))

module.exports = router;