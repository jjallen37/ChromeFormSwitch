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
        $('#textInput').keyboard({
            alwaysOpen      :   true,
            initialFocus    :   false,
            position        :   {
                //of  :   '$("#textInput")',
                my  :   'center bottom',
                at  :   'center top'
            }
        });
        //TODO Switch Accessible extension
    };

    // private functions --------------------------------------------------------

    // events -------------------------------------------------------------------
    function onMessage (request){
        //console.log('iframe menu message:'+request.message);
        switch (request.message){
            case 'input-scan':
                console.log("kb scan");
                break;
            case 'input-select':
                console.log("kb sel");
                break;
        }
    };

    // messages -----------------------------------------------------------------
    // public functions ---------------------------------------------------------

    return _this;
}());

document.addEventListener("DOMContentLoaded", function (){ new Keyboard.init(); }, false);

