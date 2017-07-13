'use strict';

var Drawmote = Drawmote || {};

Drawmote.Desktop.Canvas = {};

Drawmote.Desktop.Canvas.init = function() {
  this.canvas = document.querySelector('#canvas');

  this.ctx = this.canvas.getContext('2d');
  
  this.sketch = document.querySelector('#canvas-container');
  this.sketch_style = getComputedStyle(this.sketch);
  this.canvas.width = parseInt(this.sketch_style.getPropertyValue('width'));
  this.canvas.height = parseInt(this.sketch_style.getPropertyValue('height'));
  
  
  // Creating a tmp canvas
  this.tmp_canvas = document.createElement('canvas');
  this.tmp_ctx = this.tmp_canvas.getContext('2d');
  this.tmp_canvas.id = 'tmp_canvas';
  this.tmp_canvas.width = this.canvas.width;
  this.tmp_canvas.height = this.canvas.height;

  this.tmp_ctx.lineWidth = 20;
  this.tmp_ctx.lineJoin = 'round';
  this.tmp_ctx.lineCap = 'round';
  this.tmp_ctx.strokeStyle = 'blue';
  this.tmp_ctx.fillStyle = 'blue';

  this.tmp_canvas.classList.add('canvas')
  
  this.sketch.appendChild(this.tmp_canvas);

  this.mouse = {x: 0, y: 0};
  this.last_mouse = {x: 0, y: 0};
  
  // Pencil Points
  this.ppts = [];

  this.moveEnabled = false;

  this.tmp_canvas.addEventListener('mousemove', function(e) {
    console.log("x" + e.offsetX);
    console.log("y" + e.offsetY);
  }, false);
};

Drawmote.Desktop.Canvas.setColor = function(hex) {
  this.tmp_ctx.strokeStyle = hex;
  this.tmp_ctx.fillStyle = hex;
}

Drawmote.Desktop.Canvas.setSize = function(size) {
  this.tmp_ctx.lineWidth = size;
}

Drawmote.Desktop.Canvas.clearCanvas = function() {
  this.ctx.clearRect(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
}

Drawmote.Desktop.Canvas.clearTmpCanvas = function() {
  this.tmp_ctx.clearRect(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
}


Drawmote.Desktop.Canvas.pointMove = function(x, y) {
  if (this.moveEnabled) {
    this.mouse.x = x;
    this.mouse.y = y;
    Drawmote.Desktop.Canvas.paint();
  }
}

Drawmote.Desktop.Canvas.pointDown = function(x, y) {
  this.moveEnabled = true;
  this.mouse.x = x;
  this.mouse.y = y;

  this.ppts.push({x: x, y: y});

  Drawmote.Desktop.Canvas.paint();

  // this.ctx.clearRect(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);

}

Drawmote.Desktop.Canvas.pointUp = function() {
  this.moveEnabled = false;
  this.ctx.drawImage(this.tmp_canvas, 0, 0);
    // Clearing tmp canvas
    this.tmp_ctx.clearRect(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
    
    // Emptying up Pencil Points
    this.ppts = [];
}
  

Drawmote.Desktop.Canvas.paint = function() {
  // Saving all the points in an array
  this.ppts.push({x: this.mouse.x, y: this.mouse.y});

  if (this.ppts.length < 3) {
    var b = this.ppts[0];
    this.tmp_ctx.beginPath();
    //ctx.moveTo(b.x, b.y);
    //ctx.lineTo(b.x+50, b.y+50);
    this.tmp_ctx.arc(b.x, b.y, this.tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
    this.tmp_ctx.fill();
    this.tmp_ctx.closePath();

    console.log(b)
    
    return;
  }

  // Tmp canvas is always cleared up before drawing.
  this.tmp_ctx.clearRect(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);

  this.tmp_ctx.beginPath();
  this.tmp_ctx.moveTo(this.ppts[0].x, this.ppts[0].y);

  for (var i = 1; i < this.ppts.length - 2; i++) {
    var c = (this.ppts[i].x + this.ppts[i + 1].x) / 2;
    var d = (this.ppts[i].y + this.ppts[i + 1].y) / 2;
    
    this.tmp_ctx.quadraticCurveTo(this.ppts[i].x, this.ppts[i].y, c, d);
  }

  // For the last 2 points
  this.tmp_ctx.quadraticCurveTo(
    this.ppts[i].x,
    this.ppts[i].y,
    this.ppts[i + 1].x,
    this.ppts[i + 1].y
  );
  this.tmp_ctx.stroke();
};

  










// //    The MIT License (MIT)
// //
// //    Copyright (c) 2014-2016 YIOM
// //
// //    Permission is hereby granted, free of charge, to any person obtaining a copy
// //    of this software and associated documentation files (the "Software"), to deal
// //    in the Software without restriction, including without limitation the rights
// //    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// //    copies of the Software, and to permit persons to whom the Software is
// //    furnished to do so, subject to the following conditions:
// //
// //    The above copyright notice and this permission notice shall be included in
// //    all copies or substantial portions of the Software.
// //
// //    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// //    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// //    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// //    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// //    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// //    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// //    THE SOFTWARE.

// function Sketchpad(config) {
//   // Enforces the context for all functions
//   for (var key in this.constructor.prototype) {
//     this[key] = this[key].bind(this);
//   }

//   // Warn the user if no DOM element was selected
//   if (!config.hasOwnProperty('element')) {
//     console.error('SKETCHPAD ERROR: No element selected');
//     return;
//   }

//   if (typeof(config.element) === 'string') {
//     this.element = $(config.element);
//   }
//   else {
//     this.element = config.element;
//   }

//   // Width can be defined on the HTML or programatically
//   this._width = config.width || this.element.attr('data-width') || 0;
//   this._height = config.height || this.element.attr('data-height') || 0;

//   // Pen attributes
//   this.color = config.color || this.element.attr('data-color') || '#000000';
//   this.penSize = config.penSize || this.element.attr('data-penSize') || 5;

//   // ReadOnly sketchpads may not be modified
//   this.readOnly = config.readOnly ||
//                   this.element.attr('data-readOnly') ||
//                   false;
//   if (!this.readOnly) {
//       this.element.css({cursor: 'crosshair'});
//   }

//   // Stroke control variables
//   this.strokes = config.strokes || [];
//   this._currentStroke = {
//     color: null,
//     size: null,
//     lines: [],
//   };

//   // Undo History
//   this.undoHistory = config.undoHistory || [];

//   // Animation function calls
//   this.animateIds = [];

//   // Set sketching state
//   this._sketching = false;

//   // Setup canvas sketching listeners
//   this.reset();
// }

// //
// // Private API
// //

// Sketchpad.prototype._cursorPosition = function() {
//   return {
//     x: Drawmote.Desktop.Interface.cursorX,
//     y: Drawmote.Desktop.Interface.cursorY
//   };
// };

// Sketchpad.prototype._draw = function(start, end, color, size) {
//   this._stroke(start, end, color, size, 'source-over');
// };

// Sketchpad.prototype._erase = function(start, end, color, size) {
//   this._stroke(start, end, color, size, 'destination-out');
// };

// Sketchpad.prototype._stroke = function(start, end, color, size, compositeOperation) {
//   this.context.save();
//   this.context.lineJoin = 'round';
//   this.context.lineCap = 'round';
//   this.context.strokeStyle = color;
//   this.context.lineWidth = size;
//   this.context.globalCompositeOperation = compositeOperation;
//   this.context.beginPath();
//   this.context.moveTo(start.x, start.y);
//   this.context.lineTo(end.x, end.y);
//   this.context.closePath();
//   this.context.stroke();

//   this.context.restore();
// };

// //
// // Callback Handlers
// //

// Sketchpad.prototype._brushDown = function(event) {
//   this._lastPosition = this._cursorPosition();
//   this._currentStroke.color = this.color;
//   this._currentStroke.size = this.penSize;
//   this._currentStroke.lines = [];
//   this._sketching = true;
//   $(this.canvas).on("brush:move", this._brushMove);
// };

// Sketchpad.prototype._brushUp = function(event) {
//   if (this._sketching) {
//     this.strokes.push($.extend(true, {}, this._currentStroke));
//     this._sketching = false;
//   }
//   $(this.canvas).off("brush:move", this._brushMove);
// };

// Sketchpad.prototype._brushMove = function(event) {
//   var currentPosition = this._cursorPosition();
//   this._draw(this._lastPosition, currentPosition, this.color, this.penSize);
//   this._currentStroke.lines.push({
//     start: $.extend(true, {}, this._lastPosition),
//     end: $.extend(true, {}, currentPosition),
//   });

//   this._lastPosition = currentPosition;
// };

// //
// // Public API
// //

// Sketchpad.prototype.reset = function() {
//   // Set attributes
//   this.canvas = this.element[0];
//   this.canvas.width = this._width;
//   this.canvas.height = this._height;
//   this.context = this.canvas.getContext('2d');

//   // Setup event listeners
//   this.redraw(this.strokes);

//   if (this.readOnly) {
//     return;
//   }

//   // Mouse
//   $(this.canvas).on("brush:down", this._brushDown);
//   $(this.canvas).on("brush:out", this._brushUp);
//   $(this.canvas).on("brush:up", this._brushUp);
// };

// Sketchpad.prototype.drawStroke = function(stroke) {
//   for (var j = 0; j < stroke.lines.length; j++) {
//     var line = stroke.lines[j];
//     this._draw(line.start, line.end, stroke.color, stroke.size);
//   }
// };

// Sketchpad.prototype.redraw = function(strokes) {
//   for (var i = 0; i < strokes.length; i++) {
//     this.drawStroke(strokes[i]);
//   }
// };

// Sketchpad.prototype.toObject = function() {
//   return {
//     width: this.canvas.width,
//     height: this.canvas.height,
//     strokes: this.strokes,
//     undoHistory: this.undoHistory,
//   };
// };

// Sketchpad.prototype.toJSON = function() {
//   return JSON.stringify(this.toObject());
// };

// Sketchpad.prototype.animate = function(ms, loop, loopDelay) {
//   this.clear();
//   var delay = ms;
//   var callback = null;
//   for (var i = 0; i < this.strokes.length; i++) {
//     var stroke = this.strokes[i];
//     for (var j = 0; j < stroke.lines.length; j++) {
//       var line = stroke.lines[j];
//       callback = this._draw.bind(this, line.start, line.end,
//                                  stroke.color, stroke.size);
//       this.animateIds.push(setTimeout(callback, delay));
//       delay += ms;
//     }
//   }
//   if (loop) {
//     loopDelay = loopDelay || 0;
//     callback = this.animate.bind(this, ms, loop, loopDelay);
//     this.animateIds.push(setTimeout(callback, delay + loopDelay));
//   }
// };

// Sketchpad.prototype.cancelAnimation = function() {
//   for (var i = 0; i < this.animateIds.length; i++) {
//     clearTimeout(this.animateIds[i]);
//   }
// };

// Sketchpad.prototype.clear = function() {
//   this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
// };

// Sketchpad.prototype.undo = function() {
//   this.clear();
//   var stroke = this.strokes.pop();
//   if (stroke) {
//     this.undoHistory.push(stroke);
//     this.redraw(this.strokes);
//   }
// };

// Sketchpad.prototype.redo = function() {
//   var stroke = this.undoHistory.pop();
//   if (stroke) {
//     this.strokes.push(stroke);
//     this.drawStroke(stroke);
//   }
// };