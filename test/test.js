/**
 * Created by jjallen on 1/29/15.
 */
$(document).ready(function(){
    $("div.usable").hover(
        function(e){
            $("#overlay").css({"z-index":2,"opacity":.5});
            $(this).addClass("active");
        },
        function(e){
            $("#overlay").css({"z-index":0,"opacity":0});
            $(this).removeClass("active");
        }
    );});

