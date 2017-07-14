Drawmote.Desktop.Interface = {};

Drawmote.Desktop.Interface.init = function() {

    this.el = {};
    this.el.canvas = getElementById("canvas-drawing-main");
    this.el.toolbar = getElementById("toolbar");
    this.el.setupContainer = getElementById("setup-container");

    this.el.brushCircle = getElementById("brush-circle");
    this.el.brushAnchor = getElementById("brush-anchor");
    this.el.cursorAnchor = getElementById("cursor-anchor");


    this.el.toolbarItemClear = getElementById("toolbar-item--clear");
    this.el.toolbarBrushPreview = getElementById("brush-stroke-preview");

    this.el.toolbarItemClear.addEventListener('click', function() {
        Drawmote.Desktop.Canvas.clearCanvas();
    });

    this.el.toolbarColors = getElementById("toolbar-colors");

    for (var color in Drawmote.Colors) {
        if (Drawmote.Colors.hasOwnProperty(color)) {
            
            var colorItem = document.createElement("div");
            colorItem.className = "toolbar__item toolbar__item--color";
            colorItem.name = "color";
            colorItem.dataset.colorname = Drawmote.Colors[color].name;
            colorItem.style.background = Drawmote.Colors[color].hex;

            if (Drawmote.Colors[color].default) {
                colorItem.classList.add('active');
                Drawmote.Desktop.Interface.setBrushColor(Drawmote.Colors[color].name);
            }

            colorItem.addEventListener('click', function() {
                Drawmote.Desktop.Interface.setBrushColor(this.dataset.colorname);
            });

            this.el.toolbarColors.appendChild(colorItem);
        }
    }

    this.toolbarItems = [];

    var toolbarElements = document.querySelectorAll('.toolbar__item');

    for (var i = 0; i < toolbarElements.length; ++i) {
        var rect = toolbarElements[i].getBoundingClientRect();
        var radius = rect.width / 2;
        this.toolbarItems.push({
            element: toolbarElements[i],
            radius: radius,
            position: {
                x: rect.left + (radius),
                y: rect.top + (radius)
            }
        })
    }

    this.cursorX = 0;
    this.cursorY = 0;
    this.cursorXprev = 0;
    this.cursorYprev = 0;
    this.brushX = 0;
    this.brushY = 0;
    this.brushState = "move";
    this.brushStateChanged = false;

    this.toolbarVisibleByPull = false;
    this.cursorInCanvas = true;

    document.body.classList.add('app-is-ready');
};

Drawmote.Desktop.Interface.prepareDrawView = function() {
    Drawmote.Desktop.Interface.setWindowSize();

    this.canvasWidth = this.windowWidth;
    this.canvasHeight = this.windowHeight;

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

    this.el.setupContainer.classList.add("setup-disappear");

    window.setTimeout(function() {
        this.el.setupContainer.classList.add("setup-hide");
    }, 400);

    Drawmote.Desktop.Interface.runFrame();
};

Drawmote.Desktop.Interface.setWindowSize = function() {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;
};

Drawmote.Desktop.Interface.setBrush = function(brush) {

    this.el.brushCircle.setAttribute("r", brush.size / 2);
    Drawmote.Desktop.Canvas.setSize(brush.size);

    this.el.toolbarBrushPreview.style['strokeWidth'] = brush.size;

};

Drawmote.Desktop.Interface.setBrushMode = function(brushMode) {
    this.brushState = brushMode;
    this.brushStateChanged = true;
};

Drawmote.Desktop.Interface.setBrushColor = function(color) {
    this.el.brushCircle.style.fill = Drawmote.Colors[color].hex;
    Drawmote.Desktop.Canvas.setColor(Drawmote.Colors[color].hex);
    this.el.toolbarBrushPreview.style.stroke = Drawmote.Colors[color].hex;
};

/**
 * The main drawing function
 *
 * using requestAnimationFrame() this function calls itself upon
 * finishing. The rate at which this happens is managed by the browser.
 * Normally it ranges somewhere around 60 times per second.
 */
Drawmote.Desktop.Interface.runFrame = function() {
    var gyroscope = Drawmote.Data.getGyroscopeData();

    var alphaBase = (180 - gyroscope.alpha) - 180;
    // Alpha
    if (gyroscope.alpha > 180) {
        var alphaBase = Math.abs((gyroscope.alpha - 180) - 180);
    }

    // Rotate phone line around axis and get intersection with plane (i.e. screen)
    var phoneLinePrime = this.phoneLine.rotateAroundLine(this.yAxis, 180 - gyroscope.alpha)
        .rotateAroundLine(this.xAxis, 180 - gyroscope.beta);
    var interSectionVector = this.screenPlane.getIntersectionWith(phoneLinePrime);

    var translateX = interSectionVector.x / 2; //(Math.abs(interSectionVector.x)) * this.windowWidth;
    var translateY = interSectionVector.y / 2; //(1 - Math.abs(-interSectionVector.y)) * this.windowHeight;

    this.cursorX = Math.round(translateX);
    this.cursorY = Math.round(translateY);

    var velocity = 15 - (Math.abs(this.cursorX - this.cursorXprev) + Math.abs(this.cursorY - this.cursorYprev)) / 5;
    velocity = Math.max(velocity, 3);

    if (this.brushState !== "draw") {
        this.brushX = Math.round(this.cursorX);
        this.brushY = Math.round(this.cursorY);
    }


    if (this.cursorY <= (-1 * 0.3 * this.windowHeight) && this.cursorInCanvas) {
        this.cursorInCanvas = false;

        if (this.toolbarVisibleByPull == false) {
            this.toolbarVisibleByPull = true;
        } else {
            this.toolbarVisibleByPull = false;
        }
    } else {
        if (this.cursorY >= 40) {
            this.cursorInCanvas = true;
        }
    }
    

    if (this.brushState === "secondary" || this.toolbarVisibleByPull == true) {
        document.body.classList.add('toolbar-is-active');

        for (var i = 0; i < this.toolbarItems.length; ++i) {
            var itemX = this.toolbarItems[i].position.x;
            var itemY = this.toolbarItems[i].position.y;
            var itemRadius = this.toolbarItems[i].radius;
            if (Drawmote.Helpers.pointOutsideCircle(this.cursorX, this.cursorY, itemX, itemY, itemRadius)) {
                this.toolbarItems[i].element.classList.remove('hover');
            } else {
                this.toolbarItems[i].element.classList.add('hover');
                if (this.brushState === "draw") {
                    this.toolbarItems[i].element.click();
                }
            }
        }

    } else {
        document.body.classList.remove('toolbar-is-active');
        for (var i = 0; i < this.toolbarItems.length; ++i) {
            if (this.toolbarItems[i].element.classList.contains('hover')) {
                this.toolbarItems[i].element.click();
                this.toolbarItems[i].element.classList.remove('hover');
            }
        }
    }

    if (Drawmote.Helpers.pointOutsideCircle(this.cursorX, this.cursorY, this.brushX, this.brushY, 40)) {
        this.brushX = Math.round(this.brushX + ((this.cursorX - this.brushX) / velocity));
        this.brushY = Math.round(this.brushY + ((this.cursorY - this.brushY) / velocity));
    }


    this.el.brushAnchor.style.transform = "translate3d("+this.brushX+"px,"+this.brushY+"px,0)";
    this.el.cursorAnchor.style.transform = "translate3d("+this.cursorX+"px,"+this.cursorY+"px,0)";


    if (this.brushState === "draw" && this.toolbarVisibleByPull == false) {
        if (this.brushStateChanged === true) {
            Drawmote.Desktop.Canvas.pointDown(this.brushX, this.brushY);
            this.brushStateChanged = false;
        } else {
            Drawmote.Desktop.Canvas.pointMove(this.brushX, this.brushY);
        }
    } else {
        if (this.brushStateChanged === true) {
            Drawmote.Desktop.Canvas.pointUp();
            this.brushStateChanged = false;
        }
    }

    this.cursorYprev = this.cursorY;
    this.cursorXprev = this.cursorX;

    window.requestAnimationFrame(Drawmote.Desktop.Interface.runFrame.bind(this));
};
