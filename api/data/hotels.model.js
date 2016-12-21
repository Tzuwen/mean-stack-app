var mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    review: {
        type: String,
        required: true
    },
    createOn: {
        type: Date,
        default: Date.now
    }
});

var roomSchema = new mongoose.Schema({
    type: String,
    number: Number,
    description: String,
    photo: [String],
    price: Number
});

var hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    stars: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    description: String,
    photos: [String],
    currency: String,
    services: [String],
    reviews: [reviewSchema],// nestest document
    rooms: [roomSchema],
    location: {
        address: String,
        // store coordinations longitude (E/W), latitude (N/S) order
        coordinates: {
            type: [Number],
            index: '2dsphere'
        }
    }
});

//mongoose.model('Hotel', hotelSchema, 'hotels');
// the above can also written like bleow,
mongoose.model('Hotel', hotelSchema);
// the 'Hotel' will auto cast it self into lower cast and plural 
// this will map to the db collections in mongodb
