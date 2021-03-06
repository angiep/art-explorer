/*
 * routes/museum.js
 * Routing methods for museums
 */

var museum = require('../../methods/museum')
    , utils = require('../../utils');

/*
 * GET /museums - returns a list of museums
 */

exports.list = function(req, res){
    var callback = function(json) {
        utils.sendJson(res, json);
    };

    if (req.query.query) {
        museum.searchByName(req.query.query, req.query.count).then(callback);
        return;
    }

    museum.getAll(
        req.query.cursor ? req.query.cursor : undefined, 
        req.query.sort ? req.query.sort : undefined,
        req.query.count ? req.query.count: undefined
    )
    .then(callback);
};


/*
 * GET /museums/:id - returns a museum
 */

exports.info = function(req, res) {
    museum.getById(req.params.museum_id).then(function(json) {
        utils.sendJson(res, json);
    });
};

/*
 * GET /museums/:id/artworks - returns a list of artworks in the museum
 */

exports.artworks = function(req, res) {
    museum.getArtworksForMuseum(req.params.museum_id, true).then(function(json) {
        utils.sendJson(res, json);
    });
};
