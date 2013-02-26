/*
 * routes/artwork.js
 * Routing methods for artworks
 */

var artwork = require('../../methods/artwork')
    , utils = require('../../utils');

/*
 * GET /api/artworks - returns a list of artworks
 */

exports.list = function(req, res){
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    if (req.query.name) {
        artwork.searchByName(req.query.name).then(callback);
        return;
    }

    artwork.getAll(
        req.query.cursor ? req.query.cursor : undefined, 
        req.query.sort ? req.query.sort : undefined,
        req.query.count ? req.query.count: undefined
    ).then(callback);
};

/*
 * GET /api/artworks/:id - returns an artwork
 */
exports.info = function(req, res) {
    artwork.getById(req.params.artwork_id).then(function(json) {
        utils.sendJson(res, json);
    });
};
