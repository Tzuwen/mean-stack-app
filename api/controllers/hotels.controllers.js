var dbconn = require('../data/dbconnection.js');
var hotelData = require('../data/hotel-data.json');
var ObjectId = require('mongodb').ObjectId;

module.exports.hotelsGetAll = function (req, res) {

    var db = dbconn.get();
    var collection = db.collection('hotels');// define collections

    var offset = 0;
    var count = 5;

    if (req.query && req.query.offset) {
        offset = parseInt(req.query.offset, 10);
    }

    if (req.query && req.query.count) {
        count = parseInt(req.query.count, 10);
    }

    // cast into array and return all docs
    collection
        .find()
        .skip(offset)
        .limit(count)
        .toArray(function (err, docs) {
            res
                .status(200)
                .json(docs);
        });
};

module.exports.hotelsGetOne = function (req, res) {
    var db = dbconn.get();
    var collection = db.collection('hotels');
    var hotelId = req.params.hotelId;

    collection
        .findOne({
            _id: ObjectId(hotelId)// remember to require ObjectId, var ObjectId = require('mongodb').ObjectId;
        }, function (err, doc) {
            res
                .status(200)
                .json(doc);
        });
};

module.exports.hotelsAddOne = function (req, res) {
    var db = dbconn.get();
    var collection = db.collection('hotels');
    var newHotel;

    if (req.body && req.body.name && req.body.stars) {
        newHotel = req.body;
        newHotel.stars = parseInt(req.body.stars, 10);// cast string into int
        collection.insertOne(newHotel, function (err, response) {
            res
                .status(201)
                .json(response.ops);
        });
    } else {
        res
            .status(400)
            .json({ message: "Required data missing from body" });
    }
};