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

var iter = 0;
window.setInterval(function() {
  var th = 2 * Math.PI * iter / 100;
  var i0 = 100*(1 - Math.cos(th));

  var theCurve = new ble.curves.Kappa(
      new goog.math.Vec2(0, 0),
      0,
      []);
  theCurve.curve = [];
  theCurve.deltaAngle = 10 * ble.curves.DEGREE;
  var segments = theCurve.curve;
  var imax = 1000;
  for(var i = 0; i < imax+i0; i++) { 
    var sign = i % 3 == 0 ? 1 : -1;
    var radius = 0.0015 * (i+i0);
    var angle = Math.PI * sign / 3.5;
    var inorm = i / imax;
    var length = Math.abs(angle) * radius;
    segments.push(new ble.curves.CurvedPart(length, sign / radius));
  }
  canvas.withContext(function(ctx) {
    ctx.clearRect(0, 0, this.width_px, this.height_px);
  });
  subcanvas.withContext(function(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.lineWidth *= 0.75;
    theCurve.rendering = null;
    theCurve.draw(ctx);
    ctx.restore();
  });
  iter++;
}, 10);
