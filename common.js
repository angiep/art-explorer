/*
 * common.js
 * Methods common to all collections
 */

var mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , global = require('./global')
    , utils = require('./utils');

/*
 * Retrieves a list of items based on which collection is passed in
 * collectionName: the name of the collection to retrieve items from
 * database: the mongodb database where the collection can be found
 * callback: a function to be called once the items have been retrieved
 * offset: where to begin paging
 * count: the number of items to retrieve
 */

exports.getAll = function(collectionName, database, callback, offset, count) {
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
 * Retrieves a single item by it's ID within a collection
 * collectionName: the name of the collection to retrieve items from
 * database: the mongodb database where the collection can be found
 * id: the unique ID of the artwork
 */

exports.getById = function(collectionName, database, callback, id) {

    if (!utils.isValidId(id)) {
        if (typeof callback === 'function') callback(utils.formatError(global.errorMessages.incorrectParams));
        return;
    }

    database.open(function(error, client) {
        if (error) throw error;

        var collection = new mongodb.Collection(client, collectionName);
        collection.findOne({'_id': new ObjectID(id)}, function(error, docs) {
            if (error) throw error;

            response = JSON.stringify(docs);
            if (typeof callback === 'function') callback(response);
            database.close();
        });
    });
};

exports.searchByName = function(collectionName, database, callback, name) {

    if (!name) {
        if (typeof callback === 'function') callback(utils.formatError(global.errorMessages.incorrectParams));
        return;
    }

    database.open(function(error, client) {
        if (error) throw error;

        var collection = new mongodb.Collection(client, collectionName);
        var query = { name: new RegExp('.*' + name + '.*', 'i') };
        collection.find(query).toArray(function(error, docs) {
            if (error) throw error;
            if (!docs) docs = [];

            response = JSON.stringify(docs);
            if (typeof callback === 'function') callback(response);
            database.close();
        });
    });
};
