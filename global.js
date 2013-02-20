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
 * Freebase Constants
 */
// image thumbnails http://api.freebase.com/api/trans/image_thumb/wikipedia/images/commons_id/1222112
exports.freebase = {
    key: 'AIzaSyDWnuOnTsNHDcyCTgk0FOksN0OmPpak6og',
    images: 'https://usercontent.googleapis.com/freebase/v1/image/',
    articlesHost: 'api.freebase.com',
    articlesPath: '/api/trans/blurb/'
}

/*
 * Error Messages
 */

exports.errorMessages = {
    emptyResponse: 'No results were found.',
    incorrectParams: 'Invalid parameters were provided',
    mongoError: 'Error retrieving records'
};
