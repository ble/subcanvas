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

var theCurve = new ble.curves.Kappa(
    new goog.math.Vec2(0, 0),
    0,
    []);

var segments = theCurve.curve;
var p = Math.PI / 12;
goog.scope(function() {
  var c = ble.curves.CurvedPart;
  var a = ble.curves.Angle;
  segments.push(new c(1, 3*p));
  segments.push(new c(1, 6*p));
  segments.push(new c(1, -3*p));
  segments.push(new c(1, -6*p));
  segments.push(new c(0.5, -12*p));
  segments.push(new a(-5*p));
  segments.push(new c(0.75, 6*p));
  segments.push(new a(6*p));
  segments.push(new c(0.15, 0));
});

subcanvas.withContext(function(ctx) {
  var rSym = 20;
  ctx.save();
  ctx.strokeStyle = "rgb(0,0,0)";
  for(var i = 0; i < rSym; i++) { 
    theCurve.rendering = null;
    theCurve.angle0 = Math.PI * 2 * i / rSym;
    window.console.log(theCurve.angle0);
    theCurve.draw(ctx);
  }
  ctx.restore();
});
