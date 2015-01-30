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

	$.fn.addSwitchNavigation = function(options){
		return this.each(function(){
			// make sure a keyboard is attached
			var node = null;
			var o, k, base = $(this).data('keyboard'),
				defaults = {
					parentClass 	: 'kb-node', 		// css class added when toggle mode is on
					nodeClass 	: 'ui-state-hover',  // css class added when toggle mode is on
					layout		: 'qwerty',
					selectKey	: 37,
					scanKey		: 39,
					lives		: 1
				};
			if (!base) { return; }

			base.navigation_options = o = $.extend({}, defaults, options);
			//// save navigation settings - disabled when the toggled
			//base.saveNav = [ base.options.tabNavigation, base.options.enterNavigation ];

			// Highlights initial key
			// Binds select and scan keys
			base.navigation_init = function(){
				console.log('navigation init');
				//TODO hardcoded
				var kbs = {
					'num' :
                        ['0,0   0,1   0,2   0,3,0',
                        '1     2,0   2,1   2,2',
                        '3,0,0 3,0,1 3,0,2 2,3',
                        '3,1,0 3,1,1 3,1,2 2,4',
                        '3,2,0 3,2,1 3,2,2 2,5',
                        '3,3,0 3,3,1 4,0   4,1'],
					'qwerty' :
						['0,0 1,1 1,2 1,3 1,4 1,5 1,6 1,7 1,8 1,9 1,0 0,1 0,2 2,0',
						'2,1 3,0,0 3,0,1 3,0,2 3,0,3 3,0,4 3,0,5 3,0,6 3,0,7 3,0,8 3,0,9 0,3 0,4 0,5',
						'3,1,0 3,1,1 3,1,2 3,1,3 3,1,4 3,1,5 3,1,6 3,1,7 3,1,8 0,6 0,7 2,2',
						'2,3 3,2,0 3,2,1 3,2,2 3,2,3 3,2,4 3,2,5 3,2,6 0,8 0,9 0,10 2,4',
						'2,5 2,6 2,7']
				} ;
				node = buildGraph(kbs[o.layout]);
				base.selectNode(node.children[0]);

				//// Bind keyboard presses to this extension
				//base.$preview
				//	.unbind('keydown.keyboardNav')
				//	.bind('keydown.keyboardNav',function(e){
				//		if (e.keyCode == o.selectKey){
				//			base.select();
				//		} else if (e.keyCode == o.scanKey) {
				//			base.scan();
				//		}
				//	});
			};

			base.scan = function (){
				console.log("lives:"+node.parent);
				var parent = node.parent;
				var i = (parent.index + 1) % parent.children.length;


				// Root node cycles
				if (parent.parent === null){
					parent.index = i;
					base.selectNode(parent.getSelectedNode());
				} else if (parent.children[i].lives == 0){
					// Move to parent node
					parent.resetLives(o.lives); // Reset sibling nodes
					base.selectNode(parent);
				} else {
					parent.index = i;
					base.selectNode(parent.getSelectedNode());
				}
			};

			base.select = function (){
				// A keyboard button, press it
				node.parent.resetLives(o.lives);
				if (node.isLeaf()){
					base.$keyboard
						.find('.ui-keyboard-keyset:visible')
						.find('.ui-keyboard-button[data-pos="' +
						node.loc[0] + ',' + node.loc[1] + '"]')
						.trigger('repeater.keyboard');
					// Allow buttons on top level
					if (node.parent.parent !== null){
						base.selectNode(node.parent);
					}
				} else {
					node.resetLives(o.lives);
					base.selectNode(node.getSelectedNode());
				}
			};

			base.setNodeClass = function(aNode, className){
				var locs = aNode.getChildLocations();
				for (var i = 0; i < locs.length; i++){
					var loc = locs[i];
					var child = base.$keyboard.find('.ui-keyboard-keyset:visible')
						.find('.ui-keyboard-button[data-pos="' + loc[0] + ',' + loc[1] + '"]');
						child.addClass(className);
				}
			};

			base.selectNode = function(newNode){
				if (newNode == node){ return; }
				// Unselect old node
				var vis = base.$keyboard.find('.ui-keyboard-keyset:visible');
				vis.find('.'+ o.parentClass).removeClass(o.parentClass);
				vis.find('.'+ o.nodeClass).removeClass(o.nodeClass);

				// Assign new node
				node = newNode;
				node.lives--;

				// Select new node
				base.setNodeClass(node.parent, o.parentClass, true);
				base.setNodeClass(node, o.nodeClass, true);
			};




			// visible event is fired before this extension is initialized, so check!
			if (base.options.alwaysOpen && base.isVisible) {
				base.$keyboard.find('.ui-state-hover').removeClass('ui-state-hover');
				base.navigation_init();
			}
			// TODO Test typing extension
			// capture and simulate typing
			base.$el
				.bind('visible.keyboard', function(e){
					base.$keyboard.find('.ui-state-hover').removeClass('ui-state-hover');
					base.navigation_init();
				})
				.bind('inactive.keyboard hidden.keyboard', function(e){
					//base.checkKeys(e.which, true); // disable toggle mode & revert navigation options
				})
				.bind('scan', function(e){
					base.scan();
				})
				.bind('select', function(e){
					base.select();
				});
		});
	};
})(jQuery);


function Node(parent){
	var self = this;
	this.parent = parent; // If null, this node is the root
	this.loc = null; // If true, this node is a button
	this.children = []; // Contains subgroups
	this.index = 0; //
	this.lives = 1; //
	this.isLeaf = function(){ return (self.loc != null);};
	this.getSelectedNode = function(){
		if (self.children.length == 0 ||
			self.children.length > self.index){
			return self.children[self.index];
		} else {
			return null;
		}
	};

	this.addChild = function(rowPath, loc){
		// Assertions
		if (rowPath.length == 0){  return;  }
		// Index of child to be added
		var i = rowPath[0];
		// Group now represents subgroups
		rowPath.shift();
		// This is a button and there is still path data
		if (self.isLeaf() && rowPath.length != 0){
			// Might be useful
			self.index = rowPath[0];
		}
		// Create child node if it doesn't exist
		if (typeof self.children[i] == 'undefined'){
			self.children[i] = new Node(this);
		}
		// Recursively add subgroups
		if (rowPath.length != 0) {
			self.children[i].addChild(rowPath, loc);
		} else {
			self.children[i].loc = loc;
		}
	};

	this.getChildLocations = function(){
		// Base case
		if (self.loc !== null){
			return [self.loc];
		}

		// Recursively add child nodes
		var locs = [];
		for (var i = 0; i < self.children.length; i++){
			var child = self.children[i];
			locs.push.apply(locs,child.getChildLocations());
		}
		return locs;
	};

	this.resetLives = function(lives){
		for (var i = 0; i < self.children.length; i++){
            self.children[i].lives = lives;
        }
	}
}
function buildGraph(graph){
	// 2d array mapping coordinate to switch groups
	// Column array dynamically allocated
	var kb_to_graph = new Array(graph.length);
	var root = new Node(null);

	// Loop o
	for (var row = 0; row < graph.length; row++){
		var groups = graph[row].trim().split(/\s+/);
		kb_to_graph[row] = []; // Create 2nd demension
		for (var col = 0; col < groups.length; col++){
			var rowPath = JSON.parse('['+groups[col]+']');
			kb_to_graph[row][col] = rowPath;
			root.addChild(rowPath,[row,col]);
		}
	}
	return root;
}

/*
Based off of layout : 'num'
 '= ( ) {b}',
 '{clear} / * -',
 '7 8 9 +',
 '4 5 6 {sign}',
 '1 2 3 %',
 '0 {dec} {a} {c}'
 */
function practice(){
	var numpad =  [
		'0,0   0,1   0,2   0,3,0',
		'1     2,0   2,1   2,2',
		'3,0,0 3,0,1 3,0,2 2,3',
		'3,1,0 3,1,1 3,1,2 2,4',
		'3,2,0 3,2,1 3,2,2 2,5',
		'3,3,0 3,3,1 4,0   4,1'];

	//['` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
	//	'{tab} q w e r t y u i o p [ ] \\',
	//	'a s d f g h j k l ; \' {enter}',
	//	'{shift} z x c v b n m , . / {shift}',
	//	'{accept} {space} {cancel}'];
		var qwerty =
			['0,0 1,1 1,2 1,3 1,4 1,5 1,6 1,7 1,8 1,9 1,0 0,1 0,2 2,0',
            '2,1 3,0,0 3,0,1 3,0,2 3,0,3 3,0,4 3,0,5 3,0,6 3,0,7 3,0,8 3,0,9 0,3 0,4 0,5',
            '3,1,0 3,1,1 3,1,2 3,1,3 3,1,4 3,1,5 3,1,6 3,1,7 3,1,8 0,6 0,7 2,2',
            '2,3 3,2,0 3,2,1 3,2,2 3,2,3 3,2,4 3,2,5 3,2,6 0,8 0,9 0,10 2,4',
            '2,5 2,6 2,7'];
	var root = buildGraph(numpad);
	var locs = root.getChildLocations();
	root.getChildLocations().forEach(function(loc){
	});
}


