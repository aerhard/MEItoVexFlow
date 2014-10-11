/*
 * MEItoVexFlow, System class
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
  'mei2vf/lyrics/verses'
], function (Verses) {

  /**
   * A single instance of a staff system, containing and processing information
   * about the measures contained
   * @class MEI2VF.System
   * @private
   *
   * @constructor
   * @param {Object} config The configuration object
   */
  var System = function (config) {
    this.init(config);
  };

  System.prototype = {

    /**
     * @property {Number} LABEL_PADDING the padding (in pixels) between the voice
     * labels and the staves
     */
    LABEL_PADDING : 20,

    /**
     * @param {Object} config The configuration object
     */
    init : function (config) {
      var me = this;

      /**
       * @cfg {Number|null} leftMar the left system margin as specified in the
       * MEI file or null if there is no margin specified. In the latter case,
       * the margin will be calculated on basis of the text width of the labels
       */
      me.leftMar = config.leftMar;
      /**
       * @cfg {Object} coords the coords of the current system
       * @cfg {Number} coords.x the x coordinate of the system
       * @cfg {Number} coords.y the y coordinate of the system
       * @cfg {Number} coords.width the system width
       */
      me.coords = config.coords;
      /**
       * @cfg {Number[]} staveYs the y coordinates of all staves in the current
       * system
       */
      me.staveYs = config.staveYs;
      /**
       * an instance of MEI2VF.Verses dealing with and storing all verse lines
       * found in the MEI document
       * @property {MEI2VF.Verses} verses
       */
      me.verses = new Verses(config.versesCfg);
      /**
       * @cfg {String[]} labels the labels of all staves in the current system
       */
      me.labels = config.labels;
      /**
       * @property {MEI2VF.Measure[]} measures the measures in the current
       * system
       */
      me.measures = [];
    },

    /**
     * @return {Number[]} the value of {@link #staveYs}
     */
    getStaveYs : function () {
      return this.staveYs;
    },

    /**
     * adds a measure to the end of the measure array
     * @param {MEI2VF.Measure} measure the measure to add
     */
    addMeasure : function (measure) {
      this.measures.push(measure);
    },

    /**
     * gets a measure in the current system at the specified index
     * @param {Number} i the measure index (the first measure in the current
     * system has the index 0)
     * @return {MEI2VF.Measure}
     */
    getMeasure : function (i) {
      return this.measures[i];
    },

    /**
     * gets all measures in the current system
     * @return {MEI2VF.Measure[]}
     */
    getMeasures : function () {
      return this.measures;
    },

    getLastMeasure : function () {
      return this.measures[this.measures.length - 1];
    },

    /**
     * Calculates the system indent based on the width of the stave and
     * stave-connector labels
     * @param {Object} ctx the canvas context
     */
    calculateLeftMar : function (ctx) {
      var me = this, label, max = 0, w, connectors, i, text;
      ctx.setFont('Times', 16);
      for (label in me.labels) {
        text = me.labels[label];
        if (typeof text === 'string') {
          w = ctx.measureText(me.labels[label]).width;
          if (max < w) {
            max = w;
          }
        }
      }
      connectors = me.getMeasures()[0].startConnectors.getAll();
      i = connectors.length;
      while (i--) {
        text = connectors[i].text;
        if (typeof text === 'string') {
          w = ctx.measureText(me.labels[label]).width;
          if (max < w) {
            max = w;
          }
        }
      }
      me.leftMar = (max === 0) ? 0 : max + me.LABEL_PADDING;
    },

    /**
     * Calculates the minimum width of each measure in the current system
     */
    calculateMinMeasureWidths : function () {
      var measures = this.measures, i = measures.length;
      while (i--) {
        measures[i].calculateMinWidth();
      }
    },

    /**
     * calculates the minimum width of all measures in a stave
     */
    calculateMinSystemWidth : function () {
      var me = this, i, j, totalSpecifiedMeasureWidth = 0, voiceFillFactorSum = 0;
      for (i = 0, j = me.measures.length; i < j; i += 1) {
        if (me.measures[i].meiW === null) {
          totalSpecifiedMeasureWidth += me.measures[i].getMinWidth();
          voiceFillFactorSum += me.measures[i].getVoiceFillFactor();
        } else {
          totalSpecifiedMeasureWidth += me.measures[i].meiW;
        }
      }
      me.minSystemWidth = totalSpecifiedMeasureWidth;
      me.voiceFillFactorSum = voiceFillFactorSum;
    },

    /**
     * sets the final width of all measures in a stave
     */
    setFinalMeasureWidths : function (overrideWidth) {
      var me = this, i, j, singleAdditionalWidth;

      var totalWidth = overrideWidth || me.coords.width;

      singleAdditionalWidth = Math.floor((totalWidth - me.leftMar - me.minSystemWidth) / me.voiceFillFactorSum);

      for (i = 0, j = me.measures.length; i < j; i += 1) {
        me.measures[i].setFinalWidth(singleAdditionalWidth);
      }
    },

    preFormat : function (ctx) {
      var me = this;
      if (typeof me.leftMar !== 'number') {
        me.calculateLeftMar(ctx);
      }
      me.calculateMinMeasureWidths();
      me.calculateMinSystemWidth();
      return me.minSystemWidth + me.leftMar;
    },

    /**
     * formats the measures in the current system
     * @return {System} this
     */
    format : function () {
      var me = this, i, j, measures, offsetX, labels;
      offsetX = me.coords.x + me.leftMar;
      measures = me.getMeasures();
      j = measures.length;
      for (i = 0; i < j; i += 1) {
        if (measures[i]) {
          labels = (i === 0) ? me.labels : null;
          measures[i].format(offsetX, labels);
          offsetX += measures[i].getW();
        }
        measures[i].addRehearsalMarks();
        measures[i].addTempoToStaves();
      }

      if (j > 0) {
        me.slurStartX = measures[0].getFirstDefinedStave().getTieStartX();
        me.slurEndX = me.getLastMeasure().getFirstDefinedStave().getTieEndX();
      }

      me.verses.format();
      return me;
    },


    getSlurStartX : function () {
      return this.slurStartX;
    },

    getSlurEndX : function () {
      return this.slurEndX;
    },

    /**
     * draws the current system to a canvas
     * @param {Object} ctx the canvas context
     */
    draw : function (ctx) {
      var me = this, i = me.measures.length;
      while (i--) {
        if (me.measures[i]) {
          me.measures[i].draw(ctx);
        }
      }
      me.verses.drawHyphens(ctx, me.slurStartX, me.slurEndX);
    }
  };

  return System;

});
