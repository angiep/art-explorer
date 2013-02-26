var museum = require('../methods/museum')
    , $ = require('jquery')
    , mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , utils = require('../utils')
    , ce = require('cloneextend');

/*
 * GET home page.
 */

exports.index = function(req, res){

    var callback = function(response) {

        var parameters = {
            title: 'Art Explorer',
            categories: response
        };

        res.render('index', parameters);
    };

    var categories = [];
    var coordinates = { latitude: 40.7275169, longitude: -74.0057193 };

    var defPopular = museum.getMuseumsByCategory('popular');
    var defModern = museum.getMuseumsByCategory('contemporary');

    // Perform a nearby search if we have coordinates
    if (coordinates) {
        var defNearby = new $.Deferred(); // This will not complete until we've grabbed both the nearby category and nearby museums
        var defNearbyMuseums = museum.getNearbyMuseums(coordinates, 100);
        var defNearbyCat = museum.getCategory('nearby');

        $.when(defNearbyMuseums, defNearbyCat).then(function(nearbyMuseums, nearbyCat) {
                var response = {
                    category: nearbyCat,
                    results: nearbyMuseums
                };
                defNearby.resolve(response);
        });
    }

    $.when(defPopular, defModern, defNearby).then(function(popResponse, contResponse, nearbyResponse) {

        nearbyResponse.results = museum.generateImageURLs(nearbyResponse.results, { maxheight : 200, maxwidth: 200, mode: 'fillcropmid' });
        popResponse.results = museum.generateImageURLs(popResponse.results, { maxheight : 200, maxwidth: 200, mode: 'fillcropmid' });
        contResponse.results = museum.generateImageURLs(contResponse.results, { maxheight : 200, maxwidth: 200, mode: 'fillcropmid' });

        categories.push(nearbyResponse);
        categories.push(popResponse);
        categories.push(contResponse);

        callback(categories);
    });
};
