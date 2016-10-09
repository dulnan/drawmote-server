var Drawmote = Drawmote || {};

Drawmote.Desktop.Interface = {};


Drawmote.Desktop.Interface.init = function() {
    this.el = {};
    this.el.canvas = document.getElementById("canvas");

    this.cursorX = 0;
    this.cursorY = 0;
    this.cursorXprev = 0;
    this.cursorYprev = 0;
    this.brushState = "move";
    this.brushStateChanged = false;
};



Drawmote.Desktop.Interface.prepareDrawView = function() {
    Drawmote.Desktop.Interface.setWindowSize();

    this.canvasWidth = this.windowWidth;
    this.canvasHeight = this.windowHeight;

    this.sketchpad = new Sketchpad({
        element: '#canvas',
        width: this.canvasWidth,
        height: this.canvasHeight,
    });

    $(".setup-container").addClass("setup-disappear");

    Drawmote.Desktop.Interface.runFrame();
};



Drawmote.Desktop.Interface.setWindowSize = function() {
    this.windowWidth = $(window).width();
    this.windowHeight = $(window).height();
};



Drawmote.Desktop.Interface.setBrush = function(brush) {
    $("#brush-circle")[0].style.background = brush.color.hex;

    var scale = Drawmote.Helpers.scaleBetween(brush.size, 0.1,1,10,200);
    $("#brush-circle").css("transform", "scale("+scale+")");

    this.sketchpad.color = brush.color.hex;
    this.sketchpad.penSize = brush.size;
};




Drawmote.Desktop.Interface.setBrushMode = function(brushMode) {
    this.brushState = brush.mode;
    this.brushStateChanged = true;
};


/**
 * The main drawing function
 *
 * using requestAnimationFrame() this function calls itself upon
 * finishing. The rate at which this happens is managed by the browser.
 * Normally it ranges somewhere around 60 times per second.
 */
Drawmote.Desktop.Interface.runFrame = function() {
    var gyroscope = Drawmote.Desktop.Data.getGyroscopeData();


    // Alpha
    if (gyroscope.alpha > 180) {
        var alphaBase = Math.abs((gyroscope.alpha - 180) - 180);
    } else {
        var alphaBase = (180 - gyroscope.alpha) - 180;
    }

    alphaBase = Drawmote.Helpers.scaleBetween(alphaBase,0,1,-30,30,true);


    // Beta
    var betaBase = Drawmote.Helpers.scaleBetween(gyroscope.beta,0,1,-20,20,true);

    var translateX = (Math.abs(alphaBase)) * this.windowWidth;
    var translateY = (1 - Math.abs(-betaBase)) * this.windowHeight;

    if (Math.abs(translateX - this.cursorXprev) > 2) {
        this.cursorX = translateX;
        this.cursorXprev = this.cursorX;
    }

    if (Math.abs(translateY - this.cursorYprev) > 2) {
        this.cursorY = translateY;
        this.cursorYprev = this.cursorY;
    }


    $("#brush-anchor").css("transform", "translate3d("+this.cursorX+"px,"+this.cursorY+"px,0)");


    if (this.brushState == "draw") {
        if (this.brushStateChanged == true) {
            $(this.el.canvas).trigger("brush:down");
            this.brushStateChanged = false;
        } else {
            $(this.el.canvas).trigger("brush:move");
        }
    } else {
        if (this.brushStateChanged == true) {
            $(this.el.canvas).trigger("brush:up");
            this.brushStateChanged = false;
        }
    }

    window.requestAnimationFrame(this.runFrame.bind(this));

    $(".data-item--alpha .data-value").html(gyroscope.alpha.toFixed(2));
    $(".data-item--beta .data-value").html(gyroscope.beta.toFixed(2));
};
