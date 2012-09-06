goog.provide('ble.scribbleDeserializer');

goog.require('ble.json.TaggedDeserializer');
goog.require('ble._2d.StrokeReplay');
goog.require('ble._2d.PolylineReplay');
goog.require('ble._2d.EraseReplay'); 

ble.scribbleDeserializer = new ble.json.TaggedDeserializer();
ble.scribbleDeserializer.register(ble._2d.StrokeReplay);
ble.scribbleDeserializer.register(ble._2d.PolylineReplay); 
ble.scribbleDeserializer.register(ble._2d.EraseReplay); 

goog.exportSymbol('ble.scribbleDeserializer', ble.scribbleDeserializer);
