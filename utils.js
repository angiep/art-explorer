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

/*
 * Creates a Freebase URL used for images and API calls
 * path: the host of the file or data
 * id: the id of the item to be fetched
 * parameters: a set of key value parameters that are built into a query at the end of the URL, these are optional
 * Example output: https://usercontent.googleapis.com/freebase/v1/image//m/05bl7bb?maxheight=163&maxwidth=163&mode=fillcropmid&key=12345 
 */
exports.generateFreebaseURL = function(path, id, parameters) {

    var url = path + id;
    var query = [];

    if (parameters) {
        Object.keys(parameters).forEach(function(key) {
            var val = parameters[key];
            query.push(key + '=' + val);
        });
    }

    if (query.length > 0) {
        url += '?' + query.join('&');
    }

    return url;

};
