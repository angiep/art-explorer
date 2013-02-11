/*
 * routes/artist.js
 * Routing methods for artists
 */

var artist = require('../methods/artist')
    , utils = require('../utils');

/*
 * GET /artists - returns a list of artists
 */

exports.list = function(req, res){
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    if (req.query.name) {
        artist.searchByName(req.query.name, callback);
        return;
    }

    artist.getAll(callback, 0, 25);
};

/*
 * GET /artists/:id - returns an artist
 */

exports.info = function(req, res) {
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    artist.getById(req.params.artist_id, callback);
};

/*
 * GET /artists/:id/artworks - returns a list of artworks made by an artist
 */

exports.artworks = function(req, res) {
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    artist.getArtworksByArtist(req.params.artist_id, callback);
};
