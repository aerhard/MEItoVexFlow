/*
 * StaveVoices.js Author: Zoltan Komives (zolaemil@gmail.com) Created:
 * 25.07.2013
 *
 * Copyright © 2012, 2013 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
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
/*
 * Contributor: Alexander Erhard
 */
define([
  'vexflow',
  'm2v/voice/StaveVoice'
], function (VF, StaveVoice, undefined) {


  /**
   * @class MEI2VF.StaveVoices
   * Stores all voices in a given measure along with the respective staff id.
   * Passes all voices to Vex.Flow.Formatter and calls joinVoices, then draws
   * all voices.
   * @private
   *
   * @constructor
   */
  var StaveVoices = function () {
    this.all_voices = [];
    this.formatter = new VF.Formatter();
  };

  StaveVoices.prototype = {
    addStaffVoice : function (staffVoice) {
      this.all_voices.push(staffVoice);
    },

    addVoice : function (voice, staff_n) {
      this.addStaffVoice(new StaveVoice(voice, staff_n));
    },

    reset : function () {
      this.all_voices = [];
    },

    preFormat : function () {
      var me = this, all, staff_n, i;
      all = me.all_voices;
      me.vexVoices = [];
      me.vexVoicesStaffWise = {};
      i = all.length;
      while (i--) {
        me.vexVoices.push(all[i].voice);
        staff_n = all[i].staff_n;
        if (me.vexVoicesStaffWise[staff_n]) {
          me.vexVoicesStaffWise[staff_n].push(all[i].voice);
        } else {
          me.vexVoicesStaffWise[staff_n] = [all[i].voice];
        }
      }
      me.formatter.preCalculateMinTotalWidth(me.vexVoices);
      return me.formatter.getMinTotalWidth();
    },

    /**
     *
     * @param {Object} staff a staff in the current measure used to set
     * the x dimensions of the voice
     */
    format : function (stave) {
      var me = this, i, f, alignRests;
      f = me.formatter;
      for (i in me.vexVoicesStaffWise) {
        alignRests = (me.vexVoicesStaffWise[i].length > 1);
        f.joinVoices(me.vexVoicesStaffWise[i]);
        if (alignRests) f.alignRests(me.vexVoicesStaffWise[i],{align_rests : alignRests});
      }

      var justifyWidth = stave.getNoteEndX() - stave.getNoteStartX() - 10;
      f.createTickContexts(me.vexVoices);
      f.preFormat(justifyWidth, stave.getContext(), me.vexVoices, null);
    },

    draw : function (context, staves) {
      var i, staffVoice, all_voices = this.all_voices;
      for (i = 0; i < all_voices.length; ++i) {
        staffVoice = all_voices[i];
        staffVoice.voice.draw(context, staves[staffVoice.staff_n]);
      }
    }
  };


  return StaveVoices;

});
