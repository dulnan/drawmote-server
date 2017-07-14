Drawmote.Desktop.Socket = {};

Drawmote.Desktop.Socket.init = function() {
    var serverUrl = document.location.protocol + "//" + document.location.host;
    this.socket = io.connect(serverUrl);

    this.socket.on('mobile-on', function() {
        Drawmote.Desktop.handleMobileConnected();
    });

    this.socket.on('orientation', function(orientation) {
        Drawmote.Desktop.handleDataChange(orientation);
    });

    this.socket.on('brush-change', function(brush) {
        Drawmote.Desktop.handleBrushChange(brush);
    });

    this.socket.on('brush-mode', function(brushMode) {
        Drawmote.Desktop.handleBrushModeChange(brushMode);
    });
};

Drawmote.Desktop.Socket.getCode = function(callback) {
    this.socket.emit('desktop-getcode', "nothing", function(response) {
        callback(response);
    });
};

Drawmote.Desktop.Socket.registerDesktop = function(id) {
    this.socket.emit('desktop-register', {id: id});
};