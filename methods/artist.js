/*
 * methods/artist.js
 * Database methods for artists
 */

/*
 * Initialize database and global variables
 */

var mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , $ = require('jquery')
    , global = require('../global')
    , config = global.config
    , utils = require('../utils')
    , common = require('../common')
    , collectionName = 'visual_artist'
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

exports.getArtworksByArtist = function(id) {

    var def = new $.Deferred();
   
    if (!utils.isValidId(id)) {
        return def.reject(utils.formatError(global.errorMessages.incorrectParams));
    }
 
    var artists = new mongodb.Collection(global.client, collectionName);
    var artworks;

    artists.findOne({ _id: new ObjectID(id) }, function(error, artist) {
        if (error) throw error;
        if (artist) {

            var artworkIds = [];

            // Build a list of the artist's artworks and search for their content
            for (var i = 0; i < artist.artworks.length; i++) {
                artworkIds.push(artist.artworks[i].id);
            }

            artworks = new mongodb.Collection(global.client, 'artwork');
            artworks.find({ id: { $in: artworkIds } }).toArray(function(error, docs) {
                response = JSON.stringify(docs);
                def.resolve(response);
            });
        }
    });

    return def;
};

/*
 * Find an individual artist within a list of artists
 */
exports.findArtist = function(artists, name) {

    if (!name) return undefined;

    var artist;

    for (var i = 0; i < artists.length; i++) {
        artist = artists[i];
        if (artist.name === name) {
            return artist;
        }
    }

    // Artist information wasn't found
    return undefined;
};
