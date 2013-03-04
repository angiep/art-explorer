/*
 * common.js
 * Methods common to all collections
 */

var mongodb = require('mongodb')
    , https = require('https')
    , http = require('http')
    , ObjectID = mongodb.ObjectID
    , global = require('./global')
    , config = global.config
    , $ = require('jquery')
    , utils = require('./utils')
    , sortOption = require('./sortOption')

/*
 * Retrieves a list of items based on which collection is passed in
 * collectionName: the name of the collection to retrieve items from
 * count: the number of items to retrieve
 */
exports.getAll = function(collectionName, cursor, sortBy, count) {

    var def = new $.Deferred()
      , defCursor = new $.Deferred()
      , limit = count || config.limit
      , newCursor
      , response
      , collection = new mongodb.Collection(global.client, collectionName)
      , validSort = sortOption.getValidSort(sortBy)
      , sortValue = sortOption.SORT_VALUES[validSort];

    // If the sort is something other than date then we need to retrieve the corresponding
    // field for that search based on the passed in cursor
    if (!sortOption.isDefaultSort(validSort) && utils.isValidId(cursor)) {
        collection.findOne({ _id: new ObjectID(cursor) }, function(error, docs) {
            cursor = docs[sortValue.field];
            defCursor.resolve(cursor);
        });
    }
    // Using a date sort, no need to grab the other field for the cursor item
    else {
        defCursor.resolve(cursor);
    }

    defCursor.then(function(updatedCursor) {
        // This will return an empty object if we have no cursor
        // Otherwise, will build the query for us based on the field
        var query = sortOption.buildQuery(validSort, sortValue, updatedCursor)
          , sortQuery = sortOption.buildSortQuery(sortValue);

        // Finally make the Mongo request using our built queries
        collection.find(query).sort(sortQuery).limit(limit).toArray(function(error, docs) {
            if (error) def.reject(error);

            if (docs.length > 0) {
                // Attach a cursor to our response for the next query
                newCursor = docs[docs.length - 1]._id;
            }
            var response = {
                cursor: newCursor,
                results: docs
            };

            def.resolve(response);
        });
    });

    return def;
};

/*
 * Retrieves a single item by it's ID within a collection
 * collectionName: the name of the collection to retrieve items from
 * id: the unique ID of the artwork
 * stringify: whether to return a JavaScript object or a JSON string
 */

exports.getById = function(collectionName, id) {

    var def = new $.Deferred();

    if (!utils.isValidId(id)) {
        return def.reject(utils.formatError(global.errorMessages.incorrectParams));
    }

    var collection = new mongodb.Collection(global.client, collectionName);
    collection.findOne({ _id: new ObjectID(id) }, function(error, docs) {
        if (error) throw error;
        def.resolve(docs);
    });

    return def;
};

exports.searchByName = function(collectionName, query, count) {

    var def = new $.Deferred();

    if (!query) {
        return def.reject(utils.formatError(global.errorMessages.incorrectParams));
    }

    var limit = count || 5;

    var collection = new mongodb.Collection(global.client, collectionName);
    // TODO: really really basic regex match for now
    var query = { name: new RegExp('\\b' + query, 'gi') };
    collection.find(query, {name: 1, image: 1}).limit(limit).sort({name: 1}).toArray(function(error, docs) {
        if (error) def.reject(error);
        if (!docs) docs = [];
        def.resolve(docs);
    });

    return def;
};

/*
 * Retrieves a list of items from a collection based on the IDs passed in
 * collectionName: the name of the collection to retrieve items from
 * ids: the unique IDs to retrieve
 * field: the name of the field for the ID
 */
exports.getByIds = function(collectionName, ids, field, sortOrder) {

    var def = new $.Deferred();
    var f = field || '_id';

    var collection = new mongodb.Collection(global.client, collectionName);

    var query = {};
    query[f] = { $in: ids };

    var sortQuery = {};
    sortQuery[f] = sortOrder;

    collection.find(query).sort(sortQuery).toArray(function(error, docs) {
        if (error) def.reject(error);
        if (!docs) docs = [];

        var response = {};
        response.results = docs;

        def.resolve(response);
    });

    return def;
};


exports.makeExternalRequest = function(options) {
    var def = new $.Deferred();

    var protocol = options.port === '443' ? https : http;
    protocol.get(options, function(res) {

        var output = '';
        res.setEncoding('utf8');

        res.on('data', function(chunk) {
            output += chunk;
        });

        res.on('end', function() {
            response = JSON.parse(output);
            def.resolve(response);
        });

    }).on('error', function(error) {
        def.reject(error);
    });

    return def;
};
