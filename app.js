/**
 * Module dependencies.
 */

var express = require('express')
    , mongodb = require('mongodb')
    , global = require('./global')
    , config = global.config
    , routes = require('./routes')
    , museum = require('./routes/museum')
    , artwork = require('./routes/artwork')
    , museumAPI = require('./routes/api/museum')
    , artistAPI = require('./routes/api/artist')
    , artworkAPI = require('./routes/api/artwork')
    , http = require('http')
    , path = require('path')
    , server = new mongodb.Server(config.development.db_server, 27017, {})
    , database = new mongodb.Db(config.development.db, server, {w: 1});

database.open(function(error, client) { 

    // TODO: database connection failed, what to do here?
    if (error) throw error;

    var app = express();

    global.client = client;

    var setup = function() {
        app.configure(function(){
            app.set('port', process.env.PORT || config.production.port);
            app.set('views', __dirname + '/views');
            app.set('view engine', 'ejs');
            app.use(express.favicon());
            app.use(express.logger('dev'));
            app.use(express.bodyParser());
            app.use(express.methodOverride());
            app.use(express.cookieParser('your secret here'));
            app.use(express.session());
            app.use(app.router);
            app.use(express.static(path.join(__dirname, 'public')));
        });

        // app.configure is essentially an if statement
        app.configure('development', function(){
            app.set('port', process.env.PORT || config.development.port);
            app.use(express.errorHandler());
        });

        // TODO use this to validate parameters https://github.com/visionmedia/express-params 
        
        /*
         * Homepage route
         */
        app.get('/', routes.index);

        /*
         * Museum Routes
         */
        app.get('/museums/:museum_id', museum.info);

        /*
         * Artwork Routes
         */
        app.get('/artworks/:artwork_id', artwork.info);

        /*
         * Museum API Routes
         */
        app.get('/api/museums', museumAPI.list);
        app.get('/api/museums/:museum_id', museumAPI.info);
        app.get('/api/museums/:museum_id/artworks', museumAPI.artworks);

        /* 
         * Artist API Routes
         */
        app.get('/api/artists', artistAPI.list);
        app.get('/api/artists/:artist_id', artistAPI.info);
        app.get('/api/artists/:artist_id/artworks', artistAPI.artworks);

        /*
         * Artwork API Routes
         */
        app.get('/api/artworks', artworkAPI.list);
        app.get('/api/artworks/:artwork_id', artworkAPI.info);

        http.createServer(app).listen(app.get('port'), function(){
            console.log('Express server listening on port ' + app.get('port'));
        });
    };

    setup();
});
