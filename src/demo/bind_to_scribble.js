goog.require('ble.json.PrettyPrinter');

goog.require('ble.scribble.Canvas');
goog.require('ble.scribble.EventType');
goog.require('ble.scribble.DrawEvent');
goog.require('ble._2d.Replay');

var pprint = new ble.json.PrettyPrinter();
var ui = new ble.scribble.UI(320, 240);


var showDrawn = function(e) {
  window.console.log(pprint.serialize(e.drawn));
};

ui.render(document.body);
ui.addEventListener(ble.scribble.EventType.DRAW_START, showDrawn);
ui.addEventListener(ble.scribble.EventType.DRAW_PROGRESS, showDrawn);
ui.addEventListener(ble.scribble.EventType.DRAW_END, showDrawn);
