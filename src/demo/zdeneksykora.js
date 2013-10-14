
goog.require('ble.scratch.Canvas');
goog.require('ble.scratch.Subcanvas');

goog.require('goog.math.Box');


var createUnitCanvas = function(sizePx) {
  var canvas = new ble.scratch.Canvas(sizePx, sizePx);
  var pxBox = new goog.math.Box(0, sizePx - 1, sizePx - 1, 0);
  var vBox = new goog.math.Box(1, 1, 0, 0);
  var unitSubcanvas = new ble.scratch.Subcanvas(canvas, pxBox, vBox, true);
  return [canvas, unitSubcanvas];
};

var halfCircleLeft = function(ctx, x, y, d) {
  ctx.save();
    ctx.beginPath();
    ctx.rect(x-d/2, y-d/2, d/2, d);
    ctx.clip();
    ctx.lineWidth = d;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+d/2, y);
    ctx.stroke();
  ctx.restore();
};

var halfCircleRight = function(ctx, x, y, d) {
  ctx.save();
    ctx.beginPath();
    ctx.rect(x-d/2, y-d/2, d/2, d);
    ctx.clip();
    ctx.lineWidth = d;
    ctx.beginPath();
    ctx.moveTo(x-d/2, y);
    ctx.lineTo(x-d, y);
    ctx.stroke();
  ctx.restore();
};

