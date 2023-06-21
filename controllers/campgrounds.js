const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const { cloudinary } = require('../cloudinary/index');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Created new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const id = req.params.id;
    try {
        const foundCampground = await Campground.findById(id);
        res.render('campgrounds/edit', { campground: foundCampground })
    }
    catch (e) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
}

module.exports.updateCampground = async (req, res) => {
    const id = req.params.id;
    try {
        const foundCampground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
        const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        foundCampground.images.push(...images);
        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await foundCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        }
        await foundCampground.save();
        req.flash('success', 'Updated campground!')
        res.redirect(`/campgrounds/${foundCampground._id}`);
    }
    catch (e) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
}

module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted campground!')
    res.redirect('/campgrounds');
}