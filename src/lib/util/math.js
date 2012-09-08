goog.provide('ble.util.hypot');
goog.provide('ble.util.log2Ceil');

ble.util.hypot = function(x, y) {
  return Math.sqrt(x * x + y * y);
};

ble.util.log2Ceil = function(x) {
  var n = 0;
  while(x > 1) { x /= 2; n++; }
  return n;
};
