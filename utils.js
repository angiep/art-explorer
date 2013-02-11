/*
 * utils.js
 * Global utility methods
 */

/*
 * Send response back as JSON with correct Content-Type
 */
exports.sendJson = function(res, json) {
    // TODO: have this show json with an error if there is no json
    if (!res || !json) return;

    res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    res.end(json);
};

/*
 * Checks whether the id passed in is a valid MongoDB id
 */
exports.isValidId = function(id) {
    if (id && (id.length == 12 || id.length == 24))
    {
        return true;
    }

    return false;
};

/*
 * Formats an error message into JSON
 * Pass in the proper error message found in global.errorMessages
 */
exports.formatError = function(error) {
    if (!error) error = "";
    return JSON.stringify({error: error});
};
