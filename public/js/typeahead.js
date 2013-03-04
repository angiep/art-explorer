/*
 * Utility Methods
 * TODO: move these to another file
 */
function appendAfter(el, sibling) {
    if (el.nextSibling) {
        el.parentNode.insertBefore(sibling, el.nextSibling);
        return;
    }

    el.parentNode.appendChild(sibling);
}

// Make an AJAX request
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
 * Class Utility Methods 
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

/*
 * JavaScript TypeAhead Module
 * Author: Angela Panfil (panfia)
 */
var TypeAhead = (function() {
    'use strict';

    // Count maintains the number of instances of this widget
    // Each instance is given it's own unique number (this.count) based on this count
    if (count === undefined) var count = -1;

    // Static variables shared by all instances
    var ACTIVE_CLASS = 'highlight';
    var keyActions = {
        13: 'enter',
        38: 'up',
        40: 'down'
    };

    /*
     * Private functions shared by all instances
     */

    /*
     * Returns the action string corresponding to the key that was pressed
     * Returns undefined if the key pressed does not correspond to an action
     */
    var getActionFromKey = function(e) {
        if (!e) return;
        var charCode = (typeof e.which === "number") ? e.which : e.keyCode;

        // Determine if this character is an action character
        var action = keyActions[charCode.toString()];
        if (action) return action;

        return;
    };

    /*
     * Checks whether each string in a list contains the search term
     * "Contains" means that the search term must be at the beginning of the string
     * or at the beginning of a word in the string (so after a space)
     * term: a string to be matched against
     * items: the list of items to filter
     */
    var findMatches = function(term, items) {

        if (term === "") return [];

        // Sort alphabetically
        items.sort();

        var matches = [];

        // TODO: maybe provide a filter method for Array instead? not supported before IE9
        for (var i = 0; i < items.length; i++) {
            var re = new RegExp('\\b' + term, 'gi'); 

            if (items[i].match(re)) {
                matches.push(items[i]);
            }
        }

        return matches;

    };

    var makeRequest = function(url, term, callback, _this) {

        var that = _this || this;

        if (term === "") return callback.call(that, []);

        var success = function(xhr) {
            try {
                var response = JSON.parse(xhr.responseText);
                callback.call(that, response);
            }
            catch (e) {
                console.error(e);
                console.error('Error: Failed to parse response text into JSON');
            }
        };

        var fail = function(xhr) {
            console.error('Error: Status ' + xhr.status + '. Failed to load ' + url);
        };

        url += '?query=' + encodeURIComponent(term);
        
        load(url, success, fail);
    };

    var generateList = function() {
        var ul = document.createElement('ul');
        var div = document.createElement('div');

        div.className = 'wrapper';
        div.appendChild(ul);

        return {wrapper: div, dropdown: ul};
    };

    var actionFunctions = {
        'up': function() {
            this.updateIndex(true);
        },
        'down': function() {
            this.updateIndex();
        },
        'enter': function() {
            console.log('enter action');
        }
    };

    /* 
     * Constructor
     *
     * input: an input DOM element <input type="text" />
     * options: {
     *     list: an array of strings to check user input against, an alternative to making AJAX requests
     *     source: source URL to check user input against, should return a JSON array
     *     property: if source is returning Objects rather than strings, the property name that should be displayed within the list
     *     onSelect: a callback function to be called when the user clicks or hits enter on an item
     * }
     */
    var typeAhead = function(input, options) {

        var _this = this;
        this.count = ++count;
        this.currentValue = "";

        if (!input) {
            console.error("Error: DOM input is required");
            return;
        }

        // Public instance variables
        this.input = input; 
        this.options = options || {};

        // Bind key presses
        var onPress = function(e) {
            e.preventDefault();

            var action = getActionFromKey(e)
              , value;

            // If an action key was pressed...
            if (action) {
                actionFunctions[action].call(_this);
            }
            // Non-action character, check if the input value changed
            else {
                value = _this.getInputValue();
                if (value !== _this.currentValue) {
                    _this.currentValue = value;
                    _this.onKeyPress.call(_this);
                    _this.resetIndex();
                }
            }
        };

        this.input.onkeyup = onPress; 

        // Append a hidden unordered list after the input
        this.createDropdown();

    };

    // Functions shared by all instances
    typeAhead.prototype = {

        constructor: typeAhead,

        onKeyPress: function() {
            var matches;
            // If we're searching from a static list...
            if (this.options.list) {
                matches = findMatches(this.currentValue, this.options.list);
                this.updateDropdown(matches);
            }
            // Or hook up to a server call
            else if (this.options.source) {
                makeRequest(this.options.source, this.currentValue, function(matches) {
                    matches = this.parseMatches(matches);
                    this.updateDropdown(matches);
                }, this);
            }
        },

        parseMatches: function(matches) {
            if (!this.options.property) return matches;

            var parsed = [];

            for (var i = 0; i < matches.length; i++) {
                parsed.push(matches[i][this.options.property]);
            }

            return parsed;
        },

        getInputValue: function() {
            return this.input.value;
        },
       
        getInput: function() {
            return this.input;
        },

        // items: an array of strings (text or html)
        addItems: function(items) {
            var html = ''
              , fragment = document.createDocumentFragment()
              , li
              , text;

            for (var i = 0; i < items.length; i++) {
                li = document.createElement('li');
                //text = document.createTextNode(items[i]);
                // Using innerHTML so we can potentially append
                // more HTML
                li.innerHTML = items[i];
                fragment.appendChild(li);
            }

            this.dropdown.appendChild( fragment.cloneNode(true) );
        },

        updateDropdown: function(items) {
            // Always clear the dropdown with a new search
            this.clearDropdown();

            // No matches returned, hide the dropdown
            if (items.length === 0) {
                this.hideDropdown();
                return;
            }

            // Matches returned, add the matches to the list
            // and display the dropdown
            this.addItems(items);
            this.displayDropdown();
        },

        createDropdown: function() {
            var list = generateList();

            // Grab the unordered list
            this.dropdown = list.dropdown;

            this.index = -1;

            // Append a unique ID
            this.dropdown.id = 'dropdown' + this.count;

            // Hide the list
            this.hideDropdown();

            // Append it after the input
            appendAfter(this.input, list.wrapper);
        },

        getDropdown: function() {
            return this.dropdown;
        },

        getDropdownItems: function() {
            return this.dropdown.getElementsByTagName('li');
        },

        displayDropdown: function() {
            this.dropdown.style.display = 'block';
        },

        hideDropdown: function() {
            this.dropdown.style.display = 'none';
        },

        clearDropdown: function() {
            console.log('clearDropdown');
            this.dropdown.innerHTML = '';
        },

        selectItem: function(index, deselect) {
            var items = this.getDropdownItems();

            if (items.length > 0 && items[index]) {
                if (deselect) {
                    removeClass(item[index], ACTIVE_CLASS);
                }
                else {
                    addClass(items[index], ACTIVE_CLASS);
                }
            }
        },

        deselectItems: function(items) {
            for (var i = 0; i < items.length; i++) {
                removeClass(items[i], ACTIVE_CLASS);
            }
        },

        deselectAllItems: function() {
            var items = this.getDropdownItems();
            for (var i = 0; i < items.length; i++) {
                removeClass(items[i], ACTIVE_CLASS);
            }
        },

        updateIndex: function(decrement) {

            // Make sure we stay within bounds
            var length = this.getDropdownItems().length - 1;
            // Going to go below bounds
            if (decrement && this.index === 0) return;
            if (!decrement && this.index === length) return;

            // TODO: Is this really going to be faster than doing deselectAllItems? where we just remove it
            // from the items we have saved?
            // Would be interesting to see if the document.getElementsByClassName makes
            // it slower 
            this.deselectItems(document.getElementsByClassName(ACTIVE_CLASS));

            if (decrement) {
                this.index--
            }
            else {
                this.index++;
            }

            this.selectItem(this.index);
        },

        resetIndex: function() {
            this.index = -1;
        },

        getIndex: function() {
            return this.index;
        },
        
        getCount: function() {
            return this.count;
        }
    };

    return typeAhead;
    
})();
