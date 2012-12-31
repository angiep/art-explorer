/**
 * Module dependencies.
 */

var express = require('express')
    , mongodb = require('mongodb')
    , global = require('./global')
    , routes = require('./routes')
    , museum = require('./routes/museum')
    , artist = require('./routes/artist')
    , artwork = require('./routes/artwork')
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
     * Museum Routes
     */
    app.get('/museums', museum.list);
    app.get('/museums/:museum_id', museum.info);
    app.get('/museums/:museum_id/artworks', museum.artworks);

    /* 
     * Artist Routes
     */
    app.get('/artists', artist.list);
    app.get('/artists/:artist_id', artist.info);
    //app.get('/artists/:artist_id/artworks', artist.artworks);

    /*
     * Artwork Routes
     */
    app.get('/artworks', artwork.list);
    app.get('/artworks/:artwork_id', artwork.info);

    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
};

setup();
