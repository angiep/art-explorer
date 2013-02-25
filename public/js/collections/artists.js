define(["backbone", "models/artist"], function() {
	'use strict';

    /*
     * A list of artists
     *
     */

	app.ArtistList = Backbone.Collection.extend({

        model: app.Artist

	});

    return app.ArtistList;

});
