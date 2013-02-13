var app = app || {};

define(["backbone", "collections/museums"], function(Backbone) {
    "use strict";

    var _this;
	    
    app.View = Backbone.View.extend({

        el: "#wrapper",

        initialize: function() {
            console.log("app.View: initialize");
            _this = this;
            _this.data = {};
            if (data) {
                _this.data = JSON.parse(data);
                var museums = new app.MuseumList(_this.data);
                console.log(museums);
            }

            _this.render();
        },

        events: {},

        render: function() {
            // Updates the text of the element with an ID attribute of example
            //self.$el.find("#example").text("This is an example");
        }
        
    });
  
    return new app.View();

});


