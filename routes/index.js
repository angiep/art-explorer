var museum = require('../methods/museum')
    , utils = require('../utils');

/*
 * GET home page.
 */

exports.index = function(req, res){

    var callback = function(list) {

        var parsed = JSON.parse(list);

        var parameters = {
            title: 'Art Explorer',
            list: parsed
        };

        res.render('index', parameters);
    };

    museum.getAll(callback);

};
