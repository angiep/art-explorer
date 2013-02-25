define(["backbone"], function() {
	'use strict';

    /*
     * Artist Model
     *
     * name
     * image
     * article
     * artworks
     * associated_periods_or_movements
     *
     */

	app.Artist = Backbone.Model.extend({

        idAttribute: "_id",
        defaults: {
            art_series: [],
            artworks: [],
            associated_periods_or_movements: [],
            image: [],
            name: 'Unknown'
        },
        initialize: function() {}

	});

    return app.Artist;

});
