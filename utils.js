/*
 * utils.js
 * Global utility methods
 */

exports.sendJson = function(res, json) {
    if (!res || !json) return;

    res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    res.end(json);
};
