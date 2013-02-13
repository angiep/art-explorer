var app = app || {};

define(["backbone", "models/museum"], function() {
	'use strict';

    /*
     * A list of museums or art owners
     *
     */

	app.MuseumList = Backbone.Collection.extend({

        model: app.Museum

	});

    return app.MuseumList;

});
