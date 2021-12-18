
goog.require('goog.json.Serializer');
goog.provide('ble.json.PrettyPrinter');

/**
 * @constructor
 * @param {string=} opt_tab
 * @extends {goog.json.Serializer}
 */ 
ble.json.PrettyPrinter = function(opt_tab) {
  goog.json.Serializer.call(this);
  this.tab = opt_tab !== undefined ? opt_tab : "\t";
  this.indentLevel = 0;
};
goog.inherits(ble.json.PrettyPrinter, goog.json.Serializer);

ble.json.PrettyPrinter.prototype.currentIndent_ = function() {
  return goog.string.repeat(this.tab, this.indentLevel);
};

/**
 * param {*} obj
 * param {Array} sb
 */
ble.json.PrettyPrinter.prototype.serializeObject_ = function(_obj, sb) {
  if(goog.isObject(_obj)) {
    var obj;
    if(_obj.toJSON !== undefined) {
      obj = /** @type{Object} */ _obj.toJSON();
    }
    if(!obj) {
      obj = _obj;
    }
    this.indentLevel++;
    sb.push('{');
    var sep = "\n";
    for(var key in obj) {
      if(Object.prototype.hasOwnProperty.call(obj, key)) {
        var value = obj[key];
        if(typeof value == 'function')
          continue;
        sb.push(sep);
        sb.push(this.currentIndent_());
        this.serializeString_(key, sb);
        sb.push(":");
        this.serialize_(value, sb);
        sep = ",\n";
      }
    }
    this.indentLevel--;
    sb.push('\n');
    sb.push(this.currentIndent_());
    sb.push('}'); 
  } else {
    goog.json.Serializer.prototype.serializeObject_.call(this, _obj, sb);
  }

};


