/**
 * Created by jjallen on 12/3/14.
 */
/*
 0 = Selecting question on form
 1 = Using question component on form
 2+ = Subcontrol on question component
 */

// Gather all question divs from the form
var form_questions = $(".ss-form-question");
form_questions = $.makeArray(form_questions);
var active_index = -1;

// Some constants
var FORM_STATE = 0;
var QUESTION_STATE = 1;
var state = FORM_STATE;

var LEFT = 37;
var RIGHT = 39;

var elt; // Used to navigate the keyboard
var focusedElt; // Used to navigate the keyboard

var SELECTED_CLASS = "selected_class";

/*
 Highlights the question component while in state 0.
 Handles deselecting previous question.
 */

/*
 Create Keyboard
 */
var kb = $('<table border="1" style="width: 100%"></table>');
kb = kb.append($('<tbody></tbody>'));
var row;

function newRow(){
    if (row == null){
        row = $('<tr></tr>');
        row.addClass("kb_row");
        elt = row;
        elt.addClass("kb_selected");
    } else {
        row = $('<tr></tr>');
        row.addClass("kb_row");
    }
    kb.append(row);
}

function newCharButton(c){
    var btnTemplate = '<td class="tbl_btn">'+c+'</td>';
    var btn = $(btnTemplate);

    if (row !== null){
        row.append(btn);
    } else {
        console.log("No Row!");
    }
}

newRow();
newCharButton('a');
newCharButton('b');
newCharButton('c');
newCharButton('d');
newCharButton('e');
newRow();
newCharButton('f');
newCharButton('g');
newCharButton('h');
newCharButton('i');
newCharButton('j');
newRow();
newCharButton('k');
newCharButton('l');
newCharButton('m');
newCharButton('n');
newCharButton('o');
newRow();
newCharButton('p');
newCharButton('q');
newCharButton('r');
newCharButton('s');
newCharButton('t');
newRow();
newCharButton('u');
newCharButton('v');
newCharButton('w');
newCharButton('x');
newCharButton('y');
newRow();
newCharButton('z');

$(document).on('keydown',function(e){
    switch (state){
        case FORM_STATE:
            handle_keypress_form(e);
            break;
        case QUESTION_STATE:
            handle_keypress_question(e);
            break;
        case ROW_STATE:
            handle_keypress_row(e);
            break;
        case COL_STATE:
            handle_keypress_col(e);
            break;
        default:
            console.log("keypress while in unknown state");
            break;
    }
    e.preventDefault();
});

function select_question(index){
    // Correct new index
    if (index < 0){index = 0;}
    index = index % form_questions.length;

    var prev_question = form_questions[active_index];
    var new_question = form_questions[index];
    active_index = index;

    // Unhighlight the last question
    $(prev_question).css({"color": "","border": "" });
    $(new_question).css({"color":"blue","border":"2px solid blue"});

    $('html, body').animate({
        scrollTop: $(new_question).offset().top-100
    }, 10);
}

// STATE 0
function handle_keypress_form(e){
    // Question selected
    if (e.which == LEFT){
        state = QUESTION_STATE;

        var question = form_questions[active_index];
        var ltr = $(question).children().get(0); // Get first div with type
        var q_type = $(ltr).attr('class').split(' ')[2]; // Sketchy, google puts two spaces inbetween
        // "ss-item  <type"
        switch (q_type){
            case "ss-text":
            case "ss-paragraph-text":
                state = ROW_STATE;
                console.log("before:"+focusedElt);
                handle_keypress_row(-1);
                console.log("after:"+focusedElt);
                break;
            case "ss-radio":
            case "ss-scale":
            case "ss-grid":
                handle_keypress_radio(-1);
                break;
            case "ss-checkbox":
                handle_keypress_checkbox(-1);
                break;
            default :
                console.log("No init for others");
                break;
        }

        $(question).css({"color":"green","border":"2px solid green"});

    } else if (e.which == RIGHT){
        select_question(active_index + 1);
    } else { // Other keypresses are ignored
    }
}

// STATE 1
function handle_keypress_question(e) {
    // Grab the active question div
    var question = form_questions[active_index];
    var ltr = $(question).children().get(0); // Get first div with type
    var q_type = $(ltr).attr('class').split(' ')[2]; // Sketchy, google puts two spaces inbetween
    // "ss-item  <type"
    switch (q_type){
        case "ss-text":
        case "ss-paragraph-text":
            console.log("Should not be here");
            //handle_keypress_text(e);
            break;
        case "ss-radio":
        case "ss-scale":
        case "ss-grid":
            handle_keypress_radio(e);
            return;
            break;
        case "ss-checkbox":
            handle_keypress_checkbox(e);
            return;
            break;
        case "ss-select":
            break;
        case "ss-paragraph-text":
            break;
        case "ss-radio":
            break;
        case "ss-select":
            console.log("select");
            break;
            break;
        case "ss-date":
            break;
        case "ss-time":
            break;
        default :
            console.log("Did not recognize question type:"+q_type);
            break;
    }
    // Question selected
    if (e.which == LEFT){
        state = FORM_STATE;// Default entry right now
    } else if (e.which == RIGHT){
        //console.log("");
    } else { // Other keypresses are ignored
    }
}

var checkbox_num = -1;
function handle_keypress_checkbox(e){
    var question = form_questions[active_index];
    var checkboxes = $.makeArray($(question).find("input[type=checkbox]"));

    if (e < 0){
        //var test = $('<button/>',
        //    {
        //        text: 'Test',
        //        click: function () { alert('hi'); }
        //    });
        //question.append(test);
        checkbox_num = 0;
        $(checkboxes[checkbox_num]).focus();
        return;
    }

    if (checkbox_num < 0){
        checkbox_num = 0;
    }
    checkbox_num %= checkboxes.length+1;

    // Question selected
    if (e.which == LEFT){
        // Back to form
        if (checkbox_num == checkboxes.length){
            state = FORM_STATE;
            $(question).css({"color":"blue","border":"2px solid blue"});
            return;
        }
        var checkbox = checkboxes[checkbox_num];
        checkbox.checked = !checkbox.checked;

    } else if (e.which == RIGHT){
        checkbox_num++;
        checkbox_num %= checkboxes.length+1;
        if (checkbox_num == checkbox){

        } else {
            $(checkboxes[checkbox_num]).focus();
        }
    } else { // Other keypresses are ignored
    }
}

var radio_num = -1;
function handle_keypress_radio(e){
    var question = form_questions[active_index];
    var radios = $.makeArray($(question).find("input[type=radio]"));

    if (e < 0){
        radio_num = 0;
        $(radios[radio_num]).focus();
        return;
    }

    if (radio_num < 0){
        radio_num = 0;
    }
    radio_num %= radios.length+1;

    // Question selected
    if (e.which == LEFT){
        // Back to form
        if (radio_num == radios.length){
            state = FORM_STATE;
            $(question).css({"color":"blue","border":"2px solid blue"});
            return;
        }
        radios[radio_num].checked = true;
    } else if (e.which == RIGHT){
        radio_num++;
        radio_num %= radios.length+1;
        $(radios[radio_num]).focus();
    } else { // Other keypresses are ignored
    }
}

function handle_keypress_text(e){
}

//select_question(0);

//left - 37
//right - 39


var row_passes;
function handle_keypress_row(e){
    var question = form_questions[active_index];
    if (e < 0){
        //elt = kb.children(":first");
        focusedElt = $.makeArray($(question).find("input[type=text]"));
        console.log("assigned elt:"+focusedElt);
        if (!$(focusedElt).is('input')){
            focusedElt = $.makeArray($(question).find("textarea"));
        }
        $(focusedElt).focus();
        $(question).append(kb);
        row_passes = 0;
        return;
    }
    e.preventDefault();

    // Move to next row
    if (e.which == RIGHT){
        if (elt.next().is('tr')){
            elt.removeClass("kb_selected");
            elt = elt.next();
            elt.addClass("kb_selected");
        } else {
            row_passes++;
            if (row_passes >= 2) {
                state = FORM_STATE;
                kb.remove();
                $(question).css({"color":"blue","border":"2px solid blue"});
            }
            elt.removeClass("kb_selected");
            elt = elt.parent();
            elt = elt.children(":first");
            elt.addClass("kb_selected");
        }
    } else if (e.which == LEFT){ // Select row and go to column
        row_passes = 0;
        col_passes = 0;
        state = COL_STATE;
        elt.removeClass("kb_selected");
        elt = elt.children(':first');
        elt.addClass("kb_selected");
    } else {
    }
}

var col_passes = 0;
function handle_keypress_col(e){
    e.preventDefault();
    // Move to next character
    if (e.which == RIGHT){
        if (elt.next().is('td')){
            elt.removeClass("kb_selected");
            elt = elt.next();
            elt.addClass("kb_selected");
        } else { // Return to beginning
            col_passes++;
            if (col_passes == 2) {
                state = ROW_STATE;
                elt.removeClass("kb_selected");
                elt = elt.parent();
                elt.addClass("kb_selected");
            } else {
                elt.removeClass("kb_selected");
                elt = elt.parent();
                elt = elt.children(":first");
                elt.addClass("kb_selected");
            }
        }
    } else if (e.which == LEFT){ // Select character and go to column
        _insertAtCaret($(focusedElt),elt.text());
        state = ROW_STATE;
        elt.removeClass("kb_selected");
        elt = elt.parent();
        elt.addClass("kb_selected");
    } else {
        console.log("row unknown");
    }
}

function _insertAtCaret(element, text) {
    var caretPos = element[0].selectionStart,
        currentValue = element.val();
    element.val(currentValue.substring(0, caretPos) + text + currentValue.substring(caretPos));
}

// scrollTo: Smooth scrolls to target id
function scrollTo(target) {
    var offset;
    var scrollSpeed = 600;
    var wheight = $(window).height();
    //var targetname = target;
    //var windowheight = $(window).height();
    //var pagecenterH = windowheight/2;
    //var targetheight = document.getElementById(targetname).offsetHeight;

    if (viewport()["width"] > 767 && !jQuery.browser.mobile) {
        // Offset anchor location and offset navigation bar if navigation is fixed
        //offset = $(target).offset().top - document.getElementById('navigation').clientHeight;
        offset = $(target).offset().top - $(window).height() / 2 + document.getElementById('navigation').clientHeight + document.getElementById('footer').clientHeight;
    } else {
        // Offset anchor location only since navigation bar is now static
        offset = $(target).offset().top;
    }

    $('html, body').animate({scrollTop:offset}, scrollSpeed);
}


/*
 Actual Program Start
 */

select_question(0);
