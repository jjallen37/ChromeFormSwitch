/**
 *
 * Created by jjallen on 1/23/15.
 */
var Menu = (function (){
    // constants ----------------------------------------------------------------
    var STATES = {
        MENU_A		: 0,
        MENU_B		: 1
    };

    // variables ----------------------------------------------------------------
    var _this 		    = {},
        _selectedBtn    = null,
        _state          = STATES.MENU_A,
        _iframe		    = null;

    // constants
    var SELECTED_CLASS = 'selected';

    // initialize ---------------------------------------------------------------
    _this.init = function (){
        _iframe = new IframeManager();
        _iframe.setListener(onMessage);

        // Hook up button actions
        $('#scan').on('click', scan_onClick);
        $('#select').on('click', select_onClick);
        $('#web').on('click', web_onClick);
        $('#back').on('click', back_onClick);
        $('#forwards').on('click', forwards_onClick);
        $('#scroll_down').on('click', scrollDown_onClick);
        $('#scroll_up').on('click', scrollUp_onClick);
        $('#url_btn').on('click', url_onClick);

        // Initially select first button
        _selectedBtn = $('#menu_a').children(':first');
        _selectedBtn.toggleClass(SELECTED_CLASS);

        setState(STATES.MENU_A);
    };

    // private functions --------------------------------------------------------
    function setState(newState){
        _selectedBtn.toggleClass(SELECTED_CLASS);
        switch (newState){
            case STATES.MENU_A:
                $('#menu_a').show();
                $('#menu_b').hide();
                _selectedBtn = $('#menu_a').children(':first');
                break;
            case STATES.MENU_B:
                $('#menu_a').hide();
                $('#menu_b').show();
                _selectedBtn = $('#menu_b').children(':first');
                break;
        }
        _selectedBtn.toggleClass(SELECTED_CLASS);
    }

    // events -------------------------------------------------------------------
    function onMessage (request){
        switch (request.message){
            case 'input-scan':
                message_scan();
                break;
            case 'input-select':
                message_select();
                break;
        }
    };

    function scan_onClick (event){
        _iframe.tell('action-scan', {});
    };

    function select_onClick (event){
        _iframe.tell('action-select', {});
        _selectedBtn.toggleClass(SELECTED_CLASS);
        _selectedBtn = $('#menu_a').children(':first');
        _selectedBtn.toggleClass(SELECTED_CLASS);
    };

    function web_onClick (event){
        setState(STATES.MENU_B);
    }
    function back_onClick (event){
        //_iframe.tell('action-back', {});
        window.history.back(); // This wouldn't work because it is relative to the iframe, right?
    };
    function forwards_onClick (event){
        window.history.forward(); // This wouldn't work because it is relative to the iframe, right?
    }
    function scrollDown_onClick (event){
        _iframe.tell('action-scroll-down', {});
    }
    function scrollUp_onClick (event){
        _iframe.tell('action-scroll-up', {});
    }
    function url_onClick (event){}

    // messages -----------------------------------------------------------------
    /*
        Preconditions: _selectedBtn has the class SELECTED_CLASS
                        there is only one element with the said class
     */
    function message_scan(){
        _selectedBtn.toggleClass(SELECTED_CLASS);
        _selectedBtn = $(_selectedBtn).next();
        if (!_selectedBtn.length){
            setState(STATES.MENU_A);
        } else {
            _selectedBtn.toggleClass(SELECTED_CLASS);
        }
        parent.focus();
    };

    function message_select(){
        _selectedBtn.click();
        parent.focus();
    };

    // public functions ---------------------------------------------------------

    return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Menu.init(); }, false);
