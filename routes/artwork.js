var artwork = require('../methods/artwork');

exports.list = function(req, res){
    var callback = function(json) {
        res.send(json);
    };

    artwork.getAll(callback);
};

exports.info = function(req, res) {
    var callback = function(json) {
        res.send(json);
    };

    artwork.getById(req.params.artwork_id, callback);
};
