/*
 * MEItoVexFlow, Util class
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
var MEI2VF = ( function(m2v, MeiLib, VF, $, undefined) {

  /**
   * @class MEI2VF.Hyphenation
   * @private
   * @param font
   * @param maxHyphenDistance
   * @constructor
   */
    m2v.Hyphenation = function(font, maxHyphenDistance) {
      var me = this;
      me.allSyllables = [];
      me.font = font;
      me.maxHyphenDistance = maxHyphenDistance;
    };

    m2v.Hyphenation.prototype = {

      /**
       * @const {null} WORD_SEPARATOR the object indicating the transition between two separate words
       */
      WORD_SEPARATOR : null,

      addSyllable : function(annot, wordpos, staff_n) {
        var me = this;
        if (!me.allSyllables[staff_n])
          me.allSyllables[staff_n] = [];
        if (wordpos === 'i') me.allSyllables[staff_n].push(me.WORD_SEPARATOR);
        me.allSyllables[staff_n].push(annot);
        if (wordpos === 't') me.allSyllables[staff_n].push(me.WORD_SEPARATOR);
      },

      setContext : function(ctx) {
        this.ctx = ctx;
        return this;
      },

      draw : function(leftX, rightX) {
        var me = this, i, k, first, second, hyphenWidth;

        me.ctx.setFont(me.font.family, me.font.size, me.font.weight);

        hyphenWidth = me.ctx.measureText('-').width;

        i = me.allSyllables.length;
        while (i--) {
          if (me.allSyllables[i]) {

            k = me.allSyllables[i].length + 1;
            while (k--) {
              first = me.allSyllables[i][k - 1];
              second = me.allSyllables[i][k];

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
        }
      }
    };

    return m2v;

  }(MEI2VF || {}, MeiLib, Vex.Flow, jQuery));
