/*
 * utils.js
 * Global utility methods
 */

/*
 * Send response back as JSON with correct Content-Type
 */
exports.sendJson = function(res, json) {
    if (!res || !json) return;

    res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    res.end(json);
};
