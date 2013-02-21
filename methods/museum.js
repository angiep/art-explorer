/*
 * methods/museum.js
 * Database methods for museums
 */

/*
 * Initialize global variables
 */

var mongodb = require('mongodb')
    , $ = require('jquery')
    , ObjectID = mongodb.ObjectID
    , global = require('../global')
    , config = global.config
    , utils = require('../utils')
    , common = require('../common')
    , collectionName = 'art_owner'
    , response = undefined;

exports.getAll = function(cursor, count) {
    return common.getAll(collectionName, cursor, count);
};

exports.getById = function(id) {
    return common.getById(collectionName, id);
};

exports.searchByName = function(name) {
    return common.searchByName(collectionName, name);
};

exports.getArtworksForMuseum = function(id) {

    var def = new $.Deferred();
   
    if (!utils.isValidId(id)) {
        return def.reject(utils.formatError(global.errorMessages.incorrectParams));
    }

    var ownersColl = new mongodb.Collection(global.client, collectionName);
    var relationships;
    var artworks;

    // Find the owner for this ID
    ownersColl.findOne({_id: new ObjectID(id)}, function(error, owner) {

        if (error) throw error;

        if (owner) {

            // Grab all relationships for this owner
            artworkOwnerColl = new mongodb.Collection(global.client, 'artwork_owner_relationship');
            artworkOwnerColl.find({owner: owner.name}, {id: 1, _id: 0}).toArray(function(error, relationships) {

                if (error) throw error;

                // Build a list of artwork relationship IDs to search for
                var relIDs = [];
                for (var i = 0; i < relationships.length; i++) {
                    relIDs.push(relationships[i].id);
                }

                // Grab the artwork data for those IDs
                artworkColl = new mongodb.Collection(global.client, 'artwork');
                artworkColl.find({ owners: { $elemMatch: { id: { $in: relIDs } } } }).toArray(function(error, artworks) {

                    if (error) throw error;

                    response = JSON.stringify(artworks);
                    def.resolve(response);

                });

            });

        }

    });

    return def;
};
