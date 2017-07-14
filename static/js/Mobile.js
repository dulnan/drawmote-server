'use strict';

var Drawmote = Drawmote || {};

Drawmote.Mobile = {};

Drawmote.Helpers = {};

Drawmote.Helpers.scaleBetween = function(unscaledNum, minAllowed, maxAllowed, min, max, cap) {
    if (cap) {
        return Math.min(Math.max((maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed,minAllowed),maxAllowed);
    }

    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
};

Drawmote.Helpers.pointOutsideCircle = function(x, y, cx, cy, radius) {
    var distancesqured = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    return distancesqured >= radius * radius;
};

Drawmote.Helpers.hasClass = function(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function getElementById(id){
   return document.getElementById(id);
}
Drawmote.Colors = {};

Drawmote.Colors['greyLight'] = {
    name: "greyLight",
    hex: "#edeeec"
};

Drawmote.Colors['blue'] = {
    name: "blue",
    hex: "#c4e8f7"
};

Drawmote.Colors['green'] = {
    name: "green",
    hex: "#b8ddbe"
};

Drawmote.Colors['yellow'] = {
    name: "yellow",
    hex: "#fdbc4b",
    default: true
};

Drawmote.Colors['red'] = {
    name: "red",
    hex: "#fd794b"
};

Drawmote.Colors['black'] = {
    name: "black",
    hex: "#383c47"
};

Drawmote.Brush = function (size, color, opacity, mode) {
    this.size       = (typeof size !== 'undefined') ?  size : 50;
    this.color      = (typeof color !== 'undefined') ?  color : Drawmote.Colors.yellow;
    this.opacity    = (typeof opacity !== 'undefined') ?  opacity : 1;
    this.mode       = (typeof mode !== 'undefined') ?  mode : "move";
};

/**
 * A JavaScript project for accessing the accelerometer and gyro from various devices
 *
 * @author Tom Gallacher <tom.gallacher23@gmail.com>
 * @copyright Tom Gallacher <http://www.tomg.co>
 * @version 0.0.1a
 * @license MIT License
 * @options frequency, callback
 */
(function (root, factory) {
        if (typeof define === 'function' && define.amd) {
                // AMD. Register as an anonymous module.
                define(factory);
        } else if (typeof exports === 'object') {
                // Node. Does not work with strict CommonJS, but
                // only CommonJS-like enviroments that support module.exports,
                // like Node.
                module.exports = factory();
        } else {
                // Browser globals (root is window)
                root.gyro = factory();
    }
}(this, function () {
    var measurements = {
                x: null,
                y: null,
                z: null,
                alpha: null,
                beta: null,
                gamma: null
            },
            calibration = {
                x: 0,
                y: 0,
                z: 0,
                alpha: 0,
                beta: 0,
                gamma: 0,
                rawAlpha: 0,
                rawBeta: 0,
                rawGamma: 0
            },
            interval = null,
            features = [];

    var gyro = {};

    /**
     * @public
     */
    gyro.frequency = 500; //ms

    gyro.calibrate = function() {
        for (var i in measurements) {
            calibration[i] = (typeof measurements[i] === 'number') ? measurements[i] : 0;
        }
    };

    gyro.getOrientation = function() {
        return measurements;
    };

    gyro.startTracking = function(callback) {
        interval = setInterval(function() {
            callback(measurements);
        }, gyro.frequency);
    };

    gyro.stopTracking = function() {
        clearInterval(interval);
    };

    /**
     * Current available features are:
     * MozOrientation
     * devicemotion
     * deviceorientation
     */
    gyro.hasFeature = function(feature) {
        for (var i in features) {
            if (feature == features[i]) {
                return true;
            }
        }
        return false;
    };

    gyro.getFeatures = function() {
        return features;
    };

    /**
     * @private
     */
    function eulerToQuaternion(e) {
        var s = Math.PI / 180;
        var x = e.beta * s, y = e.gamma * s, z = e.alpha * s;
        var cX = Math.cos(x / 2);
        var cY = Math.cos(y / 2);
        var cZ = Math.cos(z / 2);
        var sX = Math.sin(x / 2);
        var sY = Math.sin(y / 2);
        var sZ = Math.sin(z / 2);
        var w = cX * cY * cZ - sX * sY * sZ;
        x = sX * cY * cZ - cX * sY * sZ;
        y = cX * sY * cZ + sX * cY * sZ;
        z = cX * cY * sZ + sX * sY * cZ;
        return {x:x, y:y, z:z, w:w};
    }
    gyro.eulerToQuaternion=eulerToQuaternion;

    /**
     * @private
     */
    function quaternionMultiply(a, b) {
        return {
            w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
            x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
            y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
            z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w
        };
    }

    /**
     * @private
     */
    function quaternionApply(v, a) {
        v = quaternionMultiply(a, {x:v.x,y:v.y,z:v.z,w:0});
        v = quaternionMultiply(v, {w:a.w, x:-a.x, y:-a.y, z:-a.z});
        return {x:v.x, y:v.y, z:v.z};
    }

    /**
     * @private
     */
    function vectorDot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    /**
     * @private
     */
    function quaternionToEuler(q) {
        var s = 180 / Math.PI;
        var front = quaternionApply({x:0,y:1,z:0}, q);
        var alpha = (front.x == 0 && front.y == 0) ?
            0 : -Math.atan2(front.x, front.y);
        var beta = Math.atan2(front.z,Math.sqrt(front.x*front.x+front.y*front.y));
        var zgSide = {
            x: Math.cos(alpha),
            y: Math.sin(alpha),
            z: 0
        };
        var zgUp = {
            x: Math.sin(alpha) * Math.sin(beta),
            y: -Math.cos(alpha) * Math.sin(beta),
            z: Math.cos(beta)
        };
        var up = quaternionApply({x:0,y:0,z:1}, q);
        var gamma = Math.atan2(vectorDot(up, zgSide), vectorDot(up, zgUp));

        // wrap-around the value according to DeviceOrientation
        // Event Specification
        if (alpha < 0) alpha += 2 * Math.PI;
        if (gamma >= Math.PI * 0.5) {
            gamma -= Math.PI; alpha += Math.PI;
            if (beta > 0) beta = Math.PI - beta;
            else beta = -Math.PI - beta;
        } else if (gamma < Math.PI * -0.5) {
            gamma += Math.PI; alpha += Math.PI;
            if (beta > 0) beta = Math.PI - beta;
            else beta = -Math.PI - beta;
        }
        if (alpha >= 2 * Math.PI) alpha -= 2 * Math.PI;
        return {alpha: alpha * s, beta: beta * s, gamma: gamma * s};
    }

    /**
     * @private
     */
    // it doesn't make sense to depend on a "window" module
    // since deviceorientation & devicemotion make just sense in the browser
    // so old school test used.
    if (window && window.addEventListener) {
        function setupListeners() {
            function MozOrientationInitListener (e) {
                features.push('MozOrientation');
                e.target.removeEventListener('MozOrientation', MozOrientationInitListener, true);

                e.target.addEventListener('MozOrientation', function(e) {
                    measurements.x = e.x - calibration.x;
                    measurements.y = e.y - calibration.y;
                    measurements.z = e.z - calibration.z;
                }, true);
            }
            function deviceMotionListener (e) {
                features.push('devicemotion');
                e.target.removeEventListener('devicemotion', deviceMotionListener, true);

                e.target.addEventListener('devicemotion', function(e) {
                    measurements.x = e.accelerationIncludingGravity.x - calibration.x;
                    measurements.y = e.accelerationIncludingGravity.y - calibration.y;
                    measurements.z = e.accelerationIncludingGravity.z - calibration.z;
                }, true);
            }
            function deviceOrientationListener (e) {
                features.push('deviceorientation');
                e.target.removeEventListener('deviceorientation', deviceOrientationListener, true);

                e.target.addEventListener('deviceorientation', function(e) {
                    var calib = eulerToQuaternion({
                        alpha: calibration.rawAlpha,
                        beta: calibration.rawBeta,
                        gamma: calibration.rawGamma
                    });
                    calib.x *= -1; calib.y *= -1; calib.z *= -1;

                    var raw = eulerToQuaternion({
                        alpha: e.alpha, beta: e.beta, gamma: e.gamma
                    });
                    var calibrated = quaternionMultiply(calib, raw);
                    var calibEuler = quaternionToEuler(calibrated);

                    measurements.alpha = calibEuler.alpha;
                    measurements.beta = calibEuler.beta;
                    measurements.gamma = calibEuler.gamma;

                    measurements.rawAlpha = e.alpha;
                    measurements.rawBeta = e.beta;
                    measurements.rawGamma = e.gamma;
                }, true);
            }

            window.addEventListener('MozOrientation', MozOrientationInitListener, true);
            window.addEventListener('devicemotion', deviceMotionListener, true);
            window.addEventListener('deviceorientation', deviceOrientationListener, true);
        }
        setupListeners();
    }

    return gyro;
}));
'use strict';

var Drawmote = Drawmote || {};

Drawmote.Mobile.Data = {};

Drawmote.Mobile.Data.gyroscope = {
    alpha: 0,
    beta: 0,
    gamma: 0
};

Drawmote.Mobile.Data.accelerometer = {
    x: 0,
    y: 0,
    z: 0
};

Drawmote.Mobile.Data.init = function() {
    gyro.frequency = 20;
    gyro.startTracking(function(o) {
        Drawmote.Mobile.Data.gyroscope.alpha = o.alpha;
        Drawmote.Mobile.Data.gyroscope.beta = o.beta;
        Drawmote.Mobile.Data.gyroscope.gamma = o.gamma;

        Drawmote.Mobile.Data.accelerometer.x = o.x;
        Drawmote.Mobile.Data.accelerometer.y = o.y;
        Drawmote.Mobile.Data.accelerometer.z = o.z;
    });
};

Drawmote.Mobile.Data.getGyroscopeData = function() {
    return {
        alpha: this.gyroscope.alpha,
        beta: this.gyroscope.beta
    }
};

Drawmote.Mobile.Data.getAccelerometerData = function() {
    return {
        x: this.accelerometer.x,
        y: this.accelerometer.y,
        z: this.accelerometer.z
    }
};

'use strict';

var Drawmote = Drawmote || {};

var enteredNumber = "";
var enteredNumberCount = 0;
var touchStartY = 0;

var brushSize = 15;
var newBrushSize = 15;

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
    this.el.brushPreview = getElementById("brush-preview");
    this.el.colorsList = getElementById("colors-list");

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
        this.touchStartY = e.originalEvent.changedTouches[0].clientY;
        Drawmote.Mobile.setBrushMode("draw");
    }).on("touchmove", function(e) {
        newBrushSize = brushSize + Math.round((this.touchStartY - e.originalEvent.changedTouches[0].clientY) / 10);
        newBrushSize = Math.min(100, Math.max(2, newBrushSize));
        console.log(newBrushSize)

        Drawmote.Mobile.setBrushSize(newBrushSize);
    }).on("touchend", function() {
        brushSize = newBrushSize;
        Drawmote.Mobile.setBrushMode("move");
    });

    $("#button-secondary").on("touchstart", function(e) {
        e.preventDefault();
        console.log(e.originalEvent.changedTouches[0].clientY)
        secondaryTouchStartY = e.originalEvent.changedTouches[0].clientY;
        Drawmote.Mobile.setBrushMode("secondary");
    }).on("touchmove", function(e) {

    }).on("touchend", function() {
        Drawmote.Mobile.setBrushMode("move");
    });

    // $('.size-input').on("touchmove", function() {
    //     Drawmote.Mobile.setBrushSize(this.value);

    //     // var scale = Drawmote.Helpers.scaleBetween(this.value, 0.1,1,10,200);
    //     // $(Drawmote.Mobile.Interface.el.brushPreview).css("transform", "scale("+scale+")");
    // });
};

'use strict';

var Drawmote = Drawmote || {};

Drawmote.Mobile.Socket = {};

Drawmote.Mobile.Socket.init = function() {
    this.socket = io.connect(document.location.protocol + "//" + document.location.host);
};

Drawmote.Mobile.Socket.validateCode = function(code, callback) {
    this.socket.emit('mobile-register', {id: code}, function(response) {
        callback(response);
    });
};

Drawmote.Mobile.Socket.changeBrush = function(brush) {
    this.socket.emit('brush-change', brush);
};

Drawmote.Mobile.Socket.changeBrushMode = function(brush) {
    this.socket.emit('brush-mode', brush);
};

Drawmote.Mobile.Socket.sendGyroData = function(gyroData) {
    this.socket.emit('mobile-orientation', gyroData);
};


/**
 * Create a new brush and
 * Initialize Socket, Data and Interface
 */
Drawmote.Mobile.init = function() {
    this.brush = new Drawmote.Brush();

    Drawmote.Mobile.Socket.init();
    Drawmote.Mobile.Data.init();
    Drawmote.Mobile.Interface.init();
};

/**
 * Sends the entered code to the server
 * The validity is handled with a callback
 * @param  {String} code The entered code by the user
 */
Drawmote.Mobile.validateCode = function (code) {
    Drawmote.Mobile.Socket.validateCode(code, function(response) {
        if (response === "valid") {
            Drawmote.Mobile.Interface.prepareDrawView();
            Drawmote.Mobile.startDataStream();
        } else {
            Drawmote.Mobile.Interface.codeInvalid();
        }
    });
};

/**
 * starts the sending the gyro data to the desktop
 */
Drawmote.Mobile.startDataStream = function() {
    Drawmote.Mobile.Socket.changeBrush(this.brush);
    Drawmote.Mobile.Socket.changeBrushMode(this.brush.mode);

    setInterval(function() {
        var gyroscopeValues = Drawmote.Mobile.Data.getGyroscopeData();
        Drawmote.Mobile.Socket.sendGyroData(gyroscopeValues);
    }, 30);
};

Drawmote.Mobile.setBrushColor = function(color) {
    this.brush.color = color;
    Drawmote.Mobile.Socket.changeBrush(this.brush);
};

Drawmote.Mobile.setBrushSize = function(size) {
    this.brush.size = size;
    Drawmote.Mobile.Socket.changeBrush(this.brush);
};

Drawmote.Mobile.setBrushMode = function(mode) {
    this.brush.mode = mode;
    Drawmote.Mobile.Socket.changeBrushMode(mode);
};

$(document).ready(function() {
    Drawmote.Mobile.init();
});
