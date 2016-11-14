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
