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
    , artworkMod = require('./artwork')
    , artistMod = require('./artist')
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

exports.getArtworksForMuseum = function(id, api) {

    var def = new $.Deferred();
   
    if (!utils.isValidId(id)) {
        return def.reject(utils.formatError(global.errorMessages.incorrectParams));
    }

    var ownersColl = new mongodb.Collection(global.client, collectionName)
      , relationships
      , artworks
      , i;

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
                for (i = 0; i < relationships.length; i++) {
                    relIDs.push(relationships[i].id);
                }

                // Grab the artwork data for those IDs
                artworkColl = new mongodb.Collection(global.client, 'artwork');
                artworkColl.find({ owners: { $elemMatch: { id: { $in: relIDs } } } }).sort({ artist: 1 }).toArray(function(error, artworks) {

                    // Build imageURLs for each artwork
                    if (!api) {
                        var parameters = { maxwidth: 400, mode: 'fit', key: freebase.key };
                        artworks = artworkMod.generateImageURLs(artworks, parameters);
                    }

                    // Grab all of the artist information for this list of artworks
                    var defArtists = artworkMod.getArtistsForArtworks(artworks);

                    defArtists.then(function(artists) {

                        var parsedArtists = JSON.parse(artists);

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
                          , retrievedArtist // The retrieved artist from the list of artists
                          , currentArtist   // The current artist, changes when we reach a new artist in the loop
                          , artistObject;   // The object including {name: "", artworks: []}

                        for (i = 0; i < artworks.length; i++) {
                            artwork = artworks[i];
                            artist = artwork.artist[0];

                            // Viewing the same artist, push the artwork to that artist's lists
                            if (artist && artist === currentArtist) {
                                artistObject.artworks.push(artwork);
                            }
                            // Viewing a new artist, empty out the previous list and start a list for the new artist
                            else {

                                if (artistObject) {
                                    artistList.push(artistObject);
                                }

                                currentArtist = artist;
                                retrievedArtist = artistMod.findArtist(parsedArtists, currentArtist);

                                artistObject = retrievedArtist ? retrievedArtist : { name: currentArtist };
                                artistObject.artworks = [];
                                artistObject.artworks.push(artwork);
                            }

                        }

                        if (error) throw error;

                        response = JSON.stringify(artistList);

                        def.resolve(response);

                    }); // defArtists
                    
                }); // artworkColl

            }); // artOwnerColl

        }

    });

    return def;
};
