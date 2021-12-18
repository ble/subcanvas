goog.provide('ble.scribble.Canvas');
goog.provide('ble.scribble.UI');

goog.provide('ble.scribble.EventType');
goog.provide('ble.scribble.DrawEvent');

goog.require('ble.scratch.Canvas');
goog.require('ble.mocap.Stroke');
goog.require('ble.scribble.MutableDrawing');

goog.require('ble.scribble.style.StylePicker');
goog.require('ble.scribble.style.EventType');

goog.require('ble._2d');
goog.require('ble._2d.path.painterDefault');
goog.require('ble._2d.PolylineReplay');
goog.require('ble._2d.Replay');
goog.require('ble._2d.DrawPart');
goog.require('ble.interval.Fetcher');
goog.require('ble.interval.startRank');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');


/**
 * @enum {string}
 */
ble.scribble.EventType = {
  DRAW_START: 'draw_start',
  DRAW_PROGRESS: 'draw_progress',
  DRAW_END: 'draw_end'
}

/**
 * @constructor
 * @extends {goog.events.Event}
 * @param {string} type
 * @param {ble.scribble.Canvas} target
 * @param {ble._2d.Replay} drawn
 */
ble.scribble.DrawEvent = function(type, target, drawn) {
  goog.events.Event.call(this, type, target);
  this.drawn = drawn;
}
goog.inherits(ble.scribble.DrawEvent, goog.events.Event);

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @param {ble.scribble.MutableDrawing=} opt_drawing
 * @extends {ble.scratch.Canvas}
 */
ble.scribble.Canvas = function(width, height, opt_drawing) {
  ble.scratch.Canvas.call(this, width, height); // TODO: use ES2015 classes & inheritance instead
  if(opt_drawing !== undefined)
    this.drawing = opt_drawing;
  else
    this.drawing = new ble.scribble.MutableDrawing(Date.now(), []);
  this.mocap_ = null;
  this.modes = this.makeModes();
  this.style = ble._2d.path.painterDefault;
};
goog.inherits(ble.scribble.Canvas, ble.scratch.Canvas); // TODO: use ES2015 classes & inheritance instead

ble.scribble.Canvas.prototype.repaintComplete = function(ctx) {
  ctx.clearRect(0, 0, this.width_px, this.height_px);
  this.drawing.draw(ctx);
};

ble.scribble.Canvas.prototype.repaintAt = function(time) {
  return function(ctx) { 
    ctx.clearRect(0, 0, this.width_px, this.height_px);
    this.drawing.at(time).draw(ctx);
  };
};

ble.scribble.Canvas.prototype.finishAnimation = function() {
  this.animating = false;
};

ble.scribble.Canvas.prototype.replayAll = function(duration_millis) {
  if(this.animating)
    return;
  this.animating = true;
  var real_duration = this.drawing.length();
  if(window.webkitRequestAnimationFrame) {
    this.animateRAF(duration_millis, real_duration);
  } else {
    this.animateInterval(duration_millis, real_duration, 32); 
  }
};

ble.scribble.Canvas.prototype.animateRAF = function(replay_dur, capture_dur) {
  var start = Date.now();
  var redraw = goog.bind(function(now) {
    var delta = now - start;
    if(delta > replay_dur) {
      this.withContext(this.repaintComplete);
      this.finishAnimation();
    } else {
      var effective_time = capture_dur * (delta / replay_dur) + this.drawing.start();
      this.withContext(this.repaintAt(effective_time));
      window.webkitRequestAnimationFrame(redraw);
    }
  }, this);
  redraw(Date.now());
};

ble.scribble.Canvas.prototype.animateInterval = function(replay_dur, capture_dur, interval) {
  var start = Date.now();
  var handle;
  var redraw = goog.bind(function() {
    var now = Date.now();
    var delta = now - start;
    if(delta > replay_dur) {
      this.withContext(this.repaintComplete);
      this.finishAnimation();
      window.clearInterval(handle);
    } else {
      var effective_time = capture_dur * (delta / replay_dur) + this.drawing.start();
      this.withContext(this.repaintAt(effective_time));
    }
  }, this);
  handle = window.setInterval(redraw, interval); 
};

ble.scribble.Canvas.prototype.handleEvent = function(event) {
  ble.scribble.Canvas.superClass_.handleEvent.call(this, event); // TODO: use `super.method` after converting to ES2015-style classes
  if(event.propagationStopped_)
    return;
  var drawing = this.drawing;
  if(event.type == ble.mocap.EventType.BEGIN) {
    drawing.setCurrent(this.converter(event.capture, this.style));
    this.withContext(this.repaintComplete);
    this.dispatchEvent(
        new ble.scribble.DrawEvent(
          ble.scribble.EventType.DRAW_START,
          this,
          drawing.getCurrentReplay()));

  } else if(event.type == ble.mocap.EventType.PROGRESS ||
            event.type == ble.mocap.EventType.CONTROLPOINT) {
    drawing.setCurrent(this.converter(event.capture, this.style));
    this.withContext(this.repaintComplete);

    this.dispatchEvent(
        new ble.scribble.DrawEvent(
          ble.scribble.EventType.DRAW_PROGRESS,
          this,
          drawing.getCurrentReplay()));

  } else if(event.type == ble.mocap.EventType.END) {
    drawing.setCurrent(this.converter(event.capture, this.style));
    var part = drawing.getCurrentReplay();
    drawing.recordCurrent();
    this.dispatchEvent(
        new ble.scribble.DrawEvent(
          ble.scribble.EventType.DRAW_END,
          this,
          part));


  }

};


ble.scribble.Canvas.prototype.makeModes = function() {
  var stroke = new ble.mocap.Stroke();
  var polyline = new ble.mocap.Polyline(true);
  return [
    [stroke, ble._2d.StrokeReplay.fromMocap],
    [polyline, ble._2d.PolylineReplay.fromMocap],
    [stroke, ble._2d.EraseReplay.fromMocap],
    [polyline, ble._2d.PolylineReplay.fromMocap]
  ]; 
};

ble.scribble.Canvas.prototype.enterDocument = function() {
  ble.scribble.Canvas.superClass_.enterDocument.call(this);
  this.setMode(0);
};

ble.scribble.Canvas.prototype.setStyle = function(style) {
  this.style = style;
};

ble.scribble.Canvas.prototype.disableDrawing = function() {
  if(this.mocap_ !== null) {
    goog.events.unlisten(
        this.getElement(),
        this.mocap_.eventTypesOfInterest,
        this.mocap_);
    goog.events.unlisten(
        this.mocap_,
        ble.mocap.EventType.ALL,
        this);
    this.mocap_ = null;
  } 
}

ble.scribble.Canvas.prototype.enableDrawing = function() {
  this.mocap_ = this.mode[0];
  this.converter = this.mode[1];
  goog.events.listen(
      this.getElement(),
      this.mocap_.eventTypesOfInterest,
      this.mocap_);
  goog.events.listen(
      this.mocap_,
      ble.mocap.EventType.ALL,
      this);
}

ble.scribble.Canvas.prototype.setEnabled = function(enabled) {
  this.disableDrawing();
  if(enabled) {
    this.enableDrawing();
  }
};

ble.scribble.Canvas.prototype.setMode = function(modeNum) {
  this.disableDrawing();
  this.mode = this.modes[modeNum]; 
  this.enableDrawing();
};

ble.scribble.Canvas.prototype.exitDocument = function() {
  if(this.mocap_ !== undefined) {
    var motionCapture = this.mocap_;
    goog.events.unlisten(
      this.getElement(),
      motionCapture.eventTypesOfInterest,
      motionCapture);

    goog.events.unlisten(
      motionCapture,
      ble.mocap.EventType.ALL,
      this);
    this.mocap_ = undefined;
  }
};

/**
 * @constructor
 * @param{number} width
 * @param{number} height
 * @extends{goog.ui.Component}
 */
ble.scribble.UI = function(width, height) {
  this.width = width;
  this.height = height;
  this.listenerKeys = [];
  goog.ui.Component.call(this);
};
goog.inherits(ble.scribble.UI, goog.ui.Component);

ble.scribble.UI.prototype.createDom = function() {
  var domHelper = this.getDomHelper();
  var container = domHelper.createDom('div', {'class': 'ble-scribble-stylepicker'});
  this.setElementInternal(container);

  this.canvas = new ble.scribble.Canvas(this.width, this.height);
  this.picker = new ble.scribble.style.StylePicker();
  this.addChild(this.canvas, true);
  this.addChild(this.picker, true); 
};

ble.scribble.UI.prototype.setEnabled = function(enabled) {
  this.canvas.setEnabled(enabled);
  this.picker.setEnabled(enabled);
};

ble.scribble.UI.prototype.enterDocument = function() {
  ble.scribble.UI.superClass_.enterDocument.call(this); // TODO: change to `super.method` after changing to ES2015 classes and inheritance
  this.canvas.getElement().style['border'] = '1px solid black';
  var ctx = this.canvas.getRawContext();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  this.listenerKeys.push(goog.events.listen(
      this.picker,
      ble.scribble.style.EventType.STYLECHANGED,
      function(e) {
        this.setStyle(e.style);
      },
      false,
      this.canvas));
  this.listenerKeys.push(goog.events.listen(
      this.picker,
      ble.scribble.style.EventType.METHODCHANGED,
      function(e) {
        this.setMode(e.method);
        this.setStyle(e.style);
      },
      false,
      this.canvas));
};

ble.scribble.UI.prototype.exitDocument = function() {
  while(this.listenerKeys.length > 0) {
    var key = this.listenerKeys.pop();
    goog.events.unlistenByKey(key);
  }
  ble.scribble.UI.superClass_.exitDocument.call(this); // TODO: change to `super.method` after changing to ES2015 classes and inheritance
};

ble.scribble.UI.prototype.setPicture = function(startTime, data) {
  this.canvas.drawing = new ble.scribble.MutableDrawing(startTime, data);
  this.canvas.withContext(goog.bind(this.canvas.repaintComplete, this.canvas));
};

ble.scribble.UI.prototype.getPicture = function() {
  return this.canvas.drawing.byStart;
};
