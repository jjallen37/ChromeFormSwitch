/**
 *
 * Created by jjallen on 12/11/14.
 */


var STATE_WEB = 0;
var STATE_INPUT = 1;
var CURRENT_STATE = STATE_WEB;
var node = null;

function initNavigation(){
    var SELECT_KEY = 37;
    var SCAN_KEY = 39;
    var LEAF_SELECTORS =
        [   'a[href]:visible',
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

    var toolbar = makeToolbar();
    $(document.body).append(toolbar);

    // Nav controls
    // 'node' will hold the currently focused node.
    node = new KB_Node(null,document.body); // Root node
    buildGraph(node);
    node.decorateNode(true);

    $(document).on('keydown',function(e) {

        switch (CURRENT_STATE) {
            case STATE_WEB:
                onWebKeydown(e);
                break;
            case STATE_INPUT:
                onInputKeydown(e);
                break;
            default:
                break;
        }
    });

    // User presses key to navigate the web
    function onWebKeydown(e){
        switch (e.which){
            case SELECT_KEY:
                e.preventDefault();
                var selectedNode = node.selectNode();
                if (selectedNode.isLeaf){
                    var aElt = selectedNode.elt;
                    //if ( $(aElt).hasClass('ui-keyboard-input')){
                    //    CURRENT_STATE = STATE_INPUT;
                    //    $(aElt).focus();
                    //} else {
                        $(aElt)[0].click();
                    //}
                } else {
                    node = selectedNode;
                    $(document.body).scrollTop($(node.getSelectedNode().elt).offset().top - 100);
                }
                console.log('select:'+node.getSelectedNode().elt);
                break;
            case SCAN_KEY:
                e.preventDefault();
                node = node.scanNode();
                $(document.body).scrollTop($(node.getSelectedNode().elt).offset().top - 100);
                console.log('scan:'+node.getSelectedNode().elt);
                break;
            default :
                break;
        }
    }

    // User presses key to navigate the keyboard
    function onInputKeydown(e){
        var keyboard = node.getSelectedNode().elt; // Precondition: node.getSelectedNode() is a keyboard input
        switch (e.which){
            case SELECT_KEY:
                $(keyboard).trigger('select');
                break;
            case SCAN_KEY:
                $(keyboard).trigger('scan');
                break;
            default :
                break;
        }
    }

    function buildGraph(node){
        var elt = $(node.elt);
        // Base case for graph
        if (elt.is(LEAF_SELECTORS.join(','))){
            node.isLeaf = true;
            return;
        }

        // All children of current node with leaf descendants
        var branches = elt.children().has(LEAF_SELECTORS.join(','));
        LEAF_SELECTORS.forEach(function(selector,index,array){
            branches = branches.add('> '+selector, elt); // Add leafs from the current directory
        });

        // Propagate link nodes
        if (branches.length == 1){
            node.elt = branches.first()[0];
            buildGraph(node);
            return;
        }

        // Create next layer of nodes
        branches.each(function(i, elt){
            var childNode = new KB_Node(node, elt);
            buildGraph(childNode);
            node.children.push(childNode);
        });
    }

    function makeToolbar(){
        var toolbar = $('<div></div>');
        toolbar.prop('id','kb-toolbar');

        var back = $('<button>Back</button>');
        back.on('click', function (e) {
            window.history.back()
        });
        var forward = $('<button>Forward</button>');
        forward.on('click', function (e) {
            window.history.forward()
        });
        toolbar.append(back);
        toolbar.append(forward);
        return toolbar;
    }
}

function initKeyboard(){
    var INPUT_SELECTORS = ['input[type=text]:visible','textarea:visible'];

    var keyboards = $(document.body).find(INPUT_SELECTORS.join(','));
    $(keyboards).each(function (i, input){
        $(input).keyboard({
            alwaysOpen: false
        }).addSwitchNavigation({
            position   : [0,-1],     // set start position [row-number, key-index]
            toggleMode : true,     // true = navigate the virtual keyboard, false = navigate in input/textarea
            focusClass : 'hasFocus' // css class added when toggle mode is on
        });

        // Binding to the "beforeClose" event - it has an extra parameter ("accepted")
        $(input).bind('hidden.keyboard', function(e, keyboard, el, accepted){
            CURRENT_STATE = STATE_WEB;
            //$(document.body).scrollTop($(node.getSelectedNode().elt).offset().top - 100);
        });
    });
}

initNavigation();
initKeyboard();

