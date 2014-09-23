/*
 * (C) Copyright 2014 Alexander Erhard (http://alexandererhard.com/).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
define(function () {

  /**
   * @class MEI2VF.Util
   * @singleton
   * @private
   */
  var Util = {

    /**
     * returns the attributes of an element or an empty object if the element doesn't have attributes
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