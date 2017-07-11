'use strict';

var Drawmote = Drawmote || {};

var enteredNumber = "";
var enteredNumberCount = 0;

Drawmote.Mobile.Interface = {};

Drawmote.Mobile.Interface.init = function() {
    // Bind Event Listener
    $('body').on('scroll', function(e) {
        e.preventDefault();
    });

    $(document).ready(function() {
        Drawmote.Mobile.validateCode('1234');
    });

    // Get Elements
    this.el = {};
    this.el.brushPreview = document.getElementById("brush-preview");
    this.el.colorsList = document.getElementById("colors-list");

    // Setup/Pairing Part
    $(".code-numpad-num").on("touchstart", function() {
        $(this).addClass("hover");
        enteredNumberCount++;
        enteredNumber += $(this).data("num");

        $(".code-entered-num:eq("+(enteredNumberCount - 1)+")").addClass("code-entered-num--entered")
            .html($(this).data("num"));

        if (enteredNumberCount === 4) {
            Drawmote.Mobile.validateCode(enteredNumber);
        }
    }).on("touchend", function() {
        $(this).removeClass("hover");
    });
};

Drawmote.Mobile.Interface.codeInvalid = function() {
    enteredNumber = "";
    enteredNumberCount = 0;
    $(".code-entered").addClass("animation-wrong-code");
    setTimeout(function() {
        $(".code-entered").removeClass("animation-wrong-code");
        $(".code-entered-num").removeClass("code-entered-num--entered")
            .html("");
    }, 500);
};

Drawmote.Mobile.Interface.prepareDrawView = function () {
    $(".container-setup").addClass("setup-disappear");
        
    setTimeout(function() {
        $(".container-setup").addClass("setup-hide");
    }, 1500);

    setTimeout(function() {
        $(".container-setup").hide();
    }, 2000);


    $("#button-primary").on("touchstart", function(e) {
        e.preventDefault();
        Drawmote.Mobile.setBrushMode("draw");
    }).on("touchend", function() {
        Drawmote.Mobile.setBrushMode("move");
    });

    $("#button-secondary").on("touchstart", function(e) {
        e.preventDefault();
        Drawmote.Mobile.setBrushMode("secondary");
    }).on("touchend", function() {
        Drawmote.Mobile.setBrushMode("move");
    });

    // $('.size-input').on("touchmove", function() {
    //     Drawmote.Mobile.setBrushSize(this.value);

    //     // var scale = Drawmote.Helpers.scaleBetween(this.value, 0.1,1,10,200);
    //     // $(Drawmote.Mobile.Interface.el.brushPreview).css("transform", "scale("+scale+")");
    // });
};
