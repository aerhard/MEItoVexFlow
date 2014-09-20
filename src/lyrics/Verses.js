/*
 * MEItoVexFlow, Verses class
 *
 * Author: Zoltan Komives
 * Contributor: Alexander Erhard
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
  'vexflow',
  'm2v/lyrics/Hyphenation',
], function (VF, Hyphenation, undefined) {

  /**
   * @class MEI2VF.Verses
   * @private
   *
   * @constructor
   * @param {Object} config
   */
  var Verses = function (config) {
    var me = this;
    me.hyphensByVerse = {};
    me.syllablesByVerse = {};
    me.verseYs = {};
    me.font = config.font;
    me.maxHyphenDistance = config.maxHyphenDistance;
  };

  Verses.prototype = {

    /**
     * @public
     * @param annot
     * @param element
     * @param staff_n
     * @returns {MEI2VF.Verses}
     */
    addSyllable : function (annot, element, staff_n) {
      var me = this;

      var wordpos = $(element).attr('wordpos');
      var verse_n = $(element).parents('verse').attr('n') || '1';

      if (!me.syllablesByVerse[verse_n]) {
        me.syllablesByVerse[verse_n] = [];
      }
      me.syllablesByVerse[verse_n].push(annot);
      if (wordpos) {
        if (!me.hyphensByVerse[verse_n]) {
          me.hyphensByVerse[verse_n] = me.newHyphenation();
        }
        me.hyphensByVerse[verse_n].addSyllable(annot, wordpos, staff_n);
      }
      return me;
    },

    getLowestY : function () {
      return this.lowestY;
    },

    newHyphenation : function () {
      return new Hyphenation(this.font, this.maxHyphenDistance);
    },

    /**
     * @public
     * @returns {MEI2VF.Verses}
     */
    format : function () {
      var me = this, verse_n, text_line, verse, i, j, lowestY = -20;

      var padding = 20;

      text_line = 0;
      for (verse_n in me.syllablesByVerse) {
        verse = me.syllablesByVerse[verse_n];
        lowestY += padding;
        // first pass: get lowest y
        for (i = 0, j = verse.length; i < j; i++) {
          verse[i].setTextLine(text_line);
          lowestY = Math.max(lowestY, verse[i].preProcess());
        }
        // second pass: set lowest y
        for (i = 0; i < j; i++) {
          verse[i].setY(lowestY);
        }
        text_line += 1;
      }
      me.lowestY = lowestY;
      return me;
    },

    /**
     * @public
     * @param ctx
     * @param leftX
     * @param rightX
     * @returns {MEI2VF.Verses}
     */
    drawHyphens : function (ctx, leftX, rightX) {
      var me = this, verse_n;
      for (verse_n in me.hyphensByVerse) {
        me.hyphensByVerse[verse_n].setContext(ctx).draw(leftX, rightX);
      }
      return me;
    }

  };

  return Verses;

});
