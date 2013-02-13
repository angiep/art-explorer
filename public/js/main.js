/*
 * main.js
 */

require.config({
    baseUrl: "/js/lib",
    shim: {
        "backbone": {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        "underscore": {
            exports: "_"
        }
    },
    paths: {
        app: "/js/app",
        models: "/js/models",
        collections: "/js/collections",
        views: "/js/views"
    }
});

require(["app"], function(App) {
});
