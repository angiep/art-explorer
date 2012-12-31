exports.list = function(req, res){
  res.send("list of artists");
};

exports.info = function(req, res) {
    res.send("viewing artist with id of " + req.params.artist_id);
};
