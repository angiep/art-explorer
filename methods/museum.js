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
 
    database.close();
    database.open(function(error, client) {
        if (error) throw error;

        var ownersColl = new mongodb.Collection(client, collectionName);
        var relatioships;
        var artworks;

        // Find the owner for this ID
        ownersColl.findOne({_id: new ObjectID(id)}, function(error, owner) {

            if (error) throw error;

            if (owner) {

                // Grab all relationships for this owner
                artworkOwnerColl = new mongodb.Collection(client, 'artwork_owner_relationship');
                artworkOwnerColl.find({owner: owner.name}, {id: 1, _id: 0}).toArray(function(error, relationships) {

                    
                    if (error) throw error;

                    // Build a list of artwork relationship IDs to search for
                    var relIDs = [];
                    for (var i = 0; i < relationships.length; i++) {
                        relIDs.push(relationships[i].id);
                    }

                    // Grab the artwork data for those IDs
                    artworkColl = new mongodb.Collection(client, 'artwork');
                    artworkColl.find({ owners: { $elemMatch: { id: { $in: relIDs } } } }).toArray(function(error, artworks) {

                        response = JSON.stringify(artworks);
                        database.close();
                        if (typeof callback === 'function') callback(artworks);

                    });

                });

            }
        });
    });
};
