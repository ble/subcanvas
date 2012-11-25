goog.require('goog.math.Box');
goog.require('goog.math.Vec2');

goog.require('ble.scratch.Canvas');
goog.require('ble.scratch.Subcanvas');

goog.require('ble.curves.Kappa');

var canvas = new ble.scratch.Canvas(1366, 768);
canvas.render(document.body);

var size = 10;
var yOverX = canvas.height_px / canvas.width_px;
var subcanvas = new ble.scratch.Subcanvas(
    canvas,
    new goog.math.Box(0, canvas.width_px, canvas.height_px, 0),
    new goog.math.Box(size * yOverX, size, -size*yOverX, -size));



canvas.withContext(function(ctx) {
  ctx.clearRect(0, 0, this.width_px, this.height_px);
});

subcanvas.withContext(function(ctx) {
  for(var reps = 0; reps < 10; reps++) {
    var curve = new ble.curves.Kappa(
      new goog.math.Vec2((Math.random()-0.5) * size, (Math.random()-0.5) * size),
      Math.floor(Math.random() * 4) / 4 * 2 * Math.PI,
      []);
    curve.deltaAngle = ble.curves.ARCMINUTE;

    for(var i = 0; i < 200; i++)
    {
      if(Math.random() <= 0.5) {
        curve.curve.push(new ble.curves.CurvedPart(Math.PI / 4, 2))
      } else if(Math.random() <= 0.5) {
        curve.curve.push(
            new ble.curves.Angle(Math.PI / 2 * (Math.random() <= 0.5 ? -1 : 1))); 
      } else {
        curve.curve.push(
            new ble.curves.Angle(Math.PI / 2 * (Math.random() <= 0.5 ? -1 : 1)),
            new ble.curves.CurvedPart(1 / 2, 0));
      }
    }
    curve.draw(ctx);
  }
});
