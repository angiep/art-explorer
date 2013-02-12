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
        app: "/js/app"
    }
});

require(["app"], function(App) {
});
