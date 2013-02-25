/*
 * methods/artwork.js
 * Database methods for artworks
 */

/*
 * Initialize database and global variables
 */

var mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , global = require('../global')
    , config = global.config
    , freebase = global.freebase
    , utils = require('../utils')
    , common = require('../common')
    , server = new mongodb.Server(config.development.db_server, 27017, {})
    , database = new mongodb.Db(config.development.db, server, {w: 1})
    , collectionName = 'artwork'
    , response = undefined;

/*
 * Retrieves a list of artworks
 */

exports.getAll = function(cursor, count) {
    return common.getAll(collectionName, cursor, count);
};

/*
 * Retrieves a single artwork by it's ID
 */

exports.getById = function(id) {
    return common.getById(collectionName, id);
};

exports.searchByName = function(name) {
    return common.searchByName(collectionName, name);
};

exports.generateImageURLs = function(artworks, parameters) {

    var artwork;

    for (var i = 0; i < artworks.length; i++) {
        artwork = artworks[i];
        artwork.imageURL = utils.generateFreebaseURL(freebase.images, artwork.image[0].id, parameters);
    }

    return artworks;
};

exports.getArtistsForArtworks = function(artworks) {

    var artwork
      , visualArtist
      , artistIDs = [];

    for (var i = 0; i < artworks.length; i++) {
        artwork = artworks[i];
        visualArtist = artwork.artist[0];
        if (visualArtist && !(artistIDs.indexOf(visualArtist) > -1)) artistIDs.push(visualArtist);
    }

    return common.getByIds('visual_artist', artistIDs, 'name', 1);
};



