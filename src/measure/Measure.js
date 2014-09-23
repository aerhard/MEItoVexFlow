/*
 * MEItoVexFlow, Measure class
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
  'jquery',
  'vexflow',
  'mei2vf/core/RuntimeError',
  'mei2vf/core/Util',
  'mei2vf/measure/StaveConnectors'
], function ($, VF, RuntimeError, Util, StaveConnectors) {

  /**
   * @class MEI2VF.Measure
   * @private
   *
   * @constructor
   * @param {Object} config The configuration object
   */
  var Measure = function (config) {
    this.init(config);
  };

  Measure.prototype = {

    /**
     * initializes the current MEI2VF.Measure object
     * @param {Object} config The configuration object
     */
    init : function (config) {
      var me = this;
      /**
       * @cfg {MEI2VF.System} system the parent system
       */
      me.system = config.system;
      /**
       * @cfg {Element} element the MEI element of the current measure
       */
      me.element = config.element;
      /**
       * @cfg {Number} n The number of the current measure as specified in
       * the MEI document
       */
      me.n = +config.element.getAttribute('n'); // set in Measure constructor
      /**
       * @cfg {Array} staves an array of the staves in the current
       * measure. Contains
       */
      me.staves = config.staves;
      /**
       * @cfg {MEI2VF.StaveVoices} voices The voices of all staves in the
       * current measure
       */
      me.voices = config.voices;
      /**
       * @cfg {MEI2VF.Connectors} startConnectors an instance of
       * MEI2VF.Connectors handling all left connectors (only the first measure
       * in a system has data)
       */
      me.startConnectors = new StaveConnectors(config.startConnectorCfg);
      /**
       * @cfg {MEI2VF.Connectors} inlineConnectors an instance of
       * MEI2VF.Connectors handling all right connectors
       */
      me.inlineConnectors = new StaveConnectors(config.inlineConnectorCfg);

      me.tieElements = config.tieElements;
      me.slurElements = config.slurElements;
      me.hairpinElements = config.hairpinElements;
      /**
       * @cfg {Element[]} tempoElements the MEI tempo elements in the
       * current measure
       */
      me.tempoElements = config.tempoElements;
      /**
       * @cfg {Object} tempoFont the font used for rendering tempo
       * specifications
       */
      me.tempoFont = config.tempoFont;
      /**
       * @cfg {Element[]} rehElements the MEI rehearsal mark elements in the
       * current measure
       */
      me.rehElements = config.rehElements;
      /**
       * @property {Number} maxNoteStartX the maximum note_start_x value of all
       * Vex.Flow.Stave objects in the current measure
       */
      me.maxNoteStartX = 0;
      /**
       * @property {Number} maxEndModifierW the maximum width of the end
       * modifiers in all Vex.Flow.Stave objects in the current measure
       */
      me.maxEndModifierW = 0;
      /**
       * @property {Number} meiW the width attribute of the measure element or
       * null if NaN
       */
      me.meiW = me.readMEIW(me.element);
    },

    getSystem : function () {
      return this.system;
    },

    /**
     *  reads the width attribute of the specified element and converts it to a
     * number
     * @param {Element} element the element to process
     * @return {Number} the number of the attribute or null if NaN
     */
    readMEIW : function (element) {
      return +element.getAttribute('width') || null;
    },

    /**
     * gets the staves array of the current measure
     * @return {Array}
     */
    getStaves : function () {
      return this.staves;
    },

    /**
     * gets the voices object of the current measure
     * @return {MEI2VF.StaveVoices}
     */
    getVoices : function () {
      return this.voices;
    },

    getMeiElement : function () {
      return this.element;
    },

    /**
     * gets the x coordinate of the staff
     * @return {Number}
     */
    getX : function () {
      return this.getFirstDefinedStave().x;
    },

    /**
     * gets the number of the current staff as specified in the MEI code
     * @return {Number}
     */
    getN : function () {
      return this.n;
    },

    /**
     * gets the first defined staff in the current measure
     * @return {Vex.Flow.Stave}
     */
    getFirstDefinedStave : function () {
      var me = this, i, j;
      for (i = 0, j = me.staves.length; i < j; i += 1) {
        if (me.staves[i]) {
          return me.staves[i];
        }
      }
      throw new RuntimeError('No staff found in the current measure.');
    },

    /**
     * Adds rehearsal marks encoded in reh elements in the current measure to
     * the corresponding Vex.Flow.Stave object
     */
    addRehearsalMarks : function () {
      var me = this, stave_n, vexStave, offsetX;
      $.each(me.rehElements, function () {
        stave_n = this.getAttribute('staff');
        vexStave = me.staves[stave_n];
        offsetX = (vexStave.getModifierXShift() > 0) ? -40 : 0;
        vexStave.modifiers.push(new VF.StaveSection($(this).text(), vexStave.x + offsetX, 0));
      });
    },

    // TODO handle timestamps! (is it necessary to handle tempo element
    // as annotations?)
    // TODO make magic numbers constants
    // TODO move from here
    /**
     * Writes the data of the tempo elements in the current measure to the
     * corresponding Vex.Flow.Stave object
     */
    addTempoToStaves : function () {
      var me = this, offsetX, vexStave, vexTempo, atts, halfLineDistance;
      $.each(me.tempoElements, function () {
        atts = Util.attsToObj(this);
        vexStave = me.staves[atts.staff];
        halfLineDistance = vexStave.getSpacingBetweenLines() / 2;
        vexTempo = new VF.StaveTempo({
          name : $(this).text(),
          duration : atts['mm.unit'],
          dots : +atts['mm.dots'],
          bpm : +atts.mm
        }, vexStave.x, 5);
        if (atts.vo) {
          vexTempo.setShiftY(+atts.vo * halfLineDistance);
        }
        offsetX = (vexStave.getModifierXShift() > 0) ? -14 : 14;

        // if a staff has a time signature, set the tempo on top of the time
        // signature instead of the first note
        if (vexStave.hasTimeSig()) {
          offsetX -= 24;
        }
        if (atts.ho) {
          offsetX += +atts.ho * halfLineDistance;
        }
        vexTempo.setShiftX(offsetX);
        vexTempo.font = me.tempoFont;
        vexStave.modifiers.push(vexTempo);
      });
    },

    /**
     * calculates the minimum width of the current measure
     */
    calculateMinWidth : function () {
      var me = this;
      me.calculateMaxNoteStartX();
      me.calculateMaxEndModifierWidth();
      me.calculateRepeatPadding();
      /**
       * @property {Number} minVoicesW the minimum width of the voices in the
       * measure
       */
      me.minVoicesW = me.voices.preFormat();
      /**
       * @property {Number} minWidth the minimum width of the measure
       */
      me.minWidth = me.maxNoteStartX + me.maxEndModifierW + me.minVoicesW + me.repeatPadding;
    },

    /**
     * gets the final width of the current measure
     */
    getW : function () {
      return this.w;
    },

    /**
     * gets the minimum width of the current measure
     */
    getMinWidth : function () {
      return this.minWidth;
    },

    setFinalWidth : function (additionalWidth) {
      var me = this;
      me.w = (me.meiW === null) ? me.minWidth + additionalWidth : me.meiW;
    },

    /**
     * calculates the maximum note_start_x of all Vex.Flow.Stave objects in the
     * current measure
     */
    calculateMaxNoteStartX : function () {
      var me = this, i, staves, stave;
      staves = me.staves;
      i = staves.length;
      while (i--) {
        stave = staves[i];
        if (stave) {
          me.maxNoteStartX = Math.max(me.maxNoteStartX, stave.getNoteStartX());
        }
      }
    },

    calculateMaxEndModifierWidth : function () {
      var me = this, i, staves, stave;
      staves = me.staves;
      i = staves.length;
      while (i--) {
        stave = staves[i];
        if (stave) {
          me.maxEndModifierW = Math.max(me.maxEndModifierW, stave.getGlyphEndX() - stave.end_x);
        }
      }
    },

    /**
     * calculates additional start padding when there are repetition start bars
     * in the current measure
     */
    calculateRepeatPadding : function () {
      var me = this;
      var stave = me.getFirstDefinedStave();
      /**
       * @property {Number} repeatPadding additional padding (20px) if the staff
       * does have a left REPEAT_BEGIN barline located to the right of other
       * staff modifiers; 0px in all other cases.
       */
      me.repeatPadding =
      (stave.modifiers[0].barline == VF.Barline.type.REPEAT_BEGIN && stave.modifiers.length > 2) ? 20 : 0;
    },

    /**
     * Formats the staves in the current measure: sets x coordinates and adds
     * staff labels
     * @param {Number} x The x coordinate of the the measure
     * @param {String[]} labels The labels of all staves
     */
    format : function (x, labels) {
      var me = this, width = me.w, i = me.staves.length, stave, k;
      while (i--) {
        if (me.staves[i]) {
          stave = me.staves[i];
          if (labels && typeof labels[i] === 'string') {
            stave.setText(labels[i], VF.Modifier.Position.LEFT, {
              shift_y : -3
            });
          }

          if (typeof stave.setX == "function") {
            stave.setX(x);
          } else {
            /* Fallback if VexFlow doesn't have setter */
            //TODO: remove when setX() is merged to standard VexFlow
            stave.x = x;
            stave.glyph_start_x = x + 5;
            stave.bounds.x = x;
            for (k = 0; k < stave.modifiers.length; k++) {
              stave.modifiers[k].x = x;
            }
          }

          stave.start_x = stave.x + me.maxNoteStartX;
          stave.setWidth(width);
          stave.end_x -= me.maxEndModifierW;

        }
      }
      me.voices.format(me.getFirstDefinedStave());
    },

    /**
     * Draws the staves, voices and connectors in the current measure to a
     * canvas
     * @param {Object} ctx the canvas context
     */
    draw : function (ctx) {
      var me = this, i, staves, staff;
      staves = me.staves;
      i = staves.length;
      while (i--) {
        staff = staves[i];
        if (staff) {
          staff.setContext(ctx).draw();
        }
      }
      me.voices.draw(ctx, staves);
      me.startConnectors.setContext(ctx).draw();
      me.inlineConnectors.setContext(ctx).draw();
    }
  };

  return Measure;

});
