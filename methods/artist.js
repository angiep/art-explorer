/*
 * methods/artist.js
 * Database methods for artists
 */

/*
 * Initialize database and global variables
 */

var mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , global = require('../global')
    , config = global.config
    , utils = require('../utils')
    , common = require('../common')
    , server = new mongodb.Server(config.development.db_server, 27017, {})
    , database = new mongodb.Db(config.development.db, server, {w: 1})
    , collectionName = 'visual_artist'
    , response = undefined;

exports.getAll = function(callback, offset, count) {
    common.getAll(collectionName, database, callback, offset, count);
};

exports.getById = function(id, callback) {
    common.getById(collectionName, database, callback, id);
};

exports.getArtworksByArtist = function(id, callback) {
   
    if (!utils.isValidId(id)) {
        if (typeof callback === 'function') callback(utils.formatError(global.errorMessages.incorrectParams));
        return;
    }
 
    database.open(function(error, client) {
        if (error) throw error;

        var artists = new mongodb.Collection(client, collectionName);
        var artworks;

        artists.findOne({'_id': new ObjectID(id)}, function(error, artist) {
            if (error) throw error;
            if (artist) {
                artworks = new mongodb.Collection(client, 'artworks');
                artworks.find({'artist': artist.name}).toArray(function(error, docs) {
                    response = JSON.stringify(docs);
                    if (typeof callback === 'function') callback(response);
                    database.close();
                });
            }
        });
    });
};

exports.searchByName = function(name, callback) {
    common.searchByName(collectionName, database, callback, name);
};
