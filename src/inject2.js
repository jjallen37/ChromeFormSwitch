/**
 *
 * Created by jjallen on 12/3/14.
 */
$(function(){
    $('input[type=text]').each(function (i, input){
        $(input).keyboard({
            alwaysOpen: false
        }).addSwitchNavigation({
                position   : [0,-1],     // set start position [row-number, key-index]
                toggleMode : true,     // true = navigate the virtual keyboard, false = navigate in input/textarea
                focusClass : 'hasFocus' // css class added when toggle mode is on
            });

        // Binding to the "beforeClose" event - it has an extra parameter ("accepted")
        $(input).bind('beforeClose.keyboard', function(e, keyboard, el, accepted){

        });
    });
});
