var app = app || {};

$(function() {
    "use strict";

    app.AppView = Backbone.View.extend({

        el: "#wrapper",

        events: {
            "click #searchbar" : "triggerSearch"
        },

        initialize: {
        },

        render: {
        },

        createOnEnter: {
        }

    });

});
