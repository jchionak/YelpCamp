const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers');
const mongoose = require('mongoose');

const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.random() * 25 + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/djxbuhpf2/image/upload/v1687371328/YelpCamp/gtzbwbgaw1ygaxzzvkgb.png',
                    filename: 'YelpCamp/gtzbwbgaw1ygaxzzvkgb',
                },
                {
                    url: 'https://res.cloudinary.com/djxbuhpf2/image/upload/v1687371328/YelpCamp/g9jo7sngojg5wumwefa1.jpg',
                    filename: 'YelpCamp/g9jo7sngojg5wumwefa1',
                },
                {
                    url: 'https://res.cloudinary.com/djxbuhpf2/image/upload/v1687371328/YelpCamp/wrf1fsquzmcazamklm2h.png',
                    filename: 'YelpCamp/wrf1fsquzmcazamklm2h',
                },
                {
                    url: 'https://res.cloudinary.com/djxbuhpf2/image/upload/v1687371328/YelpCamp/ln0mktrmx9yiu0ra8mzz.png',
                    filename: 'YelpCamp/ln0mktrmx9yiu0ra8mzz',
                }
            ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempore ipsam repellat expedita eos quas sunt odio voluptas, autem rem dolorem aspernatur sed incidunt cum. Autem ea a debitis unde necessitatibus.',
            price,
            author: '6490c32b85562e92539192cc'
        })
        await camp.save();
    }
}

seedDB().then(() => mongoose.connection.close());