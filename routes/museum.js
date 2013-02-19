/*
 * routes/museum.js
 * Routing methods for museums
 */

var museum = require('../methods/museum')
    , $ = require('jquery')
    , utils = require('../utils')
    , common = require('../common')
    , ce = require("cloneextend");

/*
 * GET /museums/:id - detail page for a museum
 */

exports.info = function(req, res) {

    var defMuseum = museum.getById(req.params.museum_id);
    var defArtworks = museum.getArtworksForMuseum(req.params.museum_id);
    var defArticle = new $.Deferred();

    var parsedMuseum, parsedArtworks;

    defMuseum.then(function(museumInfo) {

        parsedMuseum = JSON.parse(museumInfo);

        var options = {
            host: 'api.freebase.com',
            port: '80',
            path: '/api/trans/raw/' + parsedMuseum.article[0].id
        };

        // We need the article ID from the museum info before we can make this request
        common.makeExternalRequest(options).then(function(article) {
            defArticle.resolve(article);
        });
    });


    // We've fully retrieved everything we need
    $.when(defMuseum, defArtworks, defArticle).done(function(museumInfo, artworks, article) {

        parsedArtworks = JSON.parse(artworks);

        // Build up our parameters
        var parameters = {
            title: 'Art Explorer',
            subtitle: parsedMuseum.name,
            museum: parsedMuseum,
            article: article,
            artworks: parsedArtworks
        };

        res.render("museum", parameters);
    });
        
};
