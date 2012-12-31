/*
 * routes/artwork.js
 * Routing methods for artworks
 */

var artwork = require('../methods/artwork')
    , utils = require('../utils');

/*
 * GET /artworks - returns a list of artworks
 */

exports.list = function(req, res){
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    artwork.getAll(callback);
};


/*
 * GET /artworks/:id - returns an artwork
 */

exports.info = function(req, res) {
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    artwork.getById(req.params.artwork_id, callback);
};
