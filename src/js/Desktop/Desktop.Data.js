function MobileData() {

    this.gyroscope = {
        alpha: 0,
        beta:  0,
        gamma: 0
    };

    this.accelerometer = {
        x: 0,
        y: 0,
        z: 0
    };
};

MobileData.prototype = {
    getGyroscopeData: function () {
        return this.gyroscope;
    },

    getAccelerometerData: function () {
        return this.accelerometer;
    }
}

Drawmote.Data = new MobileData();