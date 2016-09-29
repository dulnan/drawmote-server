var cursorX = 0;
var cursorY = 0;
var cursorXprev = 0;
var cursorYprev = 0;
var brushState = "move";
var brushStateChanged = false;

var colors = {
    text:              "#121212",
    greyExtraLight:    "#faf8f5",
    greyLight:         "#edeeec",
    grey:              "#bebfbb",
    blue:              "#c4e8f7",
    green:             "#b8ddbe",
    yellow:            "#fdbc4b",
    red:               "#fd794b",
    black:             "#383c47"
};

(function() {
	$(document).ready(function() {

		var ballMass = 10;
		var curRotation = 0;
        var orientation;
		var accelModifier = .005;
        var run = false;
        var translateX;
        var translateY;
        var scale;

        var windowWidth;
        var windowHeight;

		var init = function(e) {
            setWindowSize();
            $(window).bind('orientation-change', orientationHandler);
            $(window).bind('brush-change', brushChangeHandler);
			$(window).bind('brush-state', brushStateHandler);
		};

        var setWindowSize = function() {
            windowWidth = $(window).width();
            windowHeight = $(window).height();
        }

        var brushChangeHandler = function(e, data) {
            $("#brush-circle").removeClass();
            $("#brush-circle").addClass("bg--" + data.color);

            scale = scaleBetween(data.size, 0.1,1,10,200);
            $("#brush-circle").css("transform", "scale("+scale+")");

            sketchpad.color = colors[data.color];
            sketchpad.penSize = data.size;

        };

        var brushStateHandler = function(e, data) {
            brushState = data;
            brushStateChanged = true;
        };


		var orientationHandler = function(e, data) {
			
            curRotation = data.beta;
			orientation = data;
            
            if(!run) {
                run = setInterval(runFrame, 30);
            }
		};

		var runFrame = function() {
            if (orientation.alpha > 180) {
                var alphaBase = Math.abs((orientation.alpha - 180) - 180);
            } else {
                var alphaBase = (180 - orientation.alpha) - 180;
            }

            alphaBase = scaleBetween(alphaBase,0,1,-30,30,true);

            var betaBase = scaleBetween(orientation.beta,0,1,-20,20,true);

            translateX = alphaBase;
            translateY = -betaBase;

            translateX = (Math.abs(translateX)) * windowWidth;
            translateY = (1 - Math.abs(translateY)) * windowHeight;

            if (Math.abs(translateX - cursorXprev) > 2) {
                cursorX = translateX;
                cursorXprev = cursorX;
            }

            if (Math.abs(translateY - cursorYprev) > 2) {
                cursorY = translateY;
                cursorYprev = cursorY;
            }


            $("#brush-anchor").css("transform", "translate3d("+cursorX+"px,"+cursorY+"px,0)");

            if (brushState == "draw") {
                if (brushStateChanged == true) {
                    $("#canvas").trigger("brush:down");
                    brushStateChanged = false;
                } else {
                    $("#canvas").trigger("brush:move");
                }
            } else {
                if (brushStateChanged == true) {
                    $("#canvas").trigger("brush:up");
                    brushStateChanged = false;
                }
            }

            $(".data-item--gamma .data-value").html(orientation.gamma.toFixed(2));
            $(".data-item--beta .data-value").html(orientation.beta.toFixed(2));
            $(".data-item--alpha .data-value").html(orientation.alpha.toFixed(2));
            $(".data-item--vaccel .data-value").html(orientation.vaccel.toFixed(2));
		}


		$(window).bind('content-ready', init);

	});
})();