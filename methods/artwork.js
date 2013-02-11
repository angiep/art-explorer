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
    , common = require('../common')
    , server = new mongodb.Server(config.development.db_server, 27017, {})
    , database = new mongodb.Db(config.development.db, server, {w: 1})
    , collectionName = 'artworks'
    , response = undefined;

/*
 * Retrieves a list of artworks
 */

exports.getAll = function(callback, offset, count) {
    common.getAll(collectionName, database, callback, offset, count);
};

/*
 * Retrieves a single artwork by it's ID
 */

exports.getById = function(id, callback) {
    common.getById(collectionName, database, callback, id);
};

exports.searchByName = function(name, callback) {
    common.searchByName(collectionName, database, callback, name);
};



