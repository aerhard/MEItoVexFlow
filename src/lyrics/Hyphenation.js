/*
 * MEItoVexFlow, Hyphenation class
 *
 * Author: Alexander Erhard
 *
 * Copyright © 2014 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
 * University of Maryland
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
define([
  'vexflow'
], function (VF, undefined) {

  /**
   * @class MEI2VF.Hyphenation
   * @private
   * @param font
   * @param maxHyphenDistance
   * @constructor
   */
  var Hyphenation = function (font, maxHyphenDistance) {
    var me = this;
    me.allSyllables = [];
    me.font = font;
    me.maxHyphenDistance = maxHyphenDistance;
  };

  Hyphenation.prototype = {

    /**
     * @const {null} WORD_SEPARATOR the object indicating the transition between two separate words
     */
    WORD_SEPARATOR : null,

    addSyllable : function (annot, wordpos) {
      var me = this;
      if (wordpos === 'i') me.allSyllables.push(me.WORD_SEPARATOR);
      me.allSyllables.push(annot);
      if (wordpos === 't') me.allSyllables.push(me.WORD_SEPARATOR);
    },

    setContext : function (ctx) {
      this.ctx = ctx;
      return this;
    },

    draw : function (leftX, rightX) {
      var me = this, i, first, second, hyphenWidth;

      me.ctx.setFont(me.font.family, me.font.size, me.font.weight);

      hyphenWidth = me.ctx.measureText('-').width;

      i = me.allSyllables.length + 1;
      while (i--) {
        first = me.allSyllables[i - 1];
        second = me.allSyllables[i];

        if (first !== me.WORD_SEPARATOR && second !== me.WORD_SEPARATOR) {
          var opts = {
            hyphen_width : hyphenWidth,
            max_hyphen_distance : me.maxHyphenDistance
          };
          if (first === undefined) {
            // we're at the start of a system
            opts.first_annot = { x : leftX };
          } else {
            opts.first_annot = first;
          }
          if (second === undefined) {
            // we're at the end of a system
            opts.last_annot = { x : rightX };
          } else {
            opts.last_annot = second;
          }
          if (opts.first_annot.y || opts.last_annot.y) {
            var h = new VF.Hyphen(opts);
            h.setContext(me.ctx).renderHyphen();
          }
        }
      }
    }
  };

  return Hyphenation;

});
