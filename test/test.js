/**
 * Created by jjallen on 1/29/15.
 */
$(document).ready(function(){

    var div = null;
    //$('#div1').click(function(){
    //    console.log('spotlight 1');
    //    $('#spotlight2').spotlight();
    //});
    $('#spotlight3').click(function(){
        if (div === null){return;}

        $(div).trigger('exit_event');
    });
    $('div').click(function(){
        $(this).spotlight({color:'#ff0000'});
        div = this;
    });
});

