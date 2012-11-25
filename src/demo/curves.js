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
      invert   = code & 16;
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
  var count = 0;
  for(var x = xlow; x <= xhigh; x+=r) {
    for(var y = ylow; y <= yhigh; y+=r) {
//      var low = 1 + (Math.floor(count + Math.random()/2 - 0.25) % 3);
      var low = Math.floor(count + Math.random()/2 - 0.25) % 4;
      var hi = 4 * Math.floor(Math.random() * 8);
      if(Math.random() > 0.35) {
        low = 0;
        hi = hi & 15;
      }
      if(Math.random() > 0.5) {
        hi = hi & 15;
      }

      codes.push(hi | low);
      count++;
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

var drawCodesProb = function(ctx, xlow, xhigh, ylow, yhigh, codes, r, p) { 
  var count = 0;
  for(var x = xlow; x <= xhigh; x+=r) {
    for(var y = ylow; y <= yhigh; y+=r) {
     if(Math.random() > p) {
       count++;
       continue;
     }
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
  var fill = rgba(0, 0, 0, 1);
  ctx.fillStyle = fill;
  var codes = generateCodeSequence(-size, size, -size * yOverX, size * yOverX, 1);

  ctx.beginPath();
  drawCodes(ctx, -size, size, -(1 + size * yOverX), 1 + size * yOverX, codes, 1);
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.lineWidth *= 8;
  ctx.stroke(); 
  ctx.fill();
  ctx.strokeStyle = "rgb(255,255,255)";
  ctx.lineWidth /= 2;
  ctx.stroke(); 
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.lineWidth /= 2;
  ctx.stroke(); 

  var codes = generateCodeSequence(-size, size, -size * yOverX, size * yOverX, 1/2);

  ctx.beginPath();
  drawCodes(ctx, -size, size, -(1 + size * yOverX), 1 + size * yOverX, codes, 1/2);
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.lineWidth *= 4;
  ctx.stroke(); 
  ctx.fill();
  ctx.strokeStyle = "rgb(255,255,255)";
  ctx.lineWidth /= 2;
  ctx.stroke(); 
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.lineWidth /= 2;
  ctx.stroke(); 

  var codes = generateCodeSequence(-size, size, -size * yOverX, size * yOverX, 1/3);

  ctx.beginPath();
  drawCodes(ctx, -size, size, -(1 + size * yOverX), 1 + size * yOverX, codes, 1/3);
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.lineWidth *= 4;
  ctx.stroke(); 
  ctx.fill();
  ctx.strokeStyle = "rgb(255,255,255)";
  ctx.lineWidth /= 2;
  ctx.stroke(); 
  ctx.strokeStyle = "rgb(0,0,0)";
  ctx.lineWidth /= 2;
  ctx.stroke(); 

});
