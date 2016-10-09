var Drawmote = Drawmote || {};

Drawmote.Desktop.Socket = {};


Drawmote.Desktop.Socket.init = function() {
    var serverUrl = document.location.protocol + "//" + document.location.host;
    this.socket = io.connect(serverUrl);

    this.socket.on('mobile-on', function(data) {
        $(window).trigger('mobile-connected');
    });

    this.socket.on('orientation', function(orientation) {
        $(window).trigger('orientation-change', orientation);
    })

    this.socket.on('brush-change', function(brush) {
        $(window).trigger('brush-change', brush);
    })

    this.socket.on('brush-mode', function(brushMode) {
        $(window).trigger('brush-mode', brushMode);
    })

};

Drawmote.Desktop.Socket.getCode = function(callback) {
    this.socket.emit('desktop-getcode', "nothing", function(response) {
        callback(response);
    });
}

Drawmote.Desktop.Socket.registerDesktop = function(id) {
    this.socket.emit('desktop-register', {id: id});
}