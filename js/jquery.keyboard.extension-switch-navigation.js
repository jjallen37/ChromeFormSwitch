/*
 * jQuery UI Virtual Keyboard Navigation v1.4 for Keyboard v1.18+ only (updated 3/1/2014)
 *
 * By Rob Garrison (aka Mottie & Fudgey)
 * Licensed under the MIT License
 *
 * Use this extension with the Virtual Keyboard to navigate
 * the virtual keyboard keys using the arrow, page, home and end keys
 * Using this extension WILL prevent keyboard navigation inside of all
 * input and textareas
 *
 * Requires:
 *  jQuery
 *  Keyboard plugin : https://github.com/Mottie/Keyboard
 *
 * Setup:
 *  $('.ui-keyboard-input')
 *   .keyboard(options)
 *   .addNavigation();
 *
 *  // or if targeting a specific keyboard
 *  $('#keyboard1')
 *   .keyboard(options)     // keyboard plugin
 *   .addNavigation();    // this keyboard extension
 * 
 */
/*jshint browser:true, jquery:true, unused:false */
(function($){
"use strict";
$.keyboard = $.keyboard || {};

$.keyboard.navigationKeys = {
	toggle		: 112, // toggle key; F1 = 112 (event.which value for function 1 key)
	select		: 37,  // left
	scan		: 39  // right
};

$.fn.addSwitchNavigation = function(options){
	return this.each(function(){
		// make sure a keyboard is attached
		var o, k, base = $(this).data('keyboard'),
			defaults = {
				position   : [0,0],     // set start position [row-number, key-index]
				toggleMode : false,     // true = navigate the virtual keyboard, false = navigate in input/textarea
				focusClass : 'hasFocus' // css class added when toggle mode is on
			};
		if (!base) { return; }

		base.navigation_options = o = $.extend({}, defaults, options);
		base.navigation_keys = k = $.extend({}, $.keyboard.navigationKeys);
		// save navigation settings - disabled when the toggled
		base.saveNav = [ base.options.tabNavigation, base.options.enterNavigation ];
		base.allNavKeys = $.map(k, function(v,i){ return v; });

		// Setup
		base.navigation_init = function(){
			// Highlight initial selected key
			base.$keyboard.toggleClass(o.focusClass, o.toggleMode)
				.find('.ui-keyboard-keyset:visible')
				.find('.ui-keyboard-button[data-pos="' + o.position[0] + ',' + o.position[1] + '"]')
				.addClass('ui-state-hover');
			//base.navigateKeys(null, o.position[0], o.position[1]);

			// Bind keyboard presses to this extension
			base.$preview
			.unbind('keydown.keyboardNav')
			.bind('keydown.keyboardNav',function(e){
					return base.checkKeys(e.which);
			});
		};

		// Evaluate keyboard action / extension command
		base.checkKeys = function(key, disable){
			if (typeof(key) === "undefined") {
				return;
			}
			console.log("Check key:"+key);
			var k = base.navigation_keys;
			if (key === k.toggle || disable) {
				o.toggleMode = (disable) ? false : !o.toggleMode;
				base.options.tabNavigation = (o.toggleMode) ? false : base.saveNav[0];
				base.options.enterNavigation = (o.toggleMode) ? false : base.saveNav[1];
			}
			base.$keyboard.toggleClass(o.focusClass, o.toggleMode);
			var isRow = (o.position[1] < 0);
			if (o.toggleMode && key === k.select ) {
				if (isRow){ // Select row, highlight first button
					base.navigateKeys(null, o.position[0], 0);
				} else { // Press selected button
					base.$keyboard
						.find('.ui-keyboard-keyset:visible')
						.find('.ui-keyboard-button[data-pos="' + o.position[0] + ',' + o.position[1] + '"]')
						.trigger('repeater.keyboard');
					base.navigateKeys(null, o.position[0], -1); // Back to row
				}
				return false;
			}

			// Essentially scan
			if ( o.toggleMode && $.inArray(key, base.allNavKeys) >= 0 ) {
				base.navigateKeys(key);
				return false;
			}
		};

		// Navigates directly to key, or performs action
		base.navigateKeys = function(key, row, indx){
			indx = (indx == 0) ? indx : indx || o.position[1];
			row = (row == 0) ? row : row || o.position[0];
			var isRow = (o.position[1] < 0);
			var vis = base.$keyboard.find('.ui-keyboard-keyset:visible'),
				maxRow = vis.find('.ui-keyboard-button-endrow').length - 1,
				maxIndx = vis.find('.ui-keyboard-button[data-pos^="' + row + ',"]').length - 1,
				k = base.navigation_keys;

			// Not explicit coordinates
			if (key === k.scan){
				if (isRow){
					// Select next row
					// If past last row, reselect first row
					row = ((row + 1) > maxRow) ? 0 : row + 1;
				} else {
					// Select next button
					// If past last button, reselect whole row
					indx = ((indx + 1) > maxIndx) ? -1 : indx + 1;
				}
			}

			// Update keyboard highlights
			vis.find('.ui-state-hover').removeClass('ui-state-hover');
			isRow = (indx < 0);
			if (isRow){
				maxIndx = vis.find('.ui-keyboard-button[data-pos^="' + row + ',"]').length - 1;
				for (var i = 0; i <= maxIndx; i++){
					vis.find('.ui-keyboard-button[data-pos="' + row + ',' + i + '"]').addClass('ui-state-hover');
				}
			} else {
				vis.find('.ui-keyboard-button[data-pos="' + row + ',' + indx + '"]').addClass('ui-state-hover');
			}
			o.position = [ row, indx ];
		};

		// visible event is fired before this extension is initialized, so check!
		if (base.options.alwaysOpen && base.isVisible) {
			base.$keyboard.find('.ui-state-hover').removeClass('ui-state-hover');
			base.navigation_init();
		}
		// capture and simulate typing
		base.$el
			// When the keyboard becomes visible, remove any highlighting
			.bind('visible.keyboard', function(e){
				base.$keyboard.find('.ui-state-hover').removeClass('ui-state-hover');
				base.navigation_init();
			})
			.bind('inactive.keyboard hidden.keyboard', function(e){
				base.checkKeys(e.which, true); // disable toggle mode & revert navigation options
			})
			.bind('navigate navigateTo', function(e, row, indx){
				// no row given, check if it's a key name
				row = isNaN(row) ? row.toLowerCase() : row;
				if (base.navigation_keys.hasOwnProperty(row)) {
					base.checkKeys( base.navigation_keys[row] );
				} else {
					base.navigateKeys(null, row, indx);
				}
			});
	});
};
})(jQuery);
