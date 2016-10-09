var Drawmote = Drawmote || {};

Drawmote.Mobile.Socket = {};


Drawmote.Mobile.Socket.init = function() {
    var serverUrl = document.location.protocol + "//" + document.location.host;
    this.socket = io.connect(serverUrl);
};

Drawmote.Mobile.Socket.validateCode = function(code, callback) {
    this.socket.emit('mobile-register', {id: code}, function(response) {
        callback(response);
    });
}

Drawmote.Mobile.Socket.changeBrush = function(brush) {
    this.socket.emit('brush-change', brush);
}


Drawmote.Mobile.Socket.changeBrushMode = function(brush) {
    this.socket.emit('brush-mode', brush);
}

Drawmote.Mobile.Socket.sendGyroData = function(gyroData) {
    this.socket.emit('mobile-orientation', gyroData);
}