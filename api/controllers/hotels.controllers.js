// connection method using native driver and hard coded data
// var dbconn = require('../data/dbconnection.js');
// var ObjectId = require('mongodb').ObjectId;
// var hotelData = require('../data/hotel-data.json');

// connection method and model using mongoose
var mongoose = require('mongoose');
var Hotel = mongoose.model('Hotel');

// Query using lat & lng 
// A geoJSON point
var runGeoQuery = function (req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);

    if (isNaN(lng) || isNaN(lat)) {
        res
            .status(400)
            .json({
                "message": "If supplied in querystring, lng and lat must both be numbers"
            });
        return;
    }

    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };

    var geoOptions = {
        spherical: true,
        macDistance: 2000,
        num: 5
    };

    Hotel
        .geoNear(point, geoOptions, function (err, result, stats) {
            if (err) {
                console.log("Error finding hotels");
                res
                    .status(500)
                    .json(err);
            } else {
                res
                    .status(200)
                    .json(results);
            }
        });
};

module.exports.hotelsGetAll = function (req, res) {

    var offset = 0;
    var count = 5;
    var maxCount = 10;

    // if lng & lat has input, call runGeoQuery()
    if (req.query && req.query.lat && req.query.lng) {
        runGeoQuery(req, res);
        return;
    }

    if (req.query && req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }

    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }

    // if params are not number, stop query
    if (isNaN(offset) || isNaN(count)) {
        res
            .status(400)
            .json({ "message": "If supplied in querystring count and offset should numbers" });
        return;
    }

    if (count > maxCount) {
        res
            .status(400)
            .json({ "message": "Count limit of " + maxCount + " exceeded" });
        return;
    }

    //////////////
    // mongoose //
    //////////////
    Hotel
        .find()
        .skip(offset)
        .limit(count)
        .exec(function (err, hotels) {
            if (err) {
                console.log("Error finding hotels");
                res
                    .status(500)
                    .json(err);
            } else {
                console.log("Found hotels", hotels.length);
                res
                    .status(200)
                    .json(hotels);
            }
        });

    /////////////////////////
    // mongo native driver //
    ////////////////////////
    // var db = dbconn.get();
    // var collection = db.collection('hotels');// define collections
    //// cast into array and return all docs
    // collection
    //     .find()
    //     .skip(offset)
    //     .limit(count)
    //     .toArray(function (err, docs) {
    //         res
    //             .status(200)
    //             .json(docs);
    //     });
};

module.exports.hotelsGetOne = function (req, res) {
    var hotelId = req.params.hotelId;
    //////////////
    // mongoose //
    //////////////
    Hotel
        .findById(hotelId)
        .exec(function (err, doc) {
            var response = {
                status: 200,
                message: doc
            };

            if (err) {
                console.log("Error finding hotel");
                response.status = 500;
                response.message = err;
            } else if (!doc) {
                response.status = 404;
                response.message = { "message": "Hotel Id not found" };
            }
            res
                .status(response.status)
                .json(response.message);
        });

    /////////////////////////
    // mongo native driver //
    ////////////////////////
    // var db = dbconn.get();
    // var collection = db.collection('hotels');
    // collection
    //     .findOne({
    //         _id: ObjectId(hotelId)// remember to require ObjectId, var ObjectId = require('mongodb').ObjectId;
    //     }, function(err, doc) {
    //         res
    //             .status(200)
    //             .json(doc);
    //     });
};

var _splitArray = function (input) {
    var output;
    if (input && input.length > 0) {
        output = input.split(";");
    } else {
        output = [];
    }
    return output;
};

module.exports.hotelsAddOne = function (req, res) {
    //////////////
    // mongoose //
    //////////////
    Hotel
        .create({
            name: req.body.name,
            description: req.body.description,
            stars: parseInt(req.body.stars, 10),
            services: _splitArray(req.body.services),
            photos: _splitArray(req.body.photos),
            currency: req.body.currency,
            location: {
                address: req.body.address,
                coordinates: [
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
            }
        }, function (err, hotel) {
            if (err) {
                res
                    .status(400)
                    .json(err);
            } else {
                res
                    .status(201)
                    .json(hotel);
            }
        });



    /////////////////////////
    // mongo native driver //
    ////////////////////////
    // var newHotel;
    // var db = dbconn.get();
    // var collection = db.collection('hotels');

    // if (req.body && req.body.name && req.body.stars) {
    //     newHotel = req.body;
    //     newHotel.stars = parseInt(req.body.stars, 10);// cast string into int
    //     collection.insertOne(newHotel, function (err, response) {
    //         res
    //             .status(201)
    //             .json(response.ops);
    //     });
    // } else {
    //     res
    //         .status(400)
    //         .json({ message: "Required data missing from body" });
    // }
};

module.exports.hotelsUpdateOne = function (req, res) {
    var hotelId = req.params.hotelId;
    Hotel
        .findById(hotelId)
        .select("-reviews -rooms") // skip reviews and rooms data, just get hotel basic info
        .exec(function (err, doc) {
            var response = {
                status: 200,
                message: doc
            };

            if (err) {
                response.status = 500;
                response.message = err;
            } else if (!doc) {
                response.status = 404;
                response.message = { "message": "Hotel Id not found" };
            }

            if (response.status !== 200) {
                res
                    .status(response.status)
                    .json(response.message);
            } else {
                doc.name = req.body.name;
                doc.description = req.body.description;
                doc.stars = parseInt(req.body.stars, 10);
                doc.services = _splitArray(req.body.services);
                doc.photos = _splitArray(req.body.photos);
                doc.currency = req.body.currency;
                doc.location = {
                    address: req.body.address,
                    coordinates: [
                        parseFloat(req.body.lng),
                        parseFloat(req.body.lat)
                    ]
                };

                doc.save(function (err, hotelUpdated) {
                    if (err) {
                        res
                            .status(500)
                            .json(err);
                    } else {
                        res
                            .status(204)
                            .json();
                    }
                });
            }
        });
};