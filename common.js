/*
 * common.js
 * Methods common to all collections
 */

var mongodb = require('mongodb')
    , http = require('http')
    , ObjectID = mongodb.ObjectID
    , global = require('./global')
    , config = global.config
    , $ = require('jquery')
    , utils = require('./utils')

/*
 * Retrieves a list of items based on which collection is passed in
 * collectionName: the name of the collection to retrieve items from
 * offset: where to begin paging
 * count: the number of items to retrieve
 */

exports.getAll = function(collectionName, offset, count) {

    var def = new $.Deferred();
    var skip = offset || 0;
    var limit = count || config.limit;
        
    var collection = new mongodb.Collection(global.client, collectionName);
    //db.forum_posts.find({date: {$lt: ..last_post_date..} }).sort({date: -1}).limit(20);
    collection.find({}).skip(skip).limit(limit).toArray(function(error, docs) {
        response = JSON.stringify(docs);
        def.resolve(response);
    });

    return def;
};

/*
 * Retrieves a single item by it's ID within a collection
 * collectionName: the name of the collection to retrieve items from
 * id: the unique ID of the artwork
 */

exports.getById = function(collectionName, id) {

    var def = new $.Deferred();

    if (!utils.isValidId(id)) {
        return def.reject(utils.formatError(global.errorMessages.incorrectParams));
    }

    var collection = new mongodb.Collection(global.client, collectionName);
    collection.findOne({'_id': new ObjectID(id)}, function(error, docs) {
        if (error) throw error;
        response = JSON.stringify(docs);
        def.resolve(response);
    });

    return def;
};

exports.searchByName = function(collectionName, name) {

    var def = new $.Deferred();

    if (!name) {
        return def.reject(utils.formatError(global.errorMessages.incorrectParams));
    }

    var collection = new mongodb.Collection(global.client, collectionName);
    // TODO: really really basic regex match for now
    var query = { name: new RegExp('.*' + name + '.*', 'i') };
    collection.find(query).toArray(function(error, docs) {
        if (error) def.reject(error);
        if (!docs) docs = [];

        response = JSON.stringify(docs);
        def.resolve(response);
    });

    return def;
};

exports.makeExternalRequest = function(options) {
    var def = new $.Deferred();

    http.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            def.resolve(data);
        });
    }).on('error', function(error) {
        def.reject(error);
    });

    return def;
};
