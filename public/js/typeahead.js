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

/*
 * JavaScript TypeAhead Module
 * Author: Angela Panfil (panfia)
 *
 */
var TypeAhead = (function() {

    if (count === undefined) var count = -1;

    // Private functions shared by all instances
    
    var processKey = function(e) {
        if (!e) return;

        var charCode = (typeof e.which === "number") ? e.which : e.keyCode;
        if (charCode) {
            return String.fromCharCode(charCode);
        }

        return;
    };

    var makeRequest = function() {
    };

    var generateList = function() {
        return document.createElement('ul');
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
            var key = processKey(e);
            _this.onKeyPress.call(_this, key);
        };

        this.input.onkeypress = onPress; 

        // Append a hidden unordered list after the input
        this.createDropdown();
    };

    // Functions shared by all instances
    typeAhead.prototype = {

        constructor: typeAhead,

        onKeyPress: function(key) {
            console.log(key);
        },

        getCurrentValue: function() {
            return this.input.value;
        },
       
        getInput: function() {
            return this.input;
        },

        // Generate HTML string and then append it all afterwards
        // items: an array of strings
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

        updateDropdown: function() {
            this.clearDropdown();
            this.addItems(["cat", "dog", "bird"]);
            this.displayDropdown();
        },

        createDropdown: function() {
            // Grab the unordered list
            this.dropdown = generateList();

            // Append a unique ID
            this.dropdown.id = 'dropdown' + this.count;

            // Hide the list
            this.hideDropdown();

            // Append it after the input
            appendAfter(this.input, this.dropdown);
        },

        getDropdown: function() {
            return this.dropdown;
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

        getCount: function() {
            return this.count;
        }
    };

    return typeAhead;
    
})();
