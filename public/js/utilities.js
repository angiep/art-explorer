/*
 * Utility Methods
 */
function forEachIn(object, action) {
    for (var property in object) {
        if (object.hasOwnProperty(property)) {
            action(property, object[property]);
        }
    }
};

/*
 * DOM Manipulation Methods
 */
function hasClass(el, name) {
    return el.className.match(new RegExp("(\\s|^)" + name + "(\\s|$)")) === null ? false : true;
}

function addClass(el, name) {
    if (!hasClass(el, name)) { 
        el.className += (el.className ? ' ' : '') + name; 
    }
}

function removeClass(el, name) {
   if (hasClass(el, name)) {
      el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
   }
}

function appendAfter(el, sibling) {
    if (el.nextSibling) {
        el.parentNode.insertBefore(sibling, el.nextSibling);
        return;
    }

    el.parentNode.appendChild(sibling);
}

/*
 * AJAX Request
 */
function load(url, callback, errorCallback) {
    var xhr;  

    // IE6 check
    if (typeof XMLHttpRequest !== 'undefined') {
        xhr = new XMLHttpRequest();  
    }
    else {  
        var versions = ["MSXML2.XmlHttp.5.0",  
            "MSXML2.XmlHttp.4.0",  
            "MSXML2.XmlHttp.3.0",  
            "MSXML2.XmlHttp.2.0",  
            "Microsoft.XmlHttp"]  
        for (var i = 0; i < versions.length; i++) {  
            try {  
                xhr = new ActiveXObject(versions[i]);  
                break;  
            }  
            catch(e) {}  
        }
    }  

    // XHR states from w3 spec
    // 0: UNSENT, object created
    // 1: OPENED, the open() method has been successfully invoked
    // 2: HEADERS_RECEIVED, all redirects have been followed and all HTTP headers of the final response
    // have been received
    // 3: LOADING, the response entity body is being received
    // 4: DONE, the data transfer has completed or an error has occurred

    xhr.onreadystatechange = onReadyChange;  

    function onReadyChange() {  
        // UNSENT, OPENED, HEADERS_RECEIVED, LOADING
        if (xhr.readyState < 4) {  
            return;  
        }  

        // Error occurred
        if (xhr.status !== 200) {  
            errorCallback(xhr);
            return;  
        }  

        // Done and successful!
        if (xhr.readyState === 4) {  
            callback(xhr);  
        }  
    }  

    xhr.open('GET', url, true);  
    xhr.send('');  
}

/*
 * Storage Methods
 * based off of ElementStore, found here: http://amix.dk/blog/post/19504 
 */
DataStore = {

    storeMap: {},
    uid: 1,
    storeId: 'DataStore' + (new Date).getTime(),


    // DataStore.get(el, "hi");
    get: function(element, key) {
        return DataStore.getStore(element)[key] || null;
    },

    // DataStore.set(el, "hi", {"number": 4}
    set: function(element, key, value) {
        if (!value) return;
        DataStore.getStore(element)[key] = value;
        return value;
    },

    // DataStore.remove(el);
    // DataStore.remove(el, "hi");
    remove: function(element, key) {
        if (key) {
            var store = DataStore.getStore(element);
            if (store[key]) delete store[key];
        }
        else {
            var elementId = element[DataStore.storeId];
            if (elementId) {
                delete DataStore.storeMap[elementId];
                delete element[DataStore.storeId];
            }
        }
    },

    getStore: function(element) {
        var storeId = DataStore.storeId
          , storeMap = DataStore.storeMap
          , elementId = element[storeId]

        if (!elementId) {
            elementId = element[storeId] = DataStore.uid++;
            storeMap[elementId]  = {};
        }

        return storeMap[elementId];
    }
};
