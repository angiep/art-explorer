/*
 * global.js
 * Contains all app constants
 */


/*
 * Configuration Settings
 */

exports.config = {
    production: {
        server: 'localhost',
        port: '3000',
        db: 'art_explorer_test',
        db_server: '127.0.0.1',
        db_port: '27017',
    },
    development: {
        server: 'localhost',
        port: '3000',
        db: 'art_explorer_test',
        db_server: '127.0.0.1',
        db_port: '27017',
    },
    limit: 25    // The default limit for paging
};

/*
 * Error Messages
 */

exports.errorMessages = {
    emptyResponse: 'No results were found.',
    incorrectParams: 'Invalid parameters were provided'
};
