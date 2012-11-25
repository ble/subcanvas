goog.require('goog.math.Box');
goog.require('goog.math.Vec2');

goog.require('ble.scratch.Canvas');
goog.require('ble.scratch.Subcanvas');

goog.require('ble.curves.Kappa');

var canvas = new ble.scratch.Canvas(1366, 768);
canvas.render(document.body);

var size = 3;
var yOverX = canvas.height_px / canvas.width_px;
var subcanvas = new ble.scratch.Subcanvas(
    canvas,
    new goog.math.Box(0, canvas.width_px, canvas.height_px, 0),
    new goog.math.Box(size * yOverX, size, -size*yOverX, -size));



canvas.withContext(function(ctx) {
  ctx.clearRect(0, 0, this.width_px, this.height_px);
});

var pathInvertVerticalHalfCircle = function(ctx, x, y, r, move, flip, arc) {
  if(move)
    ctx.moveTo(x, y - r);
  else
    ctx.lineTo(x, y - r);
  var s = flip ? r : -r;
  ctx.lineTo(x - s, y - r);
  ctx.lineTo(x - s, y + r);
  ctx.lineTo(x,     y + r);
  ctx.lineTo(x,     y - r);
  if(arc)
    ctx.arc(x, y, r, Math.PI / 2, -Math.PI / 2, !flip);
  ctx.closePath();
}


var pathVerticalHalfCircle = function(ctx, x, y, r, move, flip) {
  if(move)
    ctx.moveTo(x, y - r);
  else
    ctx.lineTo(x, y - r);
  ctx.arc(x, y, r, -Math.PI / 2, Math.PI / 2, flip);
  ctx.closePath();
}


var pathInvertHorizontalHalfCircle = function(ctx, x, y, r, move, flip, arc) {
  if(move)
    ctx.moveTo(x - r, y);
  var s = flip ? r : -r;
  ctx.lineTo(x - r, y - s);
  ctx.lineTo(x + r, y - s);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x - r, y);
  if(arc)
    ctx.arc(x, y, r, 0, Math.PI, flip);
  ctx.closePath();
}

var pathHorizontalHalfCircle = function(ctx, x, y, r, move, flip) {
  if(move)
    ctx.moveTo(x - r, y);
  else
    ctx.lineTo(x - r, y);
  ctx.arc(x, y, r, 0, Math.PI, flip);
  ctx.closePath();
}

var drawBlock = function(ctx, x, y, r, code) {
  var semi1    = code & 1,
      semi2    = code & 2,
      vertical = code & 4,
      flip     = code & 8,
      invert   = code & 8;
  var x1 = vertical  ? flip ? x + r : x - r : x;
  var y1 = !vertical ? flip ? y + r : y - r : y;
  var f;
  if(!vertical && invert)
    f = pathInvertHorizontalHalfCircle;
  if(!vertical && !invert)
    f = pathHorizontalHalfCircle;
  if(vertical && invert)
    f = pathInvertVerticalHalfCircle;
  if(vertical && !invert)
    f = pathVerticalHalfCircle;
  if(semi1 || invert)
    f(ctx, x, y, r, true, flip, semi1);
  if(semi2 || invert)
    f(ctx, x1, y1, r, true, flip, semi2);
}

var generateCodeSequence = function(xlow, xhigh, ylow, yhigh, r) {
  var codes = [];
  for(var x = xlow; x <= xhigh; x+=r) {
    for(var y = ylow; y <= yhigh; y+=r) {
      codes.push(Math.floor(32 * Math.random()));
    }
  }
  return codes;
};

var drawCodes = function(ctx, xlow, xhigh, ylow, yhigh, codes, r) { 
  var count = 0;
  for(var x = xlow; x <= xhigh; x+=r) {
    for(var y = ylow; y <= yhigh; y+=r) {
     drawBlock(ctx, x, y, r / 2, codes[count % codes.length]);
     count++;
    }
  }
};

var rgba = function(r, g, b, a) {
  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);
  var color = "rgba(" + [r,g,b,a].join(",") + ")";
  window.console.log(color);
  return color
};

subcanvas.withContext(function(ctx) {
  var rgbs = [
    [255, 255, 128],
    [128, 0, 0],
    [192, 255, 192],
    [0, 255, 192],
    [192, 64, 32],
  ];
  var code0 = false;
  for(var scale = 1; scale < 5; scale++) {
    var alpha = 1.0 / scale / scale;
    var r = 1.0 / scale;
    for(var color = 0; color < rgbs.length; color++) {
      window.console.log(rgbs[color]);
      var fill = rgba(rgbs[color][0], rgbs[color][1], rgbs[color][2], alpha);
      ctx.fillStyle = fill;
      var codes = generateCodeSequence(-size, size, -size * yOverX, size * yOverX, r);
      ctx.beginPath();
      drawCodes(ctx, -size, size, -(1 + size * yOverX), 1 + size * yOverX, codes, r);
      ctx.fill();

      ctx.beginPath();
      drawCodes(ctx, -size, size, -(1 + size * yOverX), 1 + size * yOverX, codes, r);
      ctx.lineWidth *= 4;
      ctx.strokeStyle = rgba(0, 0, 0, alpha * 0.25);
      ctx.stroke();
      ctx.lineWidth /= 4;
      ctx.strokeStyle = rgba(255, 255, 255, alpha);
      ctx.stroke();
      
      if(code0 == false && color == rgbs.length - 1)
        code0 = codes;
    }

  }

    ctx.beginPath();
    drawCodes(ctx, -size, size, -(1 + size * yOverX), 1 + size * yOverX, codes, 1);
    ctx.lineWidth *= 4;
    ctx.strokeStyle = rgba(0, 0, 0, 0.25);
    ctx.stroke();
    ctx.lineWidth /= 4;
    ctx.strokeStyle = rgba(255, 255, 255, 1);
    ctx.stroke();

});
