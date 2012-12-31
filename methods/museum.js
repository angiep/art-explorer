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
    , server = new mongodb.Server(config.development.db_server, 27017, {})
    , database = new mongodb.Db(config.development.db, server, {w: 1})
    , collectionName = 'art_owners'
    , response = undefined;

exports.getAll = function(callback) {
    database.open(function(error, client) {
        if (error) throw error;

        var collection = new mongodb.Collection(client, collectionName);
        collection.find({}, {limit: 25}).toArray(function(error, docs) {
            response = JSON.stringify(docs);
            if (typeof callback === 'function') callback(response);
            database.close();
        });
    });
};

exports.getById = function(id, callback) {
    if (!id) if (typeof callback === 'function') callback(global.errorMessages.incorrectParams);

    database.open(function(error, client) {
        if (error) throw error;

        var collection = new mongodb.Collection(client, collectionName);
        collection.findOne({'_id': new ObjectID(id)}, function(error, docs) {
            response = JSON.stringify(docs);
            if (typeof callback === 'function') callback(response);
            database.close();
        });
    });
};

exports.getArtworksForMuseum = function(id, callback) {
    if (!id) if (typeof callback === 'function') callback(global.errorMessages.incorrectParams);

    database.open(function(error, client) {
        if (error) throw error;

        var artOwners = new mongodb.Collection(client, collectionName);
        var artworks;

        artOwners.findOne({'_id': new ObjectID(id)}, function(error, owner) {
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




