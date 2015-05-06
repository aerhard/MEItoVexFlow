/*
 * MEItoVexFlow, Interface class
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
  'vexflow',
  'meilib/MeiLib',
  'common/Logger',
  'mei2vf/Converter'
], function (VF, MeiLib, Logger, Converter) {
  window.MeiLib = MeiLib;


  window.MEI2VF = {
    /**
     * @method setLogging sets logging behavior
     * @param {String|Boolean} level If true is passed, all logging is enabled, if false, no logging will occur. The logger is off by default.
     * The following string values set logging up to the specified level:
     *
     * - true|'debug' debug messages
     * - 'info' info, e.g. unsupported elements
     * - 'warn' warnings, e.g. wrong encodings
     * - 'error' errors
     * - false no logging
     */
    setLogging : function (level) {
      Logger.setLevel.call(Logger, level);
    },
    /**
     * @method setLoggerAppender sets the logger's appender
     * @param appender an object implementing the methods error(), warn(), info() and debug(), for example window.console
     */
    setLoggerAppender : function (appender) {
      Logger.setAppender.call(Logger, appender);
    },
    /**
     * The methods in Converter can be used to manually address distinct
     * processing steps and retrieve the created data. Can be used in
     * addition or as a supplement to {@link render_notation} and
     * {@link rendered_measures}
     */
    Converter : {
      /**
       * initializes the converter
       * @method initConfig
       * @param {Object} config The options passed to the converter. For a list, see
       * {@link MEI2VF.Converter#defaults}
       */
      initConfig : function (config) {
        Converter.prototype.initConfig(config);
      },
      /**
       * Resets the conversion results data to its initial state. Call this before process()
       * @method reset
       */
      reset : function () {
        Converter.prototype.reset();
      },
      /**
       * Processes the specified MEI document or document fragment. The generated
       * objects can be processed further or drawn immediately to a canvas via
       * {@link #draw}.
       * @method process
       * @param {XMLDocument} xmlDoc the XML document
       */
      process : function (xmlDoc) {
        Converter.prototype.process(xmlDoc);
      },
      /**
       * Formats the processed data
       * @method format
       * @param ctx The canvas context
       */
      format : function (ctx) {
        Converter.prototype.format(ctx);
      },
      /**
       * Draws the processed data to a canvas
       * @method draw
       * @param ctx The canvas context
       */
      draw : function (ctx) {
        Converter.prototype.draw(ctx);
      },
      /**
       * returns a 2d array of all Vex.Flow.Stave objects, arranged by
       * [measure_n][stave_n]
       * @method getAllVexMeasureStaffs
       * @return {Vex.Flow.Stave[][]} see {@link MEI2VF.Converter#allVexMeasureStaves}
       */
      getAllVexMeasureStaffs : function () {
        return Converter.prototype.getAllVexMeasureStaves();
      },
      /**
       * Returns the width and the height of the area that contains all drawn
       * staves as per the last processing.
       *
       * @method getStaffArea
       * @return {Object} the width and height of the area that contains all staves.
       * Properties: width, height
       */
      getStaffArea : function () {
        return Converter.prototype.getStaveArea();
      }
    },
    /**
     * Contains all Vex.Flow.Stave objects created when calling {@link #render_notation}.
     * Addressing scheme: [measure_n][stave_n]
     * @property {Vex.Flow.Stave[][]} rendered_measures
     */
    rendered_measures : null,
    /**
     * Main rendering function.
     * @param {XMLDocument} xmlDoc The MEI XML Document
     * @param {Element} target An svg or canvas element
     * @param {Number} width The width of the print space in pixels. Defaults to 800 (optional)
     * @param {Number} height The height of the print space in pixels. Defaults to 350 (optional)
     * @param {Number} backend Set to Vex.Flow.Renderer.Backends.RAPHAEL to
     * render to a Raphael context, to Vex.Flow.Renderer.Backends.SVG to use SVG;
     * if falsy, Vex.Flow.Renderer.Backends.CANVAS is set
     * @param {Object} options The options passed to the converter. For a list, see
     * {@link MEI2VF.Converter MEI2VF.Converter}
     * @param {Function} callback
     */
    render_notation : function (xmlDoc, target, width, height, backend, options, callback) {
      var ctx;
      var cfg = options || {};

      ctx = new VF.Renderer(target, backend || VF.Renderer.Backends.CANVAS).getContext();

//      width = null;
//      height = null;

      cfg.pageWidth = width;

      this.Converter.initConfig(cfg);
      this.Converter.reset();
      this.Converter.process(xmlDoc[0] || xmlDoc);

      this.Converter.format(ctx);

      // if height is specified don't return the calculated height to get same behavior as width
      if (height) {
        this.calculatedHeight = null;
      } else {
        this.calculatedHeight = Converter.prototype.pageInfo.getCalculatedHeight();
      }
      if (Converter.prototype.pageInfo.hasCalculatedWidth()) {
        this.calculatedWidth = Converter.prototype.pageInfo.getCalculatedWidth();
      } else {
        this.calculatedWidth = null;
      }

      if (+backend === VF.Renderer.Backends.RAPHAEL) {
        ctx.paper.setSize(this.calculatedWidth || width, this.calculatedHeight || height);
      }

      if (callback) {
        callback(this.calculatedHeight, this.calculatedWidth);
      }

      this.Converter.draw(ctx);
      this.rendered_measures = this.Converter.getAllVexMeasureStaffs();

    }
  };

});