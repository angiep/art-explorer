/*
 * routes/museum.js
 * Routing methods for museums
 */

var museum = require('../methods/museum')
    , utils = require('../utils')
    , common = require('../common')
    , ce = require("cloneextend");

/*
 * GET /museums/:id - detail page for a museum
 */

exports.info = function(req, res) {

    // TODO use deferreds here instead of having this ugly mess of callbacks
    museum.getById(req.params.museum_id, function(museum) {

        var data = JSON.stringify(ce.clone(museum));
        var parsed = JSON.parse(museum);

        var options = {
            host: 'api.freebase.com',
            port: '80',
            path: '/api/trans/raw/' + parsed.article[0].id
        };

        common.makeExternalRequest(options, function(article) {
            
            var parameters = {
                title: "Art Explorer",
                subtitle: parsed.name,
                museum: parsed,
                article: article,
                dump: data
            };

            res.render("museum", parameters);

        });

    });
};
