/*
 * Utility Methods
 */
function forEachIn(object, action) {
    for (var property in object) {
        console.log(property);
        if (object.hasOwnProperty(property)) {
            action(property, object[property]);
        }
    }
};

/*
 * Object Prototype Methods
 */
Object.prototype.addProperties = function(methods) {
    var _this = this;
    forEachIn(methods, function(property, value) {
        _this[property] = value;
    });
};
