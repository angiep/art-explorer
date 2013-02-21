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
    , collectionName = 'artwork'
    , response = undefined;

/*
 * Retrieves a list of artworks
 */

exports.getAll = function(cursor, count) {
    return common.getAll(collectionName, cursor, count);
};

/*
 * Retrieves a single artwork by it's ID
 */

exports.getById = function(id) {
    return common.getById(collectionName, id);
};

exports.searchByName = function(name) {
    return common.searchByName(collectionName, name);
};

// TODO
exports.getOwner = function(id) {
};



