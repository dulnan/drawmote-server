var Drawmote = Drawmote || {};

Drawmote.Desktop.Data = {};

Drawmote.Desktop.Data.gyroscope = {
    alpha: 0,
    beta: 0,
    gamma: 0
};

Drawmote.Desktop.Data.accelerometer = {
    x: 0,
    y: 0,
    z: 0
};

Drawmote.Desktop.Data.init = function() {
    
};

Drawmote.Desktop.Data.getGyroscopeData = function() {
    return {
        alpha: this.gyroscope.alpha,
        beta: this.gyroscope.beta
    }
};

Drawmote.Desktop.Data.getAccelerometerData = function() {
    return {
        x: this.accelerometer.x,
        y: this.accelerometer.y,
        z: this.accelerometer.z
    }
};