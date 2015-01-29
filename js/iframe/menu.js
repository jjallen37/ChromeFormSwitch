/**
 *
 * Created by jjallen on 1/23/15.
 */
var Menu = (function (){
    // variables ----------------------------------------------------------------
    var _this 		    = {},
        _selectedBtn    = null,
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
        $('#back').on('click', back_onClick);

        // Initially select first button
        _selectedBtn = $('#menu').children(':first');
        _selectedBtn.toggleClass(SELECTED_CLASS);
    };

    // private functions --------------------------------------------------------

    // events -------------------------------------------------------------------
    function onMessage (request){
        //console.log('iframe menu message:'+request.message);
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
        _selectedBtn = $('#menu').children(':first');
        _selectedBtn.toggleClass(SELECTED_CLASS);
    };

    function back_onClick (event){
        _iframe.tell('action-back', {});
    };

    // messages -----------------------------------------------------------------
    /*
        Preconditions: _selectedBtn has the class SELECTED_CLASS
                        there is only one element with the said class
     */
    function message_scan(){
        _selectedBtn.toggleClass(SELECTED_CLASS);
        _selectedBtn = $(_selectedBtn).next();
        if (!_selectedBtn.length){
            _selectedBtn = $('#menu').children(':first');
        }
        _selectedBtn.toggleClass(SELECTED_CLASS);
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
