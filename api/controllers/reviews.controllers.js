var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

mongoose.Promise = global.Promise;

// GET all reviews of a hotel
module.exports.reviewsGetAll = function (req, res) {
    var hotelId = req.params.hotelId;

    Hotel
        .findById(hotelId)
        .select('reviews')
        .exec(function (err, doc) {
            var response = {
                status: 200,
                message: []
            };
            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if (!doc) {
                console.log("Hotel id not found in database", id);
                response.status = 404;
                response.message = {
                    "message": "Hotel ID not found " + id
                };
            } else {
                response.message = doc.reviews ? doc.reviews : [];
            }
            res
                .status(response.status)
                .json(response.message);
        });
}

// GET single review
module.exports.reviewsGetOne = function (req, res) {
    var hotelId = req.params.hotelId;
    var reviewId = req.params.reviewId;

    Hotel
        .findById(hotelId)
        .select('reviews')
        .exec(function (err, hotel) {
            //var review = hotel.reviews.id(reviewId);
            var response = {
                status: 200,
                message: {}
            };

            if (err) {
                console.log("Error finding reviews");
                response.status = 500;
                response.message = err;
            } else if (!hotel) {
                console.log("Hotel id not found in database", id);
                response.status = 404;
                response.message = {
                    "message": "Hotel ID not found " + id
                };
            } else {
                // Get the review
                response.message = hotel.reviews.id(reviewId);
                // If the review doesn't exist Mongoose returns null
                if (!response.message) {
                    response.status = 404;
                    response.message = {
                        "message": "Review ID not found " + reviewId
                    };
                }
            }

            res
                .status(response.status)
                .json(response.message);
        });
};