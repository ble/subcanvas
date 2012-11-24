goog.require('goog.math.Box');
goog.require('goog.math.Vec2');

goog.require('ble.scratch.Canvas');
goog.require('ble.scratch.Subcanvas');

goog.require('ble.curves.Kappa');

var canvas = new ble.scratch.Canvas(640, 480);
canvas.render(document.body);

var size = 5;
var yOverX = canvas.height_px / canvas.width_px;
var subcanvas = new ble.scratch.Subcanvas(
    canvas,
    new goog.math.Box(0, canvas.width_px, canvas.height_px, 0),
    new goog.math.Box(size * yOverX, size, -size*yOverX, -size));



canvas.withContext(function(ctx) {
  ctx.clearRect(0, 0, this.width_px, this.height_px);
});


var pathOne = function(ctx, x, y, inverse, first, second, flip) {
  var r = 1/2;
  var s = flip ? -r : r;

  if(inverse) {
    ctx.moveTo(x - r, y - s);
    ctx.lineTo(x - r, y + s);
    ctx.lineTo(x + r, y + s);
    ctx.lineTo(x + r, y - s);
    ctx.lineTo(x - r, y - s);
  }

  if(first) {
    if(inverse)
      ctx.lineTo(x - r, y - s);
    else
      ctx.moveTo(x - r, y - s);
    ctx.arc(x, y - s, r, 0, (flip ? -1 : 1) * Math.PI / 2, flip);
  }
  if(second) {
    if(first || inverse)
      ctx.lineTo(x - r, y);
    else
      ctx.moveTo(x - r, y);
    ctx.arc(x, y, r, 0, Math.PI, flip);
  }
  if(first) {
    ctx.lineTo(x, y);
    ctx.arc(x, y - s, r, (flip ? -1 : 1) * Math.PI / 2, Math.PI, flip);
  }
  /*
  if(first) {
    ctx.moveTo(x - r, y);
    ctx.arc(x, y, r, 0, Math.PI);
  }
  if(second) {
    ctx.lineTo(x - r, y - r);
    ctx.arc(x, y - r, r, 0, Math.PI);
  }
  */
};

//ops = [pathSemiCircle, pathDoubleSemiCircle, pathInverseSemiCircle];

subcanvas.withContext(function(ctx) {
  ctx.save();
  ctx.fillStyle = "rgb(255,0,0)";
  ctx.beginPath();
  pathOne(ctx, -2, 0, 0, 1, 1, false);
  pathOne(ctx, -1, 0, 0, 0, 1, false);
  pathOne(ctx, 0, 0, 0, 1, 0, false);
  pathOne(ctx, -2, 1, 1, 1, 1, false);
  pathOne(ctx, -1, 1, 1, 0, 1, false);
  pathOne(ctx, 0, 1, 1, 1, 0, false);

  pathOne(ctx, -2, 2, 0, 1, 1, true);
  pathOne(ctx, -1, 2, 0, 0, 1, true);
  pathOne(ctx, 0, 2, 0, 1, 0, true);

  pathOne(ctx, -2, -1, 1, 1, 1, true);
  pathOne(ctx, -1, -1, 1, 0, 1, true);
  pathOne(ctx, 0, -1, 1, 1, 0, true);

  ctx.fill();
  ctx.restore();
  return;
  for(var x = -size; x <= size; x += 1) {
    for(
        var y = Math.round(-size*yOverX);
        y <= Math.round(size*yOverX);
        y+= 1) {
      var op = Math.floor(3 * Math.random());
      ops[op](ctx, x, y, 1);
      /*
      var parity = (Math.random() >= 0.5);
      if(parity) {
        ctx.moveTo(x + 0.5, y);
        ctx.arc(x, y, 0.5, 0, Math.PI);
        ctx.closePath();
      } else {
        ctx.moveTo(x + 0.5, y);
        ctx.lineTo(x + 0.5, y+1);
        ctx.lineTo(x - 0.5, y+1);
        ctx.lineTo(x - 0.5, y);
        ctx.arc(x, y, 0.5, Math.PI, 0, true);
        ctx.closePath();
      }
      */
    }
  }

      ctx.fill();
  ctx.restore();
});
