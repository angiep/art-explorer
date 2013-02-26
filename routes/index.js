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

    var defPopular = museum.getMuseumsByCategory('popular');
    var defModern = museum.getMuseumsByCategory('contemporary');
    
    $.when(defPopular, defModern).then(function(popCat, contCat) {
        categories.push(popCat);
        categories.push(contCat);

        callback(categories);
    });
};
