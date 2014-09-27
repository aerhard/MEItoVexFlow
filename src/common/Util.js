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
    },


    /**
     * jQuery's method, without window check
     * @param obj
     * @returns {boolean}
     */
    isPlainObject : function (obj) {
      // Not plain objects:
      // - Any object or value whose internal [[Class]] property is not "[object Object]"
      // - DOM nodes
      if (typeof obj !== "object" || obj.nodeType) {
        return false;
      }
      if (obj.constructor && !obj.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
      }
      // If the function hasn't returned already, we're confident that
      // |obj| is a plain object, created by {} or constructed with new Object
      return true;
    },

    /**
     * jQuery's extend method, without deep parameter (deep is assumed to be true)
     */
    extend : function () {
      var options, name, src, copy, copyIsArray, clone, target = arguments[ 0 ] || {}, i = 1, length = arguments.length;

      if (typeof target !== "object" && typeof target !== 'function') {
        target = {};
      }

      for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[ i ]) != null) {
          // Extend the base object
          for (name in options) {
            src = target[ name ];
            copy = options[ name ];
            // Prevent never-ending loop
            if (target === copy) {
              continue;
            }
            // Recurse if we're merging plain objects or arrays
            if (copy && ( Util.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) )) {
              if (copyIsArray) {
                copyIsArray = false;
                clone = src && Array.isArray(src) ? src : [];
              } else {
                clone = src && Util.isPlainObject(src) ? src : {};
              }
              // Never move original objects, clone them
              target[ name ] = Util.extend(clone, copy);
              // Don't bring in undefined values
            } else if (copy !== undefined) {
              target[ name ] = copy;
            }
          }
        }
      }
      // Return the modified object
      return target;
    },

    // from sizzle.js
    getText : function (elem) {
      var node, ret = "", i = 0, nodeType = elem.nodeType;
      if (!nodeType) {
        // If no nodeType, this is expected to be an array
        while ((node = elem[i++])) {
          // Do not traverse comment nodes
          ret += getText(node);
        }
      } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (jQuery #11153)
        if (typeof elem.textContent === "string") {
          return elem.textContent;
        } else {
          // Traverse its children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem);
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
      }
      // Do not include comment or processing instruction nodes
      return ret;
    },

    getNormalizedText : function (elem) {
      return Util.getText(elem).replace(/\s+/g, ' ')
    }

  };


  return Util;

});