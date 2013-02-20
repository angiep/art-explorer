/*
 * sort.js
 * Provides constants and methods for sorting options
 */

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
exports.getValidSort = function(sort) {
    if (!sort) return exports.DEFAULT_SORT;

    return typeof exports.SORT_VALUES[sort] !== 'undefined' ? sort : exports.DEFAULT_SORT;
}
