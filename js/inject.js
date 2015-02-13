var Inject = (function (){
	// constants ----------------------------------------------------------------
	var ID = {
		CONTAINER		: 'menu-container',
		IFRAME_PREFIX	: 'menu-iframe-'
	};
	/*
		Character codes for the scan and select input.
	 */
	var KEYS = {
		SCAN		: 39,
		SELECT		: 37
	};
	/*
		Program state that handles scan/select input
	 */
	var STATES = {
		MENU		: 0,
		KB			: 1
	};
	/*
		All tabbable/selectable elements
	 */
	var LEAF_SELECTORS = [
		'a[href]:visible',
		'input:visible',
		//'input[type=text]',
		//'input[type=checkbox]',
		//'input[type=radio]',
		//'input[type=submit]',
		'input[type!=hidden]',
		'button:visible',
		'textarea:visible',
		'select:visible'
	];

	var EXIT_EVENT = "spotlight_exit_event";

	// variables ----------------------------------------------------------------
	var _this		= {},
		_views		= {},
		_state		= STATES.MENU,
		_container	= null,
		_overlay	= null,
		_node		= null,
		_z_index	= 1000;
	
	// initialize ---------------------------------------------------------------
	_this.init = function (){
		// Set up sticky footer
		var push = $('<div />', {id:'switch-navigation-push'});
		push.appendTo(document.body);
		$(document.body).wrapInner($('<div/>',{id:'switch-navigation-wrapper'}));

		// Create NavTree
		_node = new NavTree(null,document.body); // Root node
		_node = NavTree.buildTree(_node,_node.elt);
		$(_node.elt).spotlight({z_index:_z_index});
		_z_index+=2;
		var selected1 = _node.getSelectedNode();
		$(selected1.elt).spotlight({z_index:_z_index});
		_z_index+=2;
		//_node.decorateNode(true);

		// create the main container
		_container = $('<div />', {id:ID.CONTAINER});
		_container.appendTo(document.body);

		// add the "menu" iframe
		//getView('keyboard', _container).iframe.hide();
		getView('menu', _container);

		// listen to the iframes/webpages message
		window.addEventListener("message", dom_onMessage, false);

		// listen to the Control Center (background.js) messages
		chrome.extension.onMessage.addListener(background_onMessage);


		$(document).on('keydown',function(e){
			var view = (_state == STATES.MENU) ? 'menu' : 'keyboard';
			switch (e.which){
				case KEYS.SCAN:
					// tell the "comment" iframe to show dynamic info (the page title)
					tell ('input-scan',{view:view, url:window.location.href});
					e.preventDefault();
					break;
				case KEYS.SELECT:
					tell ('input-select',{view:view, url:window.location.href});
					e.preventDefault();
					break;
			}
		});
	};

	// private functions --------------------------------------------------------
	function getView (id){
		// return the view if it's already created
		if (_views[id]) return _views[id];
		
		// iframe initial details
		var src		= chrome.extension.getURL('html/iframe/'+id+'.html?view='+id+'&_'+(new Date().getTime())),
			iframe	= $('<iframe />', {id:ID.IFRAME_PREFIX+id, src:src, scrolling:false});

		// view
		_views[id] = {
			isLoaded	: false,
			iframe		: iframe
		};
		
		// add to the container
		_container.append(iframe);
		
		return _views[id];
	};
	
	function tell (message, data){
		var data = data || {};
		
		// send a message to "background.js"
		chrome.extension.sendRequest({
			message : message,
			data	: data
		});
	};

	function processMessage (request){
		if (!request.message) return;

		switch (request.message){
			case 'iframe-loaded': message_onIframeLoaded(request.data); break;
			case 'action-scan': message_onScanClicked(request.data); break;
			case 'action-select': message_onSelectClicked(request.data); break;
			case 'action-scroll-down': message_onScrollDownClicked(request.data); break;
			case 'action-scroll-up': message_onScrollUpClicked(request.data); break;
			case 'action-kb-accept': message_onKbAccept(request.data); break;
			case 'action-kb-cancel': message_onKbCancel(request.data); break;
		}
	};
	
	// events -------------------------------------------------------------------	
	// messages coming from iframes and the current webpage
	function dom_onMessage (event){		
		if (!event.data.message) return;
		
		// tell another iframe a message
		if (event.data.view){
			tell(event.data);
		}else{
			processMessage(event.data);
		}
	};
	
	// messages coming from "background.js"
	function background_onMessage (request, sender, sendResponse){
		if (request.data.view) return;		
		processMessage(request);
	};
	
	// messages -----------------------------------------------------------------
	function message_onIframeLoaded (data){
		var view 		= getView(data.source),
			allLoaded	= true;
		
		view.isLoaded = true;
		
		for (var i in _views){
			if (_views[i].isLoaded === false) allLoaded = false;
		}
		
		// tell "background.js" that all the frames are loaded
		if (allLoaded) tell('all-iframes-loaded');
	};
	
	function message_onScanClicked (data){
		var selected = _node.getSelectedNode();
		$(selected.elt).trigger(EXIT_EVENT);
		//_z_index-=2;
		// End of non-circular row, select parent
		if (_node.children.length >= (_node.activeIndex + 1) &&
			_node.parent != null){
			$(_node.elt).trigger(EXIT_EVENT);
			_z_index-=2;
			_node = _node.parent;
			_node.activeIndex = 0;
		} else {
			_node.activeIndex =  (_node.activeIndex + 1) % _node.children.length;
		}
		selected = _node.getSelectedNode();
		$(selected.elt).spotlight({z_index:_z_index});
		_z_index+=2;
		$(document.body).scrollTop($(_node.elt).offset().top - 100);
	};
		
	function message_onSelectClicked (data){
		var activeNode = _node.getSelectedNode();
		if (activeNode.children.length == 1){
            var $aElt;
			if( activeNode.isLeaf) {
				$aElt = $(activeNode.elt);
			} else {
				$aElt = $(activeNode.children[0].elt);
			}

			//$aElt.spotlight();
			if ( $aElt.is('input[type=text]')){
				_state = STATES.KB;

				getView('keyboard', _container).iframe.show();
				getView('menu', _container).iframe.hide();
			} else {
				$aElt[0].click();
			}
		} else {
			_node = activeNode;
			_node.activeIndex = 0;
			$(_node.elt).spotlight({z_index:_z_index});
			_z_index+=2;
			$(document.body).scrollTop($(_node.elt).offset().top - 100);
		}
	};

	function message_onScrollDownClicked (data){
		window.scrollBy(0,50); // horizontal and vertical scroll increments
	};
	function message_onScrollUpClicked (data){
		window.scrollBy(0,-50); // horizontal and vertical scroll increments
	};
	function message_onKbAccept (data){
		_state = STATES.MENU;
		getView('keyboard', _container).iframe.hide();
		getView('menu', _container).iframe.show();
	};
	function message_onKbCancel (data){
		_state = STATES.MENU;
		getView('keyboard', _container).iframe.hide();
		getView('menu', _container).iframe.show();
	};

	return _this;
}());
//document.addEventListener("DOMContentLoaded", function (){ Inject.init(); }, false);
Inject.init();
