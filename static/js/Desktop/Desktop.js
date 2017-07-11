'use strict';

var Drawmote = Drawmote || {};

Drawmote.Desktop = {};

Drawmote.Desktop.init = function() {
    this.brush = new Drawmote.Brush();

    Drawmote.Desktop.Socket.init();
    Drawmote.Desktop.Canvas.init();
    Drawmote.Desktop.Interface.init();

    Drawmote.Desktop.Socket.getCode(function(response) {
        $(".setup-code").html(response);
    });

    $(window).bind('mobile-connected', Drawmote.Desktop.handleMobileConnected);
    $(window).bind('orientation-change', Drawmote.Desktop.handleDataChange);
    $(window).bind('brush-change', Drawmote.Desktop.handleBrushChange);
    $(window).bind('brush-mode', Drawmote.Desktop.handleBrushModeChange);

};

Drawmote.Desktop.handleMobileConnected = function() {
    Drawmote.Desktop.Interface.prepareDrawView();
};

Drawmote.Desktop.handleDataChange = function(e, data) {
    Drawmote.Desktop.Data.gyroscope.alpha = data.alpha;
    Drawmote.Desktop.Data.gyroscope.beta = data.beta;
};

Drawmote.Desktop.handleBrushChange = function(e, brush) {
    this.brush = brush;
    Drawmote.Desktop.Interface.setBrush(this.brush);
};

Drawmote.Desktop.handleBrushModeChange = function(e, brushMode) {
    this.brush.mode = brushMode;
    Drawmote.Desktop.Interface.setBrushMode(this.brush.mode);
};

$(document).ready(function() {
    Drawmote.Desktop.init();
});
