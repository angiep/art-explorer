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
    , freebase = global.freebase
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

    var ownersColl = new mongodb.Collection(global.client, collectionName)
      , relationships
      , artworks;

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
                artworkColl.find({ owners: { $elemMatch: { id: { $in: relIDs } } } }).sort({ artist: -1 }).toArray(function(error, artworks) {

                    // Generate imageURL for all artworks
                    var parameters = { maxwidth: 400, mode: 'fit', key: freebase.key }
                    for (var j = 0; j < artworks.length; j++) {
                        // check if image actually exists before doing this
                        artwork = artworks[j];
                        artwork.imageURL = utils.generateFreebaseURL(freebase.images, artwork.image[0].id, parameters);
                    }

                    /*
                     * Manipulate collection to be grouped by artist
                     * Example:
                     * [
                     *  {
                     *      name: 'Leonardo da Vinci',
                     *      artworks: []
                     *  },
                     *  {
                     *      name: 'Andy Warhol',
                     *      artworks: []
                     *  }
                     * ]
                     *
                     */

                    var artistList = [] // The final list to be returned
                      , artwork         // The artwork currently being looked at in the loop
                      , artist          // The artist currently being looked at in the loop
                      , currentArtist   // The current artist, changes when we reach a new artist in the loop
                      , artistObject;   // The object including {name: "", artworks: []}

                    for (var k = 0; k < artworks.length; k++) {
                        artwork = artworks[k];
                        artist = artwork.artist[0];

                        // Viewing the same artist, push the artwork to that artist's lists
                        if (artist === currentArtist) {
                            artistObject.artworks.push(artwork);
                        }
                        // Viewing a new artist, empty out the previous list and start a list for the new artist
                        else {

                            if (artistObject) artistList.push(artistObject);

                            artistObject = {};
                            artistObject.artworks = [];
                            currentArtist = artist;

                            artistObject.name = currentArtist;
                            artistObject.artworks.push(artwork);
                        }

                    }

                    if (error) throw error;

                    response = JSON.stringify(artistList);
                    def.resolve(response);

                });

            });

        }

    });

    return def;
};
