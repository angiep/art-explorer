/*
 * routes/artist.js
 * Routing methods for artists
 */

var artist = require('../../methods/artist')
    , utils = require('../../utils');

/*
 * GET /artists - returns a list of artists
 */

exports.list = function(req, res) {
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    if (req.query.name) {
        artist.searchByName(req.query.name).then(callback);
        return;
    }

    artist.getAll(
        req.query.cursor ? req.query.cursor : undefined, 
        req.query.sort ? req.query.sort : undefined,
        req.query.count ? req.query.count: undefined
    ).then(callback);
};

/*
 * GET /artists/:id - returns an artist
 */

exports.info = function(req, res) {
    artist.getById(req.params.artist_id).then(function(json) {
        utils.sendJson(res, json);
    });
};

/*
 * GET /artists/:id/artworks - returns a list of artworks made by an artist
 */
exports.artworks = function(req, res) {
    artist.getArtworksByArtist(req.params.artist_id).then(function(json) {
        utils.sendJson(res, json);
    });
};
