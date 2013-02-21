/*
 * sortOption.js
 * Provides constants and methods for sorting options
 */

// TODO move functions out and just have the exports set the return values?

var mongodb = require('mongodb')
    , ObjectID = mongodb.ObjectID
    , utils = require('./utils');

/*
 * Sorting Option Names, passed as URL parameters
 */
exports.SORT_CONSTANTS = {
    SORT_DATE: 'date',
    SORT_ALPHA: 'alpha'
};

/*
 * Values pertaining to each sorting option
 */
exports.SORT_VALUES = {
    'date': {
        field: '_id',
        order: -1
    },
    'alpha': {
        field: 'name',
        order: 1
    }
};

/*
 * The sorting option to fallback on if an invalid sort is provided
 */
exports.DEFAULT_SORT = exports.SORT_CONSTANTS.SORT_DATE;

/*
 * Retrieving a valid sort, falling back on the default sort if necessary
 */
exports.getValidSort = function(sortBy) {
    if (!sortBy) return exports.DEFAULT_SORT;

    return typeof exports.SORT_VALUES[sortBy] !== 'undefined' ? sortBy : exports.DEFAULT_SORT;
};

/*
 * Returns whether the passed in sort is the default sort
 */
exports.isDefaultSort = function(sortBy) {
    return sortBy === exports.DEFAULT_SORT;
};

/*
 * Builds a Mongo range query based on the provided sort option and cursor
 * Return value is passed to collection.find()
 * Examples:
 * { _id: { '$lt': 51229345eb48226ad8fb395d } }
 * { name: { '$gt': 'National Gallery of Art' } }
 */
exports.buildQuery = function(sortBy, sortValue, cursor) {
    var query = {}
    if (!sortValue || !cursor) return query;

    var sortField = sortValue.field
      , sortOrder = sortValue.order
      , value = exports.isDefaultSort(sortBy) && utils.isValidId(cursor) ? new ObjectID(cursor) : cursor
      , direction = sortOrder === -1 ? '$lt' : '$gt'
      , innerQuery = {}

    // Building up the query from variables
    innerQuery[direction] = value; // { $lt: 'Louvre' }
    query[sortField] = innerQuery; // { name: { $lt: 'Louvre'} }

    return query;
};

/*
 * Builds a Mongo sort query to be passed to .sort()
 * Examples: { name: -1 }
 */
exports.buildSortQuery = function(sortValue) {
    var query = {};
    if (!sortValue) return query;

    var sortField = sortValue.field
      , sortOrder = sortValue.order;

    if (sortField && sortOrder) {
        query[sortField] = sortOrder;
    }

    return query;
};
