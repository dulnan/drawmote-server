var documentBody = document.body;

var Drawmote = Drawmote || {};

Drawmote.Desktop = {};

//=require Helpers.js
//=require Brush.js
//=require Vector/Vector.js
//=require Vector/Plane.js
//=require Vector/Line.js
//=require Desktop/Desktop.Socket.js
//=require Desktop/Desktop.Interface.js
//=require Desktop/Desktop.Data.js
//=require Desktop/Desktop.Canvas.js


Drawmote.Desktop.init = function() {
    this.brush = new Drawmote.Brush();
    this.elSetupCode = getElementById('setup-code');

    Drawmote.Desktop.Socket.init();
    Drawmote.Desktop.Canvas.init();
    Drawmote.Desktop.Interface.init();

    Drawmote.Desktop.Socket.getCode(function(response) {
        // this.elSetupCode.innerHTML = response;
    });
};

Drawmote.Desktop.handleMobileConnected = function() {
    Drawmote.Desktop.Interface.prepareDrawView();
};

Drawmote.Desktop.handleDataChange = function(data) {
    Drawmote.Data.gyroscope.alpha = data.alpha;
    Drawmote.Data.gyroscope.beta = data.beta;
};

Drawmote.Desktop.handleBrushChange = function(brush) {
    this.brush = brush;
    Drawmote.Desktop.Interface.setBrush(this.brush);
};

Drawmote.Desktop.handleBrushModeChange = function(brushMode) {
    this.brush.mode = brushMode;
    Drawmote.Desktop.Interface.setBrushMode(this.brush.mode);
};

document.addEventListener("DOMContentLoaded", function(event) {
    Drawmote.Desktop.init();
});