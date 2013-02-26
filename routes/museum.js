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

    var defMuseum = museum.getById(req.params.museum_id)
      , defArtworks = museum.getArtworksForMuseum(req.params.museum_id)
      , defArticle = new $.Deferred()
      , parsedArtworks;

    defMuseum.then(function(museumInfo) {

        if (!museumInfo.location) {
            var defGeo = museum.getGeolocation(museumInfo);
            defGeo.then(function(geo) {
                museum.updateMuseum(museumInfo._id, { location: geo });
            });
        }

        var parameters = { format: 'plain', maxlength: 1000, key: freebase.key }
        var path = utils.generateURL(freebase.articlesPath, museumInfo.article[0].id, parameters);

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
        museumInfo.articleText = article;
        var artwork;

        parameters = { maxheight: 400, maxwidth: 900, mode: 'fillcropmid', key: freebase.key }
        museumInfo.imageURL = utils.generateURL(freebase.images, museumInfo.image[0].id, parameters);

        var data = {
            artists: parsedArtworks,
            museum: museumInfo
        }

        // Build up our parameters
        var parameters = {
            title: 'Art Explorer',
            subtitle: museumInfo.name,
            museum: museumInfo,
            artists: parsedArtworks,
            dump: JSON.stringify(data)
        };

        res.render('museum', parameters);
    });
        
};
