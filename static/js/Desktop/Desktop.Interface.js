'use strict';

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
        height: this.canvasHeight
    });

    // Needed to position the x and y axis so that the phone can later be rotatet around those
    var phoneZPos = 2 * this.windowWidth;
    var xCenter = this.canvasWidth / 2;
    var yCenter = this.canvasHeight / 2;

    this.screenPlane = new Plane(
        new Vector(0, 0, 0),
        new Vector(this.canvasWidth, 0, 0),
        new Vector(0, this.canvasHeight, 0)
    );

    this.xAxis = new Line(
        new Vector(xCenter - 100, yCenter, phoneZPos),
        new Vector(xCenter + 100, yCenter, phoneZPos)
    );

    this.yAxis = new Line(
        new Vector(xCenter, yCenter - 100, phoneZPos),
        new Vector(xCenter, yCenter + 100, phoneZPos)
    );

    this.phoneLine = new Line(
        new Vector(xCenter, yCenter, phoneZPos),
        new Vector(xCenter, yCenter, phoneZPos / 2)
    );

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

Drawmote.Desktop.Interface.setBrushMode = function() {
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

    var alphaBase = (180 - gyroscope.alpha) - 180;
    // Alpha
    if (gyroscope.alpha > 180) {
        var alphaBase = Math.abs((gyroscope.alpha - 180) - 180);
    }

    // Rotate phone line around axis and get intersection with plane (i.e. screen)
    var phoneLinePrime = this.phoneLine.rotateAroundLine(this.yAxis, 180 - gyroscope.alpha)
        .rotateAroundLine(this.xAxis, 180 - gyroscope.beta);
    var interSectionVector = this.screenPlane.getIntersectionWith(phoneLinePrime);

    var translateX = interSectionVector.x; //(Math.abs(interSectionVector.x)) * this.windowWidth;
    var translateY = interSectionVector.y; //(1 - Math.abs(-interSectionVector.y)) * this.windowHeight;

    if (Math.abs(translateX - this.cursorXprev) > 2) {
        this.cursorX = translateX;
        this.cursorXprev = this.cursorX;
    }

    if (Math.abs(translateY - this.cursorYprev) > 2) {
        this.cursorY = translateY;
        this.cursorYprev = this.cursorY;
    }

    $("#brush-anchor").css("transform", "translate3d("+this.cursorX+"px,"+this.cursorY+"px,0)");

    if (this.brushState === "draw") {
        if (this.brushStateChanged === true) {
            $(this.el.canvas).trigger("brush:down");
            this.brushStateChanged = false;
        } else {
            $(this.el.canvas).trigger("brush:move");
        }
    } else {
        if (this.brushStateChanged === true) {
            $(this.el.canvas).trigger("brush:up");
            this.brushStateChanged = false;
        }
    }

    window.requestAnimationFrame(this.runFrame.bind(this));

    $(".data-item--alpha .data-value").html(gyroscope.alpha.toFixed(2));
    $(".data-item--beta .data-value").html(gyroscope.beta.toFixed(2));
};
