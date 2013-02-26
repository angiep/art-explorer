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

    // Fetch information about the museum and all of the artworks within the museum
    var defMuseum = museum.getById(req.params.museum_id)
      , defArtworks = museum.getArtworksForMuseum(req.params.museum_id)
      , defArticle = new $.Deferred();

    // Once we've completed loading in the museum information, load in the article and geolocation for the museum
    defMuseum.then(function(museumInfo) {

        // Fetch geolocation if we don't already have it saved
        if (!museumInfo.location) {
            museum.getGeolocation(museumInfo).then(function(geo) {
                museum.updateMuseum(museumInfo._id, { location: geo });
            });
        }

        // Fetch article
        museum.getArticle(museumInfo).then(function(article) {
            museumInfo.articleText = article;
            defArticle.resolve(museumInfo);
        });

    });

    // We've fully retrieved everything we need
    $.when(defArtworks, defArticle).done(function(artworks, museumInfo) {

        // Fetch the imageURL for this museum
        var imageParameters = { maxheight: 400, maxwidth: 900, mode: 'fillcropmid', key: freebase.key }
        museumInfo.imageURL = utils.generateURL(freebase.images, museumInfo.image[0].id, imageParameters);

        // Build up our parameters
        var parameters = {
            title: 'Art Explorer',
            subtitle: museumInfo.name,
            museum: museumInfo,
            artists: artworks
        };

        // Finally, render museum.ejs
        res.render('museum', parameters);
    });
};
