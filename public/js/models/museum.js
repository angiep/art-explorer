define(["backbone"], function() {
	'use strict';

    /*
     * Museum Model "Art Owner"
     *
     * name
     * image
     * article
     * artworks
     * location
     *
     */

	app.Museum = Backbone.Model.extend({

        idAttribute: "_id",
        defaults: {},
        initialize: function() {}

	});

    return app.Museum;

});
