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
            response = {
                cursor: newCursor,
                results: docs
            };

            response = JSON.stringify(response);

            def.resolve(response);
        });
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
    collection.findOne({ _id: new ObjectID(id) }, function(error, docs) {
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

/*
 * Retrieves a list of items from a collection based on the IDs passed in
 * collectionName: the name of the collection to retrieve items from
 * ids: the unique IDs to retrieve
 * field: the name of the field for the ID
 */
exports.getByIds = function(collectionName, ids, field, sortOrder) {

    var def = new $.Deferred();

    var collection = new mongodb.Collection(global.client, collectionName);

    var query = {};
    query[field] = { $in: ids };

    var sortQuery = {};
    sortQuery[field] = sortOrder;

    collection.find(query).sort(sortQuery).toArray(function(error, docs) {
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
