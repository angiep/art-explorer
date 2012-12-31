/*
 * routes/museum.js
 * Routing methods for museums
 */

var museum = require('../methods/museum');

/*
 * GET /museums - returns a list of museums
 */

exports.list = function(req, res){
    var callback = function(json) {
        res.send(json);
    };

    museum.getAll(callback);
};


/*
 * GET /museums/:id - returns a museum
 */

exports.info = function(req, res) {
    var callback = function(json) {
        res.send(json);
    };

    museum.getById(req.params.museum_id, callback);
};

/*
 * GET /museums/:id/artworks - returns a list of artworks in the museum
 */

exports.artworks = function(req, res) {
    museum.getArtworks(req.params.museum_id);
};