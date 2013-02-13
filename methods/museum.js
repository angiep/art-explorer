/*
 * methods/museum.js
 * Database methods for museums
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
    , collectionName = 'art_owner'
    , response = undefined;

exports.getAll = function(callback, offset, count) {
    common.getAll(collectionName, database, callback, offset, count);
};

exports.getById = function(id, callback) {
    common.getById(collectionName, database, callback, id);
};

exports.searchByName = function(name, callback) {
    common.searchByName(collectionName, database, callback, name);
};

exports.getArtworksForMuseum = function(id, callback) {
   
    if (!utils.isValidId(id)) {
        if (typeof callback === 'function') callback(utils.formatError(global.errorMessages.incorrectParams));
        return;
    }
 
    database.open(function(error, client) {
        if (error) throw error;

        var artOwners = new mongodb.Collection(client, collectionName);
        var artworks;

        artOwners.findOne({'_id': new ObjectID(id)}, function(error, owner) {
            if (error) throw error;
            if (owner) {
                artworks = new mongodb.Collection(client, 'artwork_owner_relationship');
                artworks.find({'owner': owner.name}).toArray(function(error, docs) {
                    response = JSON.stringify(docs);
                    if (typeof callback === 'function') callback(response);
                    database.close();
                });
            }
        });
    });
};
