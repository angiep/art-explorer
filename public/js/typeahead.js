/*
 * Utility Methods
 */
function appendAfter(element, sibling) {
    if (element.nextSibling) {
        element.parentNode.insertBefore(sibling, element.nextSibling);
    }
    else {
        element.parentNode.appendChild(sibling);
    }
}

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
      el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
   }
}

/*
 * JavaScript TypeAhead Module
 * Author: Angela Panfil (panfia)
 *
 */
var TypeAhead = (function() {

    if (count === undefined) var count = -1;

    var ACTIVE_CLASS = 'highlight';

    // Private functions shared by all instances
    var processKey = function(e) {
        if (!e) return;

        var charCode = (typeof e.which === "number") ? e.which : e.keyCode;

        switch(charCode) {
            case 38:
                return { action: "up" };
            case 40:
                return { action: "down" };
            default:
                break;
        }

        if (charCode) {
            return { character: String.fromCharCode(charCode) };
        }

        return {};
    };

    var findMatches = function(term, items) {

        if (term === "") return [];

        // Sort alphabetically
        items.sort();

        var matches = [];

        for (var i = 0; i < items.length; i++) {
            var re = new RegExp('^' + term + '.*', 'i'); 

            if (items[i].match(re)) {
                matches.push(items[i]);
            }
        }

        return matches;

    };

    var makeRequest = function() {
    };

    var generateList = function() {
        var ul = document.createElement('ul');
        var div = document.createElement('div');

        div.className = 'wrapper';
        div.appendChild(ul);

        return {wrapper: div, dropdown: ul};
    };

    /* 
     * Constructor
     *
     * input: an input DOM element <input type="text" />
     * options: {
     *     list: an array of strings to check user input against, an alternative to making AJAX requests
     *     source: source URL to check user input against, should return a JSON array
     * }
     */
    var typeAhead = function(input, options) {

        var _this = this;
        this.count = ++count;

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

            console.log(e);
            var key = processKey(e);
            if (key.character) {
                _this.onKeyPress.call(_this, key);
            }
            else if (key.action) {
                // Buggy when doing searches
                // TODO: try to implement something like this?
                //actions[key.action]();
                switch(key.action) {
                    case "down":
                        _this.updateIndex();
                        break;
                    case "up":
                        _this.updateIndex(true);
                        break;
                    default:
                        break;
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

        onKeyPress: function(key) {
            var matches;
            // If we're searching from a static list...
            if (this.options.list) {
                matches = findMatches(this.getCurrentValue(), this.options.list);
            }

            this.updateDropdown(matches);
        },

        getCurrentValue: function() {
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

        deselectItems: function() {
            var items = this.getDropdownItems();
            for (var i = 0; i < items.length; i++) {
                removeClass(items[i], ACTIVE_CLASS);
            }
        },

        updateIndex: function(decrement) {

            // Make sure we stay within bounds
            var length = this.getDropdownItems().length - 1;
            if (decrement && this.index === 0) return;
            if (!decrement && this.index === length) return;

            this.deselectItems();

            if (decrement) {
                this.index--
            }
            else {
                this.index++;
            }

            this.selectItem(this.index);
        },

        resetIndex: function() {
            this.deselectItems();
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
