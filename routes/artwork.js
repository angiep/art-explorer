/*
 * routes/artwork.js
 * Routing methods for artworks
 */

var artwork = require('../methods/artwork')
    , utils = require('../utils');

/*
 * GET /artworks/:id - returns an artwork
 */

exports.info = function(req, res) {
    var defArtwork = artwork.getById(req.params.artwork_id);
    var defMuseum = artwork.getOwner(req.params.artwork_id);

    defArtwork.then(function(artwork) {
        var parsed = JSON.parse(artwork);

        var parameters = {
            title: 'Art Explorer',
            subtitle: parsed.name,
            artist: parsed.artist[0],
            artwork: parsed
        };

        res.render('artwork', parameters);
    });
};
