
/**
 * @fileoverview Describe and draw curves in terms of their curvature,
 * d(tangent angle) / d(arc length)
 */

goog.require('goog.math.Vec2');

goog.require('ble._2d.Drawable');

goog.provide('ble.curves.Angle');
goog.provide('ble.curves.CurvedPart');
goog.provide('ble.curves.Kappa');
goog.provide('ble.curves');


ble.curves.DEGREE = Math.PI / 180.0;
ble.curves.ARCMINUTE = ble.curves.DEGREE / 60.0;
ble.curves.ARCSECOND = ble.curves.ARCMINUTE / 60.0;

/**
 * @param {number} angle in radians
 * @return {goog.math.Vec2}
 */
ble.curves.tangent = function(angle) {
  return new goog.math.Vec2(Math.cos(angle), Math.sin(angle))
}

/**
 * @param {goog.math.Vec2} origin
 * @param {number} angle0
 * @param {Array.<ble.curves.CurvaturePart>} curve
 * @constructor
 * @implements {ble._2d.Drawable}
 */
ble.curves.Kappa = function(origin, angle0, curve) {
  this.origin = origin.clone();
  this.angle0 = angle0;
  this.curve = curve.slice();
  /** @type {null | Array.<number>} */
  this.rendering = null;
};

ble.curves.Kappa.prototype.deltaAngle = ble.curves.DEGREE;

ble.curves.Kappa.prototype.draw = function(ctx) {
  if(this.rendering == null)
   this.render_(); 
  ble._2d.pathCoords(ctx, this.rendering);
  ctx.stroke();
};

/**
 * @protected
 */
ble.curves.Kappa.prototype.render_ = function() {
  var delta = this.deltaAngle; 
  this.rendering = [];
  var r = this.origin.clone();
  this.rendering.push(r.x, r.y);
  var theta = this.angle0;
  for(var i = 0; i < this.curve.length; i++) {
    var part = this.curve[i];  
    var length = part.length;
    var lengthStep = Math.abs(this.deltaAngle / part.extremeCurvature);
    theta += part.sharpAngle;
    var partLength = 0;
    while(partLength < length) {
      var dLength;
      if(lengthStep + partLength > length) {
        dLength = length - partLength;
        partLength = length; 
      } else {
        dLength = lengthStep;
        partLength += lengthStep;
      }
      var evalLength = partLength - dLength / 2;
      var dTheta = part.curvatureFn(evalLength) * dLength;
      theta += dTheta;
      r.add(ble.curves.tangent(theta).scale(dLength));
      this.rendering.push(r.x, r.y);
    }
  }
};

/**
 * A portion of a curvature-specified curve
 * @constructor
 */
ble.curves.CurvaturePart = function() {};
ble.curves.CurvaturePart.prototype.length = 0;
ble.curves.CurvaturePart.prototype.sharpAngle = 0;
ble.curves.CurvaturePart.prototype.extremeCurvature = 0;
ble.curves.CurvaturePart.prototype.curvatureFn = function(length) { return this.extremeCurvature; }


/**
 * Subsection of a curve where the curvature is constant
 * @param {number} length
 * @constructor
 * @extends {ble.curves.CurvaturePart}
 */
ble.curves.CurvedPart = function(length, curvature) {
  ble.curves.CurvaturePart.call(this);
  this.extremeCurvature = curvature * ble.curves.DEGREE;
  this.length = length;
};
goog.inherits(ble.curves.CurvedPart, ble.curves.CurvaturePart);


/**
 * A sharp angle in a curve
 * @param {number} degrees
 * @constructor
 * @extends {ble.curves.CurvaturePart}
 */
ble.curves.Angle = function(degrees) {
  ble.curves.CurvaturePart.call(this);
  this.sharpAngle = degrees * ble.curves.DEGREE;
};
goog.inherits(ble.curves.Angle, ble.curves.CurvaturePart);

