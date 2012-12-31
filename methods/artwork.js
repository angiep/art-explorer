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
    , server = new mongodb.Server(config.development.db_server, 27017, {})
    , database = new mongodb.Db(config.development.db, server, {w: 1})
    , collectionName = 'artworks'
    , response = undefined;

/*
 * Retrieves a list of artworks
 * offset: where to begin paging
 * count: the number of items to retrieve
 */

exports.getAll = function(callback, offset, count) {

    var skip = offset || 0;
    var limit = count || config.limit;

    database.open(function(error, client) {
        if (error) throw error;

        var collection = new mongodb.Collection(client, collectionName);
        //db.forum_posts.find({date: {$lt: ..last_post_date..} }).sort({date: -1}).limit(20);
        collection.find({}).skip(skip).limit(limit).toArray(function(error, docs) {
            response = JSON.stringify(docs);
            if (typeof callback === 'function') callback(response);
            database.close();
        });
    });
};

/*
 * Retrieves a single artwork by it's ID
 * id: the unique ID of the artwork
 */

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


