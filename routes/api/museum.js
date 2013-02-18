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

    if (req.query.name) {
        museum.searchByName(req.query.name).then(callback);
        return;
    }

    museum.getAll(0, 25).then(callback);
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
    museum.getArtworksForMuseum(req.params.museum_id).then(function(json) {
        utils.sendJson(res, json);
    });
};
