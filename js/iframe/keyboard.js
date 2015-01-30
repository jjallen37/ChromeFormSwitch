/**
 *
 * Created by jjallen on 1/29/15.
 */

var Keyboard = (function (){
    // variables ----------------------------------------------------------------
    var _this 		    = {},
        _iframe		    = null;

    // constants
    var SELECTED_CLASS = 'selected';

    // initialize ---------------------------------------------------------------
    _this.init = function (){
        _iframe = new IframeManager();
        _iframe.setListener(onMessage);

        // Hook up keyboard
        $('#textInput')
            .keyboard({
                alwaysOpen      :   true,
                initialFocus    :   false,
                position        :   {
                    //of  :   '$("#textInput")',
                    my  :   'center bottom',
                    at  :   'center top'
                },
                accepted : function(e, keyboard, el){
                    console.log('The content "' + el.value + '" was accepted!');
                    _iframe.tell('action-kb-accept', {});
                }})
            .addSwitchNavigation();
        //TODO Switch Accessible extension
    };

    // private functions --------------------------------------------------------

    // events -------------------------------------------------------------------
    function onMessage (request){
        //console.log('iframe menu message:'+request.message);
        var temp = $('#textInput');
        switch (request.message){
            case 'input-scan':
                temp.trigger('scan');
                break;
            case 'input-select':
                temp.trigger('select');
                break;
        }
    };

    // messages -----------------------------------------------------------------
    // public functions ---------------------------------------------------------

    return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Keyboard.init(); }, false);

