var app = app || {};

define(["backbone"], function(Backbone) {
    "use strict";

    var _this;

    app.View = Backbone.View.extend({

        el: "#wrapper",

        initialize: function() {
            console.log("app.View: initialize");
            _this = this;
        },

        events: {
        },

        render: function() {
            // Updates the text of the element with an ID attribute of example
            //self.$el.find("#example").text("This is an example");
        }
        
    });
  
    // Returns the entire view (allows you to reuse your View class in a different module)
    return new app.View();
});


