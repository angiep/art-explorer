var museum = require("../methods/museum")
    , utils = require("../utils")
    , ce = require("cloneextend");

/*
 * GET home page.
 */

exports.index = function(req, res){

    var callback = function(list) {

        var data = JSON.stringify(ce.clone(list));
        var parsed = JSON.parse(list);

        var parameters = {
            title: "Art Explorer",
            list: parsed,
            dump: data
        };

        res.render("index", parameters);
    };

    museum.getAll().then(callback);

};
