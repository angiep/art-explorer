var museum = require('../methods/museum');

exports.list = function(req, res){
    var callback = function(json) {
        res.send(json);
    };

    museum.getAll(callback);
};

exports.info = function(req, res) {
    var callback = function(json) {
        res.send(json);
    };

    museum.getById(req.params.museum_id, callback);
};

exports.artworks = function(req, res) {
    museum.getArtworks(req.params.museum_id);
};
