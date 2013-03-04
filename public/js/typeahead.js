/*
 * JavaScript TypeAhead Module
 * Author: Angela Panfil (panfia)
 * Date: March 3, 2013
 *
 * HTML Structure Example:
 * <div class="type-ahead">
 *   <input type="text" placeholder="Search" />
 * </div>
 *
 * Options:
 *     list: an array of strings to check user input against, an alternative to making AJAX requests
 *     activeClass: the class to be added to a list item when it is selected (through arrows, hovering or clicking), default is 'highlight'
 *     source: source URL to check user input against, should return a JSON array
 *     property: if source is returning Objects rather than strings, the property name that should be displayed within the list
 *     onSelect: a callback function to be called when the user clicks or hits enter on an item, the onSelect method is passed
 *     the DOM element and the data object corresponding to the item
 *     onHover: a callback function to be called when the user hovers over an item, the onHover method is passed the DOM element and the data
 *     object corresponding to the item
 *
 */
var TypeAhead = (function() {
    'use strict';

    var uid = -1                        // Unique identifier for each instance of the widget
      , ACTIVE_CLASS = 'highlight';     // Class added to the list item when it is hovered or selected;
                                        // can be updated with this.options.activeClass

    /*
     * A list of key codes and their corresponding action functions
     */
    var actionFunctions = {
        13: function() { this.triggerSelect(this.getDropdownItems()[this.index]); }, // Enter key
        38: function() { this.updateIndex(true); }, // Up arrow
        40: function() { this.updateIndex(); }     // Down arrow
    };


    /* Private Methods */

    /*
     * getActionFromKey
     * e: a keyup event
     * If the key is an action key (such as up arrow or enter), the function corresponding to this key is returned.
     * Returns undefined if the key pressed does not correspond to an action.
     */
    var getActionFromKey = function(e) {
        if (!e) return;
        var charCode = (typeof e.which === "number") ? e.which : e.keyCode;

        // Determine if this character is an action character
        var action = actionFunctions[charCode.toString()];
        if (action) return action;

        return;
    };

    /*
     * findMatches
     * term: a string to be matched against
     * items: the list of items to filter by this search term
     * Checks whether each string in a list contains the search term
     * "Contains" means that the search term must be at the beginning of the string
     * or at the beginning of a word in the string (so after a space)
     */
    var findMatches = function(term, items) {
        if (term === "") return [];

        var matches = []
          , re;

        items.sort(); // Sort alphabetically

        // TODO: maybe provide a filter method for Array instead? not supported before IE9
        for (var i = 0; i < items.length; i++) {
            re = new RegExp('\\b' + term, 'gi'); 
            if (items[i].match(re)) {
                matches.push(items[i]);
            }
        }

        return matches;
    };

    /*
     * makeRequest
     * url: the source url for the AJAX request
     * term: the search term to be added as a query to the source url
     * callback: a function to be called if the AJAX request is successful
     * _this: optional this used by the callback function
     * Builds a URL with the search term and makes an AJAX request.
     * Sets up success and fail functions for the AJAX request.
     */
    var makeRequest = function(url, term, callback, _this) {

        var that = _this || this
          , response;

        if (term === "") return callback.call(that, []);

        var success = function(xhr) {
            // JSON parsing can throw lots of fun errors, so try it and throw an error otherwise
            try {
                response = JSON.parse(xhr.responseText);
            }
            catch (e) {
                console.error(e);
                console.error('Error: Failed to parse response text into JSON');
                return;
            }

            // Successfully retrieved the response and parsed it into JSON
            callback.call(that, response);
        };

        var fail = function(xhr) {
            console.error('Error: Status ' + xhr.status + '. Failed to load ' + url);
        };

        url += '?query=' + encodeURIComponent(term);
        
        // Make the AJAX request
        load(url, success, fail);
    };

    /*
     * generateList
     * Create the initial list display and append it after the input element.
     * HTML Structure:
     * <div class='wrapper'>
     *  <ul></ul>
     * </div>
     */
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
     * options: a set of options, all options listed at the top of this file
    */
    var typeAhead = function(input, options) {
        
        var _this = this;
        
        // We need an element to attach the module to!
        if (!input) {
            console.error("Error: DOM input is required");
            return;
        }

        /*
         * Initialize module variables
         * uid: unique indentifier for the instance of this module
         * clickHandlers: event listeners for unbinding the click event on list items
         * hoverHandlers: event listeners for unbinding the mouseover event on list items
         * currentValue: the current value in the input box
         */
        this.uid = ++uid;
        this.currentValue = "";
        this.resetHandlers();
        this.input = input; 

        // Initialize options
        this.options = options || {};
        this.options.property = this.options.property || 'name';
        if (this.options.activeClass) ACTIVE_CLASS = this.options.activeClass;

        // Bind key presses
        var onPress = function(e) {
            e.preventDefault();

            var action = getActionFromKey(e)
              , value;

            // If an action key was pressed...
            if (action) {
                action.call(_this);
            }
            // Non-action character, check if the input value changed
            else {
                value = _this.getInputValue();
                if (value !== _this.currentValue) {
                    _this.currentValue = value;
                    _this.onKeyPress.call(_this);
                    _this.setIndex();
                }
            }
        };

        this.input.onkeyup = onPress; 

        // Append a hidden unordered list after the input
        this.createDropdown();
    };

    // Prototype
    typeAhead.prototype = {

        constructor: typeAhead,

        onKeyPress: function() {
            var matches
              , labels;

            // If we're searching from a static list...
            if (this.options.list) {
                matches = findMatches(this.currentValue, this.options.list);
                this.updateDropdown(matches);
            }
            // Or hook up to a server call
            else if (this.options.source) {
                makeRequest(this.options.source, this.currentValue, function(matches) {
                    // Looking at a list of strings
                    if (matches[0] && typeof matches[0] === 'String') {
                        this.updateDropdown(matches);
                    }
                    // Looking at a list of objects
                    else {
                        labels = this.parseMatches(matches);
                        this.updateDropdown(labels, matches);
                    }
                }, this);
            }
        },

        parseMatches: function(matches) {
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
        addItems: function(items, dataObjects) {
            var html = ''
              , fragment = document.createDocumentFragment()
              , li
              , text;

            for (var i = 0; i < items.length; i++) {
                li = document.createElement('li');
                // Using innerHTML so we can potentially append
                // more HTML
                li.innerHTML = items[i];
                fragment.appendChild(li);
            }

            this.dropdown.appendChild(fragment.cloneNode(true));
            this.setData(dataObjects);
            this.bindItems();
        },

        /*
         * Bind click and hover events to the list items
         */
        bindItems: function() {
            var _this = this
              , items = this.getDropdownItems()
              , handler
              , wrapper = document;

            // Bind a click and hover event to each list item
            for (var i = 0; i < items.length; i++) {

                var clickHandler = function(ev) {
                    _this.triggerSelect.call(_this, ev.target);
                };

                var hoverHandler = (function(i) {
                    return function(ev) {
                        _this.triggerHover.call(_this, ev.target, i);
                    };
                })(i);

                this.registerEventListener(items[i], 'click', clickHandler, this.clickHandlers);
                this.registerEventListener(items[i], 'mouseover', hoverHandler, this.hoverHandlers);
            }
        },

        // Unbind all events from all list items
        unbindItems: function() {
            var items = this.getDropdownItems();
            for (var i = 0; i < items.length; i++) {
                items[i].removeEventListener('click', this.clickHandlers[i], false);
                items[i].removeEventListener('mouseover', this.hoverHandlers[i], false);
            }

            this.resetHandlers();
        },

        // Bind an event to an element
        // element: the element to add the event listener to
        // ev: the event to trigger (click, mouseover)
        // handler: the function handler
        // list: the list to add the function handler to for unbinding
        registerEventListener: function(element, ev, handler, list) {
            if (!element) return;
            element.addEventListener(ev, handler, false);
            list.push(handler);
        },

        // Empty out event handlers
        // Called when items are unbound or new items are bound
        resetHandlers: function() {
            this.clickHandlers = [];
            this.hoverHandlers = [];
        },

        // Perform default click behavior and call the optional onSelect function
        triggerSelect: function(item) {
            // Default autocomplete behavior
            this.deselectItems(this.getActiveItems());
            addClass(item, ACTIVE_CLASS);

            // Optional behavior
            if (typeof this.options.onSelect === 'function') {
                var data = DataStore.get(item, 'data');
                this.options.onSelect(item, data);
            }
        },

        // Perform default mouseover behavior and call the optional onHover function
        triggerHover: function(item, index) {
            // Default autocomplete behavior
            var activeItems = this.getActiveItems();
            var itemsToDeselect = [];

            for (var j = 0; j < activeItems.length; j++) {
                if (activeItems[j] !== item) {
                    itemsToDeselect.push(activeItems[j]);
                }
            }

            addClass(item, ACTIVE_CLASS);
            this.deselectItems(itemsToDeselect);
            this.setIndex(index);

            // Optional behavior
            if (typeof this.options.onHover === 'function') {
                var data = {};
                this.options.onHover(item, data);
            }
        },

        updateDropdown: function(labels, dataObjects) {
            // Always clear the dropdown with a new search
            this.clearDropdown();

            // No matches returned, hide the dropdown
            if (labels.length === 0) {
                this.hideDropdown();
                return;
            }

            // Matches returned, add the matches to the list
            // and display the dropdown
            this.addItems(labels, dataObjects);
            this.displayDropdown();
        },

        createDropdown: function() {
            var list = generateList();

            // Grab the unordered list
            this.dropdown = list.dropdown;

            this.setIndex();

            // Append a unique ID
            this.dropdown.id = 'dropdown' + this.uid;

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

        getActiveItems: function() {
            return this.dropdown.getElementsByClassName(ACTIVE_CLASS);
        },

        displayDropdown: function() {
            this.dropdown.style.display = 'block';
        },

        hideDropdown: function() {
            this.dropdown.style.display = 'none';
        },

        clearDropdown: function() {
            // Remove all event listeners
            this.unbindItems();

            // Clear data from the data store
            this.clearData();

            // Completely remove all of the elements
            this.dropdown.innerHTML = '';
        },

        setData: function(dataObjects) {
            if (!dataObjects || dataObjects.length === 0) return;

            var items = this.getDropdownItems();
            for (var i = 0; i < items.length; i++) {
                DataStore.set(items[i], 'data', dataObjects[i]);
            }
        },

        clearData: function() {
            var items = this.getDropdownItems();
            for (var i = 0; i < items.length; i++) {
                DataStore.remove(items[i]);
            }
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
            this.deselectItems(this.getActiveItems());

            if (decrement) {
                this.index--
            }
            else {
                this.index++;
            }

            this.selectItem(this.index);
        },

        setIndex: function(idx) {
            this.index = idx || idx === 0 ? idx : -1;
        },

        getId: function() {
            return this.uid;
        }
    };

    return typeAhead;
    
})();
