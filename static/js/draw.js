(function() {
	$(document).ready(function() {

		var ballMass = 10;
		var curRotation = 0;
		var accelModifier = .005;
        var run = false

		var init = function(e) {
			$(window).bind('orientation-change', orientationHandler);
		};

		var orientationHandler = function(e, orientation) {
			
			curRotation = orientation.beta;
            
            if(!run) {
                run = setInterval(runFrame, 500);
            }
		};

		var runFrame = function() {
            //Convert to radians, by the way
			var theta = (180 - (90 + Math.abs(curRotation)) * Math.PI) / 180;

			var force = 2 * Math.cos(theta) * 9.8;

			var accel = (force / ballMass) * accelModifier;

			//Reapply the direction portion of the velocity, because we stripped it out with Math.abs
			accel = curRotation >= 0 ? accel : accel * -1;
            console.log("rotation of " + curRotation + " resulted in acceleration of " + accel);
		}

		$(window).bind('content-ready', init);

	});
})();