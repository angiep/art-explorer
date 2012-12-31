exports.config = {
    production: {
        server: 'localhost',
        port: '3000',
        db: 'art_explorer',
        db_server: '127.0.0.1',
        db_port: '27017',
    },
    development: {
        server: 'localhost',
        port: '3000',
        db: 'art_explorer',
        db_server: '127.0.0.1',
        db_port: '27017',
    },
};

exports.errorMessages = {
    emptyResponse: 'No results were found.',
    incorrectParams: 'The required parameters were not provided.'
};
