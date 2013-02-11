/**
 * Module dependencies.
 */

var express = require('express')
    , mongodb = require('mongodb')
    , global = require('./global')
    , routes = require('./routes')
    , museumAPI = require('./routes/api/museum')
    , artistAPI = require('./routes/api/artist')
    , artworkAPI = require('./routes/api/artwork')
    , http = require('http')
    , path = require('path');

var app = express();

var config = global.config;

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
        app.use(require('stylus').middleware(__dirname + '/public'));
        app.use(express.static(path.join(__dirname, 'public')));
    });

    app.configure('development', function(){
        app.set('port', process.env.PORT || config.development.port);
        app.use(express.errorHandler());
    });

    /*
     * Homepage route
     */
    app.get('/', routes.index);

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
