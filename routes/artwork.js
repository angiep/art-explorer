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

    defArtwork.then(function(artwork) {

        var parameters = {
            title: 'Art Explorer',
            subtitle: artwork.name,
            artist: artwork.artist[0],
            artwork: artwork
        };

        res.render('artwork', parameters);
    });
};
