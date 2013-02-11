/*
 * routes/artwork.js
 * Routing methods for artworks
 */

var artwork = require('../../methods/artwork')
    , utils = require('../../utils');

/*
 * GET /artworks - returns a list of artworks
 */

exports.list = function(req, res){
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    if (req.query.name) {
        artwork.searchByName(req.query.name, callback);
        return;
    }

    artwork.getAll(callback, 0, 25);
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
