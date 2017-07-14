'use strict';

var Drawmote = Drawmote || {};

Drawmote.Mobile = {};

//=require Helpers.js
//=require Brush.js
//=require Mobile/gyro.js
//=require Mobile/Mobile.Data.js
//=require Mobile/Mobile.Interface.js
//=require Mobile/Mobile.Socket.js

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
