/**
 * Created by jjallen on 1/29/15.
 */
$(document).ready(function(){

    var $layer1 = $('#layer-1');
    var $layer2 = $('#layer-2');
    var $layer3 = $('#layer-3');
    $layer1.hide();
    $layer2.hide();
    $layer3.hide();

    $('#btn-1').click(function(e){
        $('#div1').spotlight({z_index:1000});
        //$layer1.show();
        //$layer1.animate({opacity:.4});
    });
    $('#btn-2').click(function(e){
        $('#div2').spotlight({z_index:1002});
        //$layer2.show();
        //$layer2.animate({opacity:.4});
    });
    $('#btn-3').click(function(e){
        $('#div3').spotlight({z_index:1004});
        //$layer3.show();
        //$layer3.animate({opacity:.4});
    });
});

