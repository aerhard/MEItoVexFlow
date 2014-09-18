define(function (undefined) {

  /**
   * @class MEI2VF.Util
   * @singleton
   * @private
   */
  var Util = {

    /**
     *
     */
    attsToObj : function (element) {
      var i, obj = {};
      if (element.hasAttributes()) {
        i = element.attributes.length;
        while (i--) {
          obj[element.attributes[i].nodeName] = element.attributes[i].nodeValue;
        }
      }
      return obj;
    },

    /**
     *
     */
    serializeElement : function (element) {
      var result = '<' + element.localName, i, j, atts, att;
      if (element.hasAttributes()) {
        atts = element.attributes;
        for (i = 0, j = atts.length; i < j; i += 1) {
          att = atts.item(i);
          result += ' ' + att.nodeName + '="' + att.nodeValue + '"';
        }
      }
      return result + '>';
    }
  };

  return Util;

});