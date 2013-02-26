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

/*
 * Retrieves x number of museums starting at the cursor provided and sorted by sortBy
 * cursor: the cursor at which to start the query
 * sortBy: how the items should be sorted, valid options are found in sortOptions.js
 * count: the maximum number of items to receive
 */
exports.getAll = function(cursor, sortBy, count) {
    return common.getAll(collectionName, cursor, sortBy, count);
};

/*
 * Retrieves a single museum based on the id provided
 */
exports.getById = function(id) {
    return common.getById(collectionName, id);
};

/*
 * Retrieves a list of museums by the provided ids
 * Ids do not have to be Mongo ObjectIds but can be any field
 * Include field to specify which field to query by
 */
exports.getByIds = function(ids, field) {
    return common.getByIds(collectionName, ids, field);
};

/*
 * Attempts to match a museum's name to the name provided
 */
exports.searchByName = function(name) {
    return common.searchByName(collectionName, name);
};

/*
 * Retrieves a museum category
 * categoryID: the id of the category, e.g. nearby, popular, contemporary
 */
exports.getCategory = function(categoryID) {
    var def = new $.Deferred();
    var categoryColl = new mongodb.Collection(global.client, 'category');

    categoryColl.findOne({id: categoryID}, function(error, category) {
        if (error) throw error;
        def.resolve(category);
    });

    return def;
};

/*
 * Returns a category object alongside a list of museums within that category
 */
exports.getMuseumsByCategory = function(categoryID) {
    var def = new $.Deferred();

    exports.getCategory(categoryID).then(function(category) {
        exports.getByIds(category.art_owners).then(function(museums) {

            var response = {
                category: category,
                results: museums.results
            };

            def.resolve(response);
        });
    });

    return def;
};


/*
 * Returns a list of artworks within a museum organized by artist
 * For example:
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
                                retrievedArtist = artistMod.findArtist(artists, currentArtist);

                                artistObject = retrievedArtist ? retrievedArtist : { name: currentArtist };
                                artistObject.artworks = [];
                                artistObject.artworks.push(artwork);
                            }

                        }

                        if (error) throw error;

                        def.resolve(artistList);

                    }); // defArtists
                    
                }); // artworkColl

            }); // artOwnerColl

        }

    });

    return def;
};


/*
 * Use the google maps geocode API to retrieve the geolocation for a museum
 * The address provided to google maps only contains the name of the museum,
 * so correct results may vary
 */
exports.getGeolocation = function(museumInfo) {

    var def = new $.Deferred
    
    // Generate the google maps API URL
    var parameters = { address: museumInfo.name, sensor: false }
      , path = utils.generateURL(global.googleMaps.geocodePath, undefined, parameters);

    var options = {
        host: global.googleMaps.host,
        port: '80',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        path: path
    };

    common.makeExternalRequest(options).then(function(response) {

        // Format the result that they have provided into our own format
        var geo = response.results[0]
          , components = geo.address_components
          , component
          , formatted = {};

        for (var i = 0; i < components.length; i++) {
            component = components[i];
            type = component.types[0] || 'other_' + i;

            formatted[type] = {
                short_name: component.short_name,
                long_name: component.long_name
            };
        }

        formatted.coordinates = {
            longitude: geo.geometry.location.lng,
            latitude: geo.geometry.location.lat
        }
        formatted.formatted_address = geo.formatted_address,

        def.resolve(formatted);
    });

    return def;
};

/*
 * Retrieve a short snipper about the museum from the freebase text API
 */
exports.getArticle = function(museumInfo) {

    var def = new $.Deferred()

    // Generate the freebase API URL
    var parameters = { format: 'plain', maxlength: 1000, key: freebase.key }
      , path = utils.generateURL(freebase.articlesPath, museumInfo.article[0].id, parameters);

    var options = {
        host: freebase.host,
        port: '443',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        path: path
    };

    common.makeExternalRequest(options).then(function(article) {
        def.resolve(article.result);
    });

    return def;
};

/*
 * Retrieve a list of museums that are near the coordinates provided
 * coordinates: an object including a latitude and longitude, e.g. {latitude: 50, longitude: 50}
 * within:  the radius around the coordinates (in miles) that the museum needs to be within
 */
exports.getNearbyMuseums = function(coordinates, within) {
    var def = new $.Deferred
      , ownerColl = new mongodb.Collection(global.client, collectionName)
      , query = { 'location.coordinates': { $within: { $centerSphere: [ [ coordinates.longitude, coordinates.latitude] , within/3963.192] } } };

    ownerColl.find(query).toArray(function(error, museums) {
        if (error) throw error;
        def.resolve(museums);
    });

    return def;
};

/*
 * Update a museum object within the database
 * id: the ObjectId of the museum
 * fields: a set of key, value pairs that the museum will be updated with
 */
exports.updateMuseum = function(id, fields) {
    var f = fields || {};
    var ownerColl = new mongodb.Collection(global.client, collectionName);

    ownerColl.update({ _id: new ObjectID(id) }, { $set: f }, { safe: true }, function(error, id, statusCode) {
        if (error) throw error;
    });
};

/*
 * Generate image URLs for a list of museums
 */
exports.generateImageURLs = function(museums, parameters) {

    var museum;

    for (var i = 0; i < museums.length; i++) {
        museum = museums[i];
        museum.imageURL = utils.generateURL(freebase.images, museum.image[0].id, parameters);
    }

    return museums;
};
