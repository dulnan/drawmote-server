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
		};

        var setWindowSize = function() {
            windowWidth = $(window).width();
            windowHeight = $(window).height();
        }

        var brushChangeHandler = function(e, data) {
            $("#brush-circle").removeClass();
            $("#brush-circle").addClass("bg--" + data.color);

            scale = scaleBetween(data.size, 0.1,1,10,200);
            $("#brush-anchor").css("transform", "translate3d("+translateX+"px,"+translateY+"px,0) scale("+scale+")");
        };


		var orientationHandler = function(e, data) {
			
            curRotation = data.beta;
			orientation = data;
            
            if(!run) {
                run = setInterval(runFrame, 30);
            }
		};

		var runFrame = function() {

            var betaBase = scaleBetween(orientation.beta,0,1,-20,20,true);

            if (orientation.alpha > 180) {
                var alphaBase = Math.abs((orientation.alpha - 180) - 180);
            } else {
                var alphaBase = (180 - orientation.alpha) - 180;
            }

            alphaBase = scaleBetween(alphaBase,0,1,-30,30,true);

            translateX = alphaBase;
            translateY = -betaBase;

            translateX = (Math.abs(translateX)) * windowWidth;
            translateY = (1 - Math.abs(translateY)) * windowHeight;

            $("#brush-anchor").css("transform", "translate3d("+translateX+"px,"+translateY+"px,0) scale("+scale+")");

            $(".data-item--gamma .data-value").html(orientation.gamma.toFixed(2));
            $(".data-item--beta .data-value").html(orientation.beta.toFixed(2));
            $(".data-item--alpha .data-value").html(orientation.alpha.toFixed(2));
            $(".data-item--vaccel .data-value").html(orientation.vaccel.toFixed(2));
		}


		$(window).bind('content-ready', init);

	});
})();