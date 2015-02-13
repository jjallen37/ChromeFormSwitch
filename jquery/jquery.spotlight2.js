/**
 * jQuery Spotlight
 *
 * Project Page: http://dev7studios.com/portfolio/jquery-spotlight/
 * Copyright (c) 2009 Gilbert Pellegrom, http://www.gilbertpellegrom.co.uk
 * Licensed under the GPL license (http://www.gnu.org/licenses/gpl-3.0.html)
 * Version 1.0 (12/06/2009)
 */
 
(function($) {

	$.fn.spotlight = function(options) {
		// Default settings
		settings = $.extend({}, {
			opacity: .8,
			z_index: 1000,//1000 will be where
			speed: 400,
			color: '#333',
			animate: true,
			easing: '',
			exitEvent: 'spotlight_exit_event',
			onShow: function(){},
			onHide: function(){}
		}, options);

		// if the spotlight has not been created yet
		var spotlight_id = 'spotlight-' + settings.z_index;
		if($('#'+spotlight_id).size() == 0){
			// Get our elements
			var element = $(this);
			//var spotlight = $('</div>',{id:spotlight_id}); // Create layer for this z-index
			var spotlight = $('<div id="'+spotlight_id+'"></div>');

			// Set the CSS styles
			spotlight.css({
				'position':'fixed', 
				'background':settings.color, 
				'opacity':'0', 
				'top':'0px', 
				'left':'0px', 
				'height':'100%', 
				'width':'100%', 
				'z-index':''+settings.z_index
			});

			// Add the overlay div
			$(this).after(spotlight);

			// Set element CSS
			var currentPos = element.css('position');
			if(currentPos == 'static'){
				element.css({'position':'relative', 'z-index':''+settings.z_index+1});
			} else {
				element.css('z-index', ''+settings.z_index+1);
			}
			var currentBgColor = element.css('background-color');
			if(currentBgColor == 'rgba(0, 0, 0, 0)'){ // Transparent
				element.css({'background-color':'inherit'});
			}

			// Fade in the spotlight
			if(settings.animate){
				spotlight.animate({opacity: settings.opacity}, settings.speed, settings.easing, function(){
					// Trigger the onShow callback
					settings.onShow.call(this);
				});
			} else {
				spotlight.css('opacity', settings.opacity);
				// Trigger the onShow callback
				settings.onShow.call(this);
			}
			
			// Set up click to close
			var handle_exit_event = function(e){
				if(settings.animate){
					spotlight.animate({opacity: 0}, settings.speed, settings.easing, function(){
						if(currentPos == 'static') element.css('position', 'static');
						if(currentBgColor == 'rgba(0, 0, 0, 0)')
							element.css('background-color', 'rgba(0, 0, 0, 0)');
						element.css('z-index', '1');
						$(this).remove();
						// Trigger the onHide callback
						settings.onHide.call(this);
					});
				} else {
					spotlight.css('opacity', '0');
					if(currentPos == 'static') element.css('position', 'static');
					if(currentBgColor == 'rgba(0, 0, 0, 0)')
						element.css('background-color', 'rgba(0, 0, 0, 0)');
					element.css('z-index', '1');
					$(this).remove();
					// Trigger the onHide callback
					settings.onHide.call(this);
				}
			};
			// Register exit event handling to the displayed element, as opposed to the spotlight div.
			$(this).on(settings.exitEvent, handle_exit_event);
			spotlight.on('click', handle_exit_event);
		}

		// Returns the jQuery object to allow for chainability.  
		return this;
	};

})(jQuery);