var Drawmote = Drawmote || {};

var enteredNumber = "";
var enteredNumberCount = 0;


Drawmote.Mobile.Interface = {};

Drawmote.Mobile.Interface.init = function() {
    // Bind Event Listener
    $('body').on('scroll', function(e) {
        e.preventDefault();
    })

    // Get Elements
    this.el = {};
    this.el.brushPreview = document.getElementById("brush-preview");
    this.el.colorsList = document.getElementById("colors-list");


    // Create radio buttons for every color in Drawmote.Colors
    for (var color in Drawmote.Colors) {
        if (Drawmote.Colors.hasOwnProperty(color)) {
            var item = document.createElement("li");
            item.className = "color-item";
            
            var input = document.createElement("input");
            input.className = "color-input";
            input.type = "radio";
            input.name = "color";
            input.value = Drawmote.Colors[color].name;
            input.style.background = Drawmote.Colors[color].hex;

            if(Drawmote.Colors[color].default) {
                input.checked = true;
                this.el.brushPreview.style.background = Drawmote.Colors[color].hex;
            }

            item.appendChild(input);

            this.el.colorsList.appendChild(item);
        }
    }


    // Setup/Pairing Part
    $(".code-numpad-num").on("touchstart", function() {
        $(this).addClass("hover");
        enteredNumberCount++;
        enteredNumber += $(this).data("num");

        $(".code-entered-num:eq("+(enteredNumberCount - 1)+")").addClass("code-entered-num--entered");
        $(".code-entered-num:eq("+(enteredNumberCount - 1)+")").html($(this).data("num"));

        if (enteredNumberCount == 4) {
            Drawmote.Mobile.validateCode(enteredNumber);
        }
    });

    $(".code-numpad-num").on("touchend", function() {
        $(this).removeClass("hover");
    });
}



Drawmote.Mobile.Interface.codeInvalid = function() {
    enteredNumber = "";
    enteredNumberCount = 0;
    $(".code-entered").addClass("animation-wrong-code");
    setTimeout(function() {
        $(".code-entered").removeClass("animation-wrong-code");
        $(".code-entered-num").removeClass("code-entered-num--entered");
        $(".code-entered-num").html("");
    },500);
};



Drawmote.Mobile.Interface.prepareDrawView = function () {
    $(".container-setup").addClass("setup-disappear");
        
    setTimeout(function() {
        $(".container-setup").addClass("setup-hide");
    }, 1500);

    setTimeout(function() {
        $(".container-setup").hide();
    }, 2000);


    $('.color-input').change(function() {
        Drawmote.Mobile.setBrushColor(Drawmote.Colors[this.value]);
        Drawmote.Mobile.Interface.el.brushPreview.style.background = Drawmote.Colors[this.value].hex;
    });

    $("#brush-container").on("touchstart", function() {
        Drawmote.Mobile.setBrushMode("draw");
    });

    $("#brush-container").on("touchend", function() {
        Drawmote.Mobile.setBrushMode("move");
    });

    $('.size-input').on("touchmove", function() {
        Drawmote.Mobile.setBrushSize(this.value);

        var scale = Drawmote.Helpers.scaleBetween(this.value, 0.1,1,10,200);
        $(Drawmote.Mobile.Interface.el.brushPreview).css("transform", "scale("+scale+")");
    });

};