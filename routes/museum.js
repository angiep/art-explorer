/*
 * routes/museum.js
 * Routing methods for museums
 */

var museum = require('../methods/museum')
    , $ = require('jquery')
    , utils = require('../utils')
    , global = require('../global')
    , freebase = global.freebase
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

        var defGeo = museum.getGeolocation(parsedMuseum);
        defGeo.then(function(geo) {
            museum.updateMuseum(parsedMuseum._id, { location: geo });
        });


        // TODO
        // Need to sanitize the article because not sanitizing in the EJS file like I thought
        // Check to see if the article exists first
        var parameters = { format: 'plain', maxlength: 1000, key: freebase.key }
        var path = utils.generateURL(freebase.articlesPath, parsedMuseum.article[0].id, parameters);

        var options = {
            host: freebase.host,
            port: '443',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            path: path
        };

        // We need the article ID from the museum info before we can make this request
        common.makeExternalRequest(options).then(function(article) {
            defArticle.resolve(article.result);
        });
    });

    // We've fully retrieved everything we need
    $.when(defMuseum, defArtworks, defArticle).done(function(museumInfo, artworks, article) {

        parsedArtworks = JSON.parse(artworks);
        parsedMuseum.articleText = article;
        var artwork;

        parameters = { maxheight: 400, maxwidth: 900, mode: 'fillcropmid', key: freebase.key }
        parsedMuseum.imageURL = utils.generateURL(freebase.images, parsedMuseum.image[0].id, parameters);

        var data = {
            artists: parsedArtworks,
            museum: parsedMuseum
        }

        // Build up our parameters
        var parameters = {
            title: 'Art Explorer',
            subtitle: parsedMuseum.name,
            museum: parsedMuseum,
            artists: parsedArtworks,
            dump: JSON.stringify(data)
        };

        res.render('museum', parameters);
    });
        
};
