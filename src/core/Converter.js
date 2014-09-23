/*
 * MEItoVexFlow, Converter class
 * (based on meitovexflow.js)
 * Reworkings: Alexander Erhard
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

/*
 * MEItoVexFlow
 *
 * Author: Richard Lewis Contributors: Zoltan Komives, Raffaele Viglianti
 *
 * See README for details of this library
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

define([
  'jquery',
  'vexflow',
  'meilib/MeiLib',
  'm2v/core/Logger',
  'm2v/core/RuntimeError',
  'm2v/core/Util',
  'm2v/event/EventUtil',
  'm2v/event/Note',
  'm2v/event/GraceNote',
  'm2v/event/Chord',
  'm2v/event/GraceChord',
  'm2v/event/Rest',
  'm2v/event/MRest',
  'm2v/event/Space',
  'm2v/eventlink/Hairpins',
  'm2v/eventlink/Ties',
  'm2v/eventlink/Slurs',
  'm2v/eventpointer/Directives',
  'm2v/eventpointer/Dynamics',
  'm2v/eventpointer/Fermatas',
  'm2v/eventpointer/Ornaments',
  'm2v/lyrics/Verses',
  'm2v/lyrics/Syllable',
  'm2v/stave/Stave',
  'm2v/measure/Measure',
  'm2v/system/System',
  'm2v/system/SystemInfo',
  'm2v/core/Tables',
  'm2v/voice/StaveVoices'
], function ($, VF, MeiLib, Logger, RuntimeError, Util, EventUtil, Note, GraceNote, Chord, GraceChord, Rest, MRest, Space, Hairpins, Ties, Slurs, Directives, Dynamics, Fermatas, Ornaments, Verses, Syllable, Stave, Measure, System, SystemInfo, Tables, StaveVoices, undefined) {

  /**
   * Converts an MEI XML document / document fragment to VexFlow objects and
   * optionally renders it using Raphael or HTML5 Canvas.
   *
   * Usage:
   *
   * - Either pass a config object to the constructor function or (if no config
   * object has been passed) call {@link #initConfig} after construction.
   * - Call {@link #process} to process an MEI XML document
   * - Call {@link #draw} to draw the processed VexFlow objects to a canvas
   *
   * @class MEI2VF.Converter
   *
   * @constructor
   * @param {Object} [config]
   * @chainable
   * @return {MEI2VF.Converter} this
   */
  var Converter = function (config) {
    if (config) {
      this.initConfig(config);
    }
    return this;
  };

  Converter.prototype = {

    BOTTOM : VF.Annotation.VerticalJustify.BOTTOM,

    defaults : {
      /**
       * @cfg {Number} pageWidth The width of the page
       */
      pageWidth : 800,
      /**
       * @cfg {Number} pageTopMar The top page margin
       */
      pageTopMar : 60,
      /**
       * @cfg {Number} pageLeftMar The left page margin
       */
      pageLeftMar : 20,
      /**
       * @cfg {Number} pageRightMar The right page margin
       */
      pageRightMar : 20,
      /**
       * @cfg {Number} systemSpacing The spacing between two staff
       * systems
       */
      systemSpacing : 90,
      /**
       * @cfg {Number} staveSpacing The default spacing between two staffs
       * within a system; overridden by the spacing attribute of a staffDef
       * element in the MEI code
       */
      staveSpacing : 60,
      /**
       * @cfg {Boolean} autoStaveConnectorLine Specifies if a stave connector
       * line is drawn on the left of systems by default; if set to true, the
       * auto line will not appear when staffDef/@symbol="none" is set for the
       * outermost staffDef element
       */
      autoStaveConnectorLine : true,
      /**
       * @cfg {"full"/"abbr"/null} labelMode Specifies the way voice labels are
       * added
       * to staves. Values:
       *
       * - 'full': renders full labels in the first system, abbreviated labels
       * in all following systems
       * - 'abbr': only render abbreviated labels
       * - null or undefined: renders no labels
       */
      labelMode : null, // 'full',
      /**
       * @cfg {Number} maxHyphenDistance The maximum distance (in pixels)
       * between two hyphens in the lyrics lines
       */
      maxHyphenDistance : 75,
      /**
       * @cfg {Object} lyricsFont The font used for rendering lyrics (and
       * hyphens)
       * @cfg {String} lyricsFont.family the font family
       * @cfg {Number} lyricsFont.size the font size
       *
       * NB the weight properties can be used to specify style, weight
       * or both (space separated); some of the objects are passed directly
       * to vexFlow (which requires the name 'weight'), so the name is
       * 'weight'
       */
      lyricsFont : {
        family : 'Times',
        size : 13,
        spacing : 1.3
      },
      /**
       * @cfg {Object} annotFont the font used for annotations (for example,
       * 'pizz.')
       * @cfg {String} annotFont.family the font family
       * @cfg {Number} annotFont.size the font size
       * @cfg {String} annotFont.weight the font weight
       */
      annotFont : {
        family : 'Times',
        size : 15,
        weight : 'Italic'
      },
      /**
       * @cfg {Object} dynamFont the font used for dynamics
       * @cfg {String} dynamFont.family the font family
       * @cfg {Number} dynamFont.size the font size
       * @cfg {String} dynamFont.weight the font weight
       */
      dynamFont : {
        family : 'Times',
        size : 18,
        weight : 'bold italic'
      },
      /**
       * @cfg {Object} tempoFont The tempo font
       * @cfg {String} tempoFont.family the font family
       * @cfg {Number} tempoFont.size the font size
       * @cfg {String} tempoFont.weight the font weight
       */
      tempoFont : {
        family : "Times",
        size : 17,
        weight : "bold"
      }
    },

    /**
     * initializes the Converter
     * @method initConfig
     * @param {Object} config A config object (optional)
     * @chainable
     * @return {MEI2VF.Converter} this
     */
    initConfig : function (config) {
      var me = this;
      me.cfg = $.extend(true, {}, me.defaults, config);
      /**
       * an instance of MEI2VF.SystemInfo dealing with the system and staff
       * info derived from the MEI data
       * @property {MEI2VF.SystemInfo} systemInfo
       */
      me.systemInfo = new SystemInfo();
      /**
       * The print space coordinates calculated from the page config.
       * @property {Object} printSpace
       * @property {Number} printSpace.top
       * @property {Number} printSpace.left
       * @property {Number} printSpace.right
       * @property {Number} printSpace.width
       */
      me.printSpace = {
        // substract four line distances (40px) from pageTopMar in order
        // to compensate VexFlow's default top spacing / allow specifying
        // absolute values
        top : me.cfg.pageTopMar - 40,
        left : me.cfg.pageLeftMar,
        right : me.cfg.pageWidth - me.cfg.pageRightMar,
        width : Math.floor(me.cfg.pageWidth - me.cfg.pageRightMar - me.cfg.pageLeftMar) - 1
      };
      return me;

    },

    /**
     * Resets all data. Called by {@link #process}.
     * @method reset
     * @chainable
     * @return {MEI2VF.Converter} this
     */
    reset : function () {
      var me = this;
      me.systemInfo.init(me.cfg, me.printSpace);
      /**
       * @property {MEI2VF.EventLink[][]} unresolvedTStamp2
       */
      me.unresolvedTStamp2 = [];
      /**
       * Contains all {@link MEI2VF.System} objects
       * @property {MEI2VF.System[]} systems
       */
      me.systems = [];
      /**
       * Contains all Vex.Flow.Stave objects. Addressing scheme:
       * [measure_n][staff_n]
       * @property {Vex.Flow.Stave[][]} allVexMeasureStaffs
       */
      me.allVexMeasureStaffs = [];
      /**
       * Contains all Vex.Flow.Beam objects. Data is just pushed in
       * and later processed as a whole, so the array index is
       * irrelevant.
       * @property {Vex.Flow.Beam[]} allBeams
       */
      me.allBeams = [];
      /**
       * Contains all Vex.Flow.Tuplet objects. Data is just pushed in
       * and later processed as a whole, so the array index is
       * irrelevant.
       * @property {Vex.Flow.Tuplet[]} allTuplets
       */
      me.allTuplets = [];
      /**
       * an instance of MEI2VF.Dynamics dealing with and storing all dynamics
       * found in the MEI document
       * @property {MEI2VF.Dynamics} dynamics
       */
      me.dynamics = new Dynamics(me.systemInfo, me.cfg.dynamFont);
      /**
       * an instance of MEI2VF.Directives dealing with and storing all
       * directives found in the MEI document
       * @property {MEI2VF.Directives} directives
       */
      me.directives = new Directives(me.systemInfo, me.cfg.annotFont);
      /**
       * an instance of MEI2VF.Fermatas dealing with and storing all
       * fermata elements found in the MEI document (fermata attributes are
       * attached directly to the containing note-like object)
       * @property {MEI2VF.Fermatas} fermatas
       */
      me.fermatas = new Fermatas(me.systemInfo);
      /**
       * an instance of MEI2VF.Ornaments dealing with and storing all
       * trill elements found in the MEI document
       * @property {MEI2VF.Ornaments} trills
       */
      me.trills = new Ornaments(me.systemInfo);
      /**
       * an instance of MEI2VF.Ties dealing with and storing all ties found in
       * the MEI document
       * @property {MEI2VF.Ties} ties
       */
      me.ties = new Ties(me.systemInfo, me.unresolvedTStamp2);
      /**
       * an instance of MEI2VF.Slurs dealing with and storing all slurs found in
       * the MEI document
       * @property {MEI2VF.Slurs} slurs
       */
      me.slurs = new Slurs(me.systemInfo, me.unresolvedTStamp2);
      /**
       * an instance of MEI2VF.Hairpins dealing with and storing all hairpins
       * found in the MEI document
       * @property {MEI2VF.Hairpins} hairpins
       */
      me.hairpins = new Hairpins(me.systemInfo, me.unresolvedTStamp2);
      /**
       * contains all note-like objects in the current MEI document, accessible
       * by their xml:id
       * @property {Object} notes_by_id
       * @property {XMLElement} notes_by_id.meiNote the XML Element of the note
       * @property {Vex.Flow.StaveNote} notes_by_id.vexNote the VexFlow note
       * object
       */
      me.notes_by_id = {};
      /**
       * @property {Number} inBeamNo specifies the number of beams the current events are under
       */
      me.inBeamNo = 0;
      /**
       * @property {Boolean} hasStemDirInBeam specifies if a stem.dir has been specified in the current beam
       */
      me.hasStemDirInBeam = false;
      /**
       * Grace note or grace chord objects to be added to the next non-grace note or chord
       * @property {Vex.Flow.StaveNote[]} currentGraceNotes
       */
      me.currentGraceNotes = [];
      /**
       * the number of the current system
       * @property {Number} currentSystem_n
       */
      me.currentSystem_n = 0;
      /**
       * indicates if a system break is currently to be processed
       * @property {Boolean} pendingSystemBreak
       */
      me.pendingSystemBreak = false;
      /**
       * indicates if a system break is currently to be processed
       * @property {Boolean} pendingSectionBreak
       */
      me.pendingSectionBreak = true;
      /**
       * Contains information about the volta type of the current staff. Properties:
       *
       * -  `start` {String} indicates the number to render to the volta. When
       * falsy, it is assumed that the volta does not start in the current
       * measure
       * -  `end` {Boolean} indicates if there is a volta end in the current
       * measure
       *
       * If null, no volta is rendered
       * @property {Object} currentVoltaType
       */
      me.currentVoltaType = null;
      return me;
    },

    /**
     * Calls {@link #reset} and then processes the specified MEI document or
     * document fragment. The generated objects can
     * be processed further or drawn immediately to a canvas via {@link #draw}.
     * @method process
     * @chainable
     * @param {XMLDocument} xmlDoc the XML document
     * @return {MEI2VF.Converter} this
     */
    process : function (xmlDoc) {
      var me = this;
      me.reset();
      me.systemInfo.processScoreDef($(xmlDoc).find('scoreDef')[0]);
      me.processSections(xmlDoc);
      me.directives.createVexFromInfos(me.notes_by_id);
      me.dynamics.createVexFromInfos(me.notes_by_id);
      me.fermatas.createVexFromInfos(me.notes_by_id);
      me.trills.createVexFromInfos(me.notes_by_id);
      me.ties.createVexFromInfos(me.notes_by_id);
      me.slurs.createVexFromInfos(me.notes_by_id);
      me.hairpins.createVexFromInfos(me.notes_by_id);
      return me;
    },

    /**
     * Draws the internal data objects to a canvas
     * @method draw
     * @chainable
     * @param ctx The canvas context
     * @return {MEI2VF.Converter} this
     */
    draw : function (ctx) {
      var me = this;
      me.drawSystems(ctx);
      me.drawVexBeams(me.allBeams, ctx);
      me.drawVexTuplets(me.allTuplets, ctx);
      me.ties.setContext(ctx).draw();
      me.slurs.setContext(ctx).draw();
      me.hairpins.setContext(ctx).draw();
      return me;
    },

    /**
     * Returns the width and the height of the area that contains all drawn
     * staves as per the last processing.
     *
     * @method getStaffArea
     * @return {Object} the width and height of the area that contains all
     * staves.
     * Properties: width, height
     */
    getStaffArea : function () {
      var height, i;
      height = this.systemInfo.getCurrentLowestY();
      var allVexMeasureStaffs = this.getAllVexMeasureStaffs();
      var i, k, max_start_x, area_width, staff;
      i = allVexMeasureStaffs.length;
      area_width = 0;
      while (i--) {
        if (allVexMeasureStaffs[i]) {
          max_start_x = 0;
          // get maximum start_x of all staffs in measure
          k = allVexMeasureStaffs[i].length;
          while (k--) {
            staff = allVexMeasureStaffs[i][k];
            if (staff) {
              max_start_x = Math.max(max_start_x, staff.getNoteStartX());
            }
          }
          k = allVexMeasureStaffs[i].length;
          while (k--) {
            // get maximum width of all staffs in measure
            staff = allVexMeasureStaffs[i][k];
            if (staff) {
              area_width = Math.max(area_width, max_start_x + staff.getWidth());
            }
          }
        }
      }
      return {
        width : area_width,
        height : height
      };
    },

    /**
     * returns a 2d array of all Vex.Flow.Stave objects, arranged by
     * [measure_n][staff_n]
     * @method getAllVexMeasureStaffs
     * @return {Vex.Flow.Stave[][]} see {@link #allVexMeasureStaffs}
     */
    getAllVexMeasureStaffs : function () {
      return this.allVexMeasureStaffs;
    },

    /**
     * returns all systems created when processing the MEI document
     * @method getSystems
     * @return {MEI2VF.System[]}
     */
    getSystems : function () {
      return this.systems;
    },

    /**
     * returns all note-like objects created when processing the MEI document
     * @method getNotes
     * @return {Object} for the object properties, see {@link #notes_by_id}
     */
    getNotes : function () {
      return this.notes_by_id;
    },

    /**
     * creates in initializes a new {@link MEI2VF.System} and updates the staff
     * modifier infos
     * @method createNewSystem
     */
    createNewSystem : function () {
      var me = this, system, coords;

      Logger.debug('Converter.createNewSystem()', '{enter}');

      me.pendingSystemBreak = false;
      me.currentSystem_n += 1;

      coords = {
        x : me.printSpace.left,
        y : (me.currentSystem_n === 1) ? me.printSpace.top : me.systemInfo.getCurrentLowestY() + me.cfg.systemSpacing,
        w : me.printSpace.width
      };

      system = new System({
        leftMar : me.systemInfo.getLeftMar(),
        coords : coords,
        staffYs : me.systemInfo.getYs(coords.y),
        labels : me.getStaffLabels(),
        versesCfg : {
          font : me.cfg.lyricsFont,
          maxHyphenDistance : me.cfg.maxHyphenDistance
        }
      });

      if (me.pendingSectionBreak) {
        me.pendingSectionBreak = false;
        me.systemInfo.forceSectionStartInfos();
      } else {
        me.systemInfo.forceStaveStartInfos();
      }

      me.systems[me.currentSystem_n] = system;
      return system;
    },

    /**
     * @method processSections
     */
    processSections : function (xmlDoc) {
      var me = this;
      $(xmlDoc).find('section').each(function () {
        me.processSection(this);
      });
    },

    /**
     *@method processSection
     */
    processSection : function (element) {
      var me = this, i, j, sectionChildren = $(element).children();
      for (i = 0, j = sectionChildren.length; i < j; i += 1) {
        me.processSectionChild(sectionChildren[i]);
      }
    },

    /**
     * @method processEnding
     */
    processEnding : function (element) {
      var me = this, i, j, sectionChildren = $(element).children();
      for (i = 0, j = sectionChildren.length; i < j; i += 1) {
        me.currentVoltaType = {};
        if (i === 0) {
          me.currentVoltaType.start = $(element).attr('n');
        }
        if (i === j - 1) {
          me.currentVoltaType.end = true;
        }
        me.processSectionChild(sectionChildren[i]);
      }
      me.currentVoltaType = null;
    },

    /**
     * MEI element <b>section</b> may contain (MEI v2.1.0): MEI.cmn: measure
     * MEI.critapp: app MEI.edittrans: add choice corr damage del gap
     * handShift orig reg restore sic subst supplied unclear MEI.shared:
     * annot ending expansion pb sb scoreDef section staff staffDef
     * MEI.text: div MEI.usersymbols: anchoredText curve line symbol
     *
     * Supported elements: <b>measure</b> <b>scoreDef</b> <b>staffDef</b>
     * <b>sb</b>
     * @method processSectionChild
     */
    processSectionChild : function (element) {
      var me = this;
      switch (element.localName) {
        case 'measure' :
          me.processMeasure(element);
          break;
        case 'scoreDef' :
          me.systemInfo.processScoreDef(element);
          break;
        case 'staffDef' :
          me.systemInfo.processStaffDef(element);
          break;
        case 'sb' :
          me.setPendingSystemBreak(element);
          break;
        case 'ending' :
          me.processEnding(element);
          break;
        default :
          Logger.info('Not supported', 'Element ' + Util.serializeElement(element) +
                                       ' is not supported in <section>. Skipping element.');
      }
    },

    /**
     * sets the property {@link #pendingSystemBreak} to `true`. When true, a
     * new system will be initialized when {@link #processMeasure} is called
     * the next time.
     * @method setPendingSystemBreak
     */
    setPendingSystemBreak : function () {
      this.pendingSystemBreak = true;
    },

    /**
     * Processes a MEI measure element and calls functions to process a
     * selection of ancestors: .//staff, ./slur, ./tie, ./hairpin, .//tempo
     * @method processMeasure
     * @param {XMLElement} element the MEI measure element
     */
    processMeasure : function (element) {
      var me = this, atSystemStart, left_barline, right_barline, system, system_n;

      if (me.pendingSectionBreak || me.pendingSystemBreak) {
        system_n = me.systems.length;
        system = me.createNewSystem();
        atSystemStart = true;
      } else {
        system_n = me.systems.length - 1;
        system = me.systems[system_n];
        atSystemStart = false;
      }

      Logger.debug('Converter.processMeasure()', '{enter}');

      left_barline = element.getAttribute('left');
      right_barline = element.getAttribute('right');

      var staffElements = [], dirElements = [], slurElements = [], tieElements = [], hairpinElements = [], tempoElements = [], dynamElements = [], fermataElements = [], trillElements = [], rehElements = [];

      $(element).find('*').each(function () {
        switch (this.localName) {
          case 'staff':
            staffElements.push(this);
            break;
          case 'dir':
            dirElements.push(this);
            break;
          case 'tie':
            tieElements.push(this);
            break;
          case 'slur':
            slurElements.push(this);
            break;
          case 'hairpin':
            hairpinElements.push(this);
            break;
          case 'tempo':
            tempoElements.push(this);
            break;
          case 'dynam':
            dynamElements.push(this);
            break;
          case 'fermata':
            fermataElements.push(this);
            break;
          case 'trill':
            trillElements.push(this);
            break;
          case 'reh':
            rehElements.push(this);
            break;
          default:
            break;
        }
      });

      // the staff objects will be stored in two places:
      // 1) in each MEI2VF.Measure
      // 2) in MEI2VF.Converter.allVexMeasureStaffs
      var staffs = me.initializeMeasureStaffs(system, staffElements, left_barline, right_barline, atSystemStart);
      var measureIndex = me.allVexMeasureStaffs.push(staffs) - 1;

      var currentStaveVoices = new StaveVoices();

      $.each(staffElements, function () {
        me.processStaffEvents(staffs, this, measureIndex, currentStaveVoices);
      });

      me.directives.createInfos(dirElements, element);
      me.dynamics.createInfos(dynamElements, element);
      me.fermatas.createInfos(fermataElements, element);
      me.trills.createInfos(trillElements, element);
      me.ties.createInfos(tieElements, element, measureIndex, me.systemInfo);
      me.slurs.createInfos(slurElements, element, measureIndex, me.systemInfo);
      me.hairpins.createInfos(hairpinElements, element, measureIndex, me.systemInfo);

      system.addMeasure(new Measure({
        system : system,
        element : element,
        staffs : staffs,
        voices : currentStaveVoices,
        startConnectorCfg : (atSystemStart) ? {
          labelMode : me.cfg.labelMode,
          models : me.systemInfo.startConnectorInfos,
          staffs : staffs,
          system_n : me.currentSystem_n
        } : null,
        inlineConnectorCfg : {
          models : me.systemInfo.inlineConnectorInfos,
          staffs : staffs,
          barline_l : left_barline,
          barline_r : right_barline
        },
        tempoElements : tempoElements,
        rehElements : rehElements,
        tempoFont : me.cfg.tempoFont
      }));
    },

    /**
     * @method initializeMeasureStaffs
     * @param {MEI2VF.System} system the current system
     * @param {XMLElement[]} staffElements all staff elements in the current
     * measure
     * @param {String} left_barline the left barline
     * @param {String} right_barline the right barline
     * @param {Boolean} atSystemStart indicates if the current measure is the system's start measure
     */
    initializeMeasureStaffs : function (system, staffElements, left_barline, right_barline, atSystemStart) {
      var me = this, staff, staff_n, staffs, isFirstVolta = true, clefOffsets = {}, maxClefOffset = 0, keySigOffsets = {}, maxKeySigOffset = 0, precedingMeasureStaffs, newClef, currentStaveInfo;

      staffs = [];

      if (!atSystemStart) {
        precedingMeasureStaffs = system.getLastMeasure().getStaffs();
      }

      // first run: create MEI2VF.Stave objects, store them in the staffs
      // array. Set staff barlines and staff volta. Add clef. Get each staff's
      // clefOffset and calculate the maxClefOffset.
      $.each(staffElements, function () {
        staff_n = +$(this).attr('n');
        if (!staff_n) {
          Logger.warn('@n expected', Util.serializeElement(this) +
                                     ' does not contain an @n attribute. Proceeding in first staff.');
          staff_n = 1;
        }

        staff = new Stave({
          system : system,
          y : system.getStaffYs()[staff_n],
          leftBarline : left_barline,
          rightBarline : right_barline
        });
        staffs[staff_n] = staff;

        var currentVoltaType = me.currentVoltaType;
        if (isFirstVolta && currentVoltaType) {
          staff.addVoltaFromInfo(currentVoltaType);
        }
        if (precedingMeasureStaffs && precedingMeasureStaffs[staff_n]) {
          currentStaveInfo = me.systemInfo.getStaveInfo(staff_n);
          newClef = currentStaveInfo.getClef();
          if (currentStaveInfo.showClefCheck()) {
            precedingMeasureStaffs[staff_n].addEndClefFromInfo(newClef);
          }
          staff.clef = newClef.type;
          clefOffsets[staff_n] = 0;
          maxClefOffset = 0;
        } else {
          currentStaveInfo = me.systemInfo.getStaveInfo(staff_n);
          if (!currentStaveInfo) {
            throw new RuntimeError('Reference error', Util.serializeElement(this) +
                                                               ' refers to staff "' + staff_n +
                                                  '", but no corresponding staff definition could be found in the document.');
            return;
          }
          if (currentStaveInfo.showClefCheck()) {
            staff.addClefFromInfo(currentStaveInfo.getClef());
          }
          clefOffsets[staff_n] = staff.getModifierXShift();
          maxClefOffset = Math.max(maxClefOffset, clefOffsets[staff_n]);
        }
        isFirstVolta = false;
      });

      // second run: add key signatures; if the clefOffset of a staff is less than
      // maxClefOffset, add padding to the left of the key signature. Get each
      // staff's keySigOffset and calculate the maxKeySigOffset.
      $.each(staffs, function (i, staff) {
        var padding;
        if (staff) {
          if (clefOffsets[i] !== maxClefOffset) {
            padding = maxClefOffset - clefOffsets[i] + 10;
          }
          currentStaveInfo = me.systemInfo.getStaveInfo(i);
          if (currentStaveInfo.showKeysigCheck()) {
            staff.addKeySpecFromInfo(currentStaveInfo.getKeySpec(), padding);
          }
          keySigOffsets[i] = staff.getModifierXShift();
          maxKeySigOffset = Math.max(maxKeySigOffset, keySigOffsets[i]);
        }
      });

      // third run: add time signatures; if the keySigOffset of a staff is
      // less than maxKeySigOffset, add padding to the left of the time signature.
      $.each(staffs, function (i, staff) {
        var padding;
        if (staff) {
          if (keySigOffsets[i] !== maxKeySigOffset) {
            padding = maxKeySigOffset - keySigOffsets[i] + 15;
          }
          currentStaveInfo = me.systemInfo.getStaveInfo(i);
          if (currentStaveInfo.showTimesigCheck()) {
            staff.addTimeSpecFromInfo(currentStaveInfo.getTimeSpec(), padding);
          }
        }
      });

      return staffs;
    },

    /**
     * @method getStaffLabels
     */
    getStaffLabels : function () {
      var me = this, labels, i, infos, labelType;
      labels = {};
      if (!me.cfg.labelMode) {
        return labels;
      }
      labelType = (me.cfg.labelMode === 'full' && me.currentSystem_n === 1) ? 'label' : 'labelAbbr';
      infos = me.systemInfo.getAllStaveInfos();
      i = infos.length;
      while (i--) {
        if (infos[i]) {
          labels[i] = infos[i][labelType];
        }
      }
      return labels;
    },

    /**
     * Processes a single stave in a measure
     *
     * @method processStaffEvents
     * @param {Vex.Flow.Stave[]} staffs the staff objects in the current
     * measure
     * @param {XMLElement} staff_element the MEI staff element
     * @param {Number} measureIndex the index of the current measure
     * @param {MEI2VF.StaveVoices} currentStaveVoices The current StaveVoices
     * object
     */
    processStaffEvents : function (staffs, staff_element, measureIndex, currentStaveVoices) {
      var me = this, staff, staff_n, readEvents, layerElements, i, j, layer_events, layerDir, currentGraceNotes = [], staffInfo;

      staff_n = +$(staff_element).attr('n') || 1;
      staff = staffs[staff_n];

      staffInfo = me.systemInfo.getStaveInfo(staff_n);
      var meter = staffInfo.getTimeSpec();

      readEvents = function () {
        var event = me.processNoteLikeElement(this, staff, staff_n, layerDir, staffInfo);
        return event ? (event.vexNote || event) : null;
      };

      layerElements = $(staff_element).find('layer');

      for (i = 0, j = layerElements.length; i < j; i++) {
        layerDir = (j > 1) ? (i === 0 ? VF.StaveNote.STEM_UP : i === j - 1 ? VF.StaveNote.STEM_DOWN : null) : null;
        me.resolveUnresolvedTimestamps(layerElements[i], staff_n, measureIndex, meter);
        staffInfo.checkInitialClef();
        layer_events = $(layerElements[i]).children().map(readEvents).get();
        currentStaveVoices.addVoice(me.createVexVoice(layer_events, meter), staff_n);

      }

      // if there is a clef not yet attached to a note (i.e. the last clef), add it to the last voice
      if (me.currentClefChangeProperty) {
        staff.addEndClefFromInfo(me.currentClefChangeProperty);
        me.currentClefChangeProperty = null;
      }

      staffInfo.removeStartClefCopy();
    },

    /**
     * Creates a new Vex.Flow.Voice
     * @method createVexVoice
     * @param {Array} voice_contents The contents of the voice, an array of
     * tickables
     * @param {Object} meter The meter of the enclosing staff element
     * return {Vex.Flow.Voice}
     */
    createVexVoice : function (voice_contents, meter) {
      var me = this, voice;
      if (!$.isArray(voice_contents)) {
        throw new RuntimeError('BadArguments', 'me.createVexVoice() voice_contents argument must be an array.');
      }
      voice = new VF.Voice({
        num_beats : meter.count,
        beat_value : meter.unit,
        resolution : VF.RESOLUTION
      });
      voice.setStrict(false);
      voice.addTickables(voice_contents);
      return voice;
    },

    /**
     * @method resolveUnresolvedTimestamps
     */
    resolveUnresolvedTimestamps : function (layer, staff_n, measureIndex, meter) {
      var me = this, refLocationIndex;
      // check if there's an unresolved TStamp2 reference to this location
      // (measure, staff, layer):
      staff_n = staff_n || 1;
      refLocationIndex = measureIndex + ':' + staff_n + ':' + ($(layer).attr('n') || '1');
      if (me.unresolvedTStamp2[refLocationIndex]) {
        $(me.unresolvedTStamp2[refLocationIndex]).each(function (i) {
          this.setContext({
            layer : layer,
            meter : meter
          });
          // TODO: remove eventLink from the list
          me.unresolvedTStamp2[refLocationIndex][i] = null;
        });
        // at this point all references should be supplied with context.
        me.unresolvedTStamp2[refLocationIndex] = null;
      }
    },

    /**
     * processes a note-like element by calling the adequate processing
     * function
     *
     * @method processNoteLikeElement
     * @param {XMLElement} element the element to process
     * @param {Vex.Flow.Stave} staff the VexFlow staff object
     * @param {Number} staff_n the number of the staff as given in the MEI document
     * @param {VF.StaveNote.STEM_UP|VF.StaveNote.STEM_DOWN|null} layerDir the direction of the current
     * layer
     */
    processNoteLikeElement : function (element, staff, staff_n, layerDir, staffInfo) {
      var me = this;
      switch (element.localName) {
        case 'rest' :
          return me.processRest(element, staff, staff_n);
        case 'mRest' :
          return me.processmRest(element, staff, staff_n, layerDir, staffInfo);
        case 'space' :
          return me.processSpace(element, staff);
        case 'note' :
          return me.processNote(element, staff, staff_n, layerDir);
        case 'beam' :
          return me.processBeam(element, staff, staff_n, layerDir, staffInfo);
        case 'tuplet' :
          return me.processTuplet(element, staff, staff_n, layerDir, staffInfo);
        case 'chord' :
          return me.processChord(element, staff, staff_n, layerDir, staffInfo);
        case 'clef' :
          return me.processClef(element, staff, staff_n, layerDir, staffInfo);
        case 'anchoredText' :
          me.processAnchoredText(element, staff, staff_n, layerDir, staffInfo);
          return;
        default :
          Logger.info('Not supported', 'Element "' + element.localName + '" is not supported. Skipping element.');
      }
    },

    processAnchoredText : function (element, staff, staff_n, layerDir, staffInfo) {
    },

    /**
     * @method processNote
     */
    processNote : function (element, staff, staff_n, layerDir) {
      var me = this, xml_id, mei_tie, mei_slur, mei_staff_n, i, atts, note_opts, note, clef, vexPitch;

      atts = Util.attsToObj(element);

      mei_tie = atts.tie;
      mei_slur = atts.slur;
      mei_staff_n = +atts.staff || staff_n;

      xml_id = MeiLib.XMLID(element);

      try {

        vexPitch = EventUtil.getVexPitch(element);

        if (mei_staff_n !== staff_n) {
          var otherStaff = me.allVexMeasureStaffs[me.allVexMeasureStaffs.length - 1][mei_staff_n];
          if (otherStaff) {
            staff = otherStaff;
          } else {
            Logger.warn('Staff not found', 'No staff could be found which corresponds to @staff="' + mei_staff_n +
                                           '" specified in ' + Util.serializeElement(element) +
                                           '". Proceeding by adding note to current staff.');
          }
        }

        note_opts = {
          vexPitch : vexPitch,
          clef : me.systemInfo.getClef(staff_n),
          element : element,
          atts : atts,
          stave : staff,
          layerDir : layerDir
        };

        note = (atts.grace) ? new GraceNote(note_opts) : new Note(note_opts);

        if (note.hasMeiStemDir && me.inBeamNo > 0) {
          me.hasStemDirInBeam = true;
        }

        me.processSyllables(note, element, staff_n);


        // FIXME For now, we'll remove any child nodes of <note>
        $(element).children().each(function () {
          $(this).remove();
        });

        if (mei_tie) {
          me.processAttrTie(mei_tie, xml_id, vexPitch, staff_n);
        }
        if (mei_slur) {
          me.processAttrSlur(mei_slur, xml_id);
        }

        me.notes_by_id[xml_id] = {
          meiNote : element,
          vexNote : note,
          system : me.currentSystem_n,
          layerDir : layerDir
        };

        if (me.currentClefChangeProperty) {
          EventUtil.addClefModifier(note, me.currentClefChangeProperty);
          me.currentClefChangeProperty = null;
        }

        if (atts.grace) {
          me.currentGraceNotes.push(note);
          return;
        } else {
          if (me.currentGraceNotes.length > 0) {
            note.addModifier(0, new VF.GraceNoteGroup(me.currentGraceNotes, false).beamNotes());
            me.currentGraceNotes = [];
          }
        }
        return {
          vexNote : note,
          id : xml_id
        };

      } catch (e) {
        throw new RuntimeError('BadArguments', 'A problem occurred processing ' + Util.serializeElement(element) +
                                               '\nORIGINAL ERROR MESSAGE: ' + e.toString());
      }
    },

    /**
     * @method processChord
     */
    processChord : function (element, staff, staff_n, layerDir, staffInfo) {
      var me = this, children, xml_id, chord, chord_opts, atts;

      children = $(element).children('note');

      atts = Util.attsToObj(element);

      xml_id = MeiLib.XMLID(element);

      try {

        chord_opts = {
          children : children,
          clef : me.systemInfo.getClef(staff_n),
          stave : staff,
          element : element,
          atts : atts,
          layerDir : layerDir
        };

        chord = (atts.grace) ? new GraceChord(chord_opts) : new Chord(chord_opts);

        if (chord.hasMeiStemDir && me.inBeamNo > 0) {
          me.hasStemDirInBeam = true;
        }

        var allNoteIndices = [];

        children.each(function (i) {
          me.processNoteInChord(i, this, element, chord, staff_n, layerDir);
          allNoteIndices.push(i);
        });

        me.notes_by_id[xml_id] = {
          meiNote : element,
          vexNote : chord,
          index : allNoteIndices,
          system : me.currentSystem_n,
          layerDir : layerDir
        };

        if (me.currentClefChangeProperty) {
          EventUtil.addClefModifier(chord, me.currentClefChangeProperty);
          me.currentClefChangeProperty = null;
        }

        if (atts.grace) {
          me.currentGraceNotes.push(chord);
          return;
        } else {
          if (me.currentGraceNotes.length > 0) {
            chord.addModifier(0, new VF.GraceNoteGroup(me.currentGraceNotes, false).beamNotes());
            me.currentGraceNotes = [];
          }
        }
        return {
          vexNote : chord,
          id : xml_id
        };
      } catch (e) {
        var childStrings = $(element).children().map(function () {
          return '\n    ' + Util.serializeElement(this);
        }).get().join('');
        throw new RuntimeError('BadArguments', 'A problem occurred processing \n' + Util.serializeElement(element) +
                                               childStrings + '\n</chord>\nORIGINAL ERROR MESSAGE: ' + e.toString());
      }
    },

    /**
     * @method processNoteInChord
     */
    processNoteInChord : function (i, element, chordElement, chord, staff_n, layerDir) {
      var me = this, atts, xml_id;

      atts = Util.attsToObj(element);

      var vexPitch = EventUtil.getVexPitch(element);

      xml_id = MeiLib.XMLID(element);

      if (atts.tie) {
        me.processAttrTie(atts.tie, xml_id, vexPitch, staff_n);
      }
      if (atts.slur) {
        me.processAttrSlur(atts.slur, xml_id);
      }

      me.notes_by_id[xml_id] = {
        meiNote : chordElement,
        vexNote : chord,
        index : [i],
        system : me.currentSystem_n,
        layerDir : layerDir
      };

      if (atts.accid) {
        EventUtil.processAttrAccid(atts.accid, chord, i);
      }
      if (atts.fermata) {
        EventUtil.addFermata(chord, element, atts.fermata, i);
      }
    },

    /**
     * @method processRest
     */
    processRest : function (element, staff, staff_n) {
      var me = this, rest, xml_id, clef;
      try {

        rest = new Rest({
          element : element,
          stave : staff,
          clef : (element.hasAttribute('ploc') && element.hasAttribute('oloc')) ? me.systemInfo.getClef(staff_n) : null
        });

        xml_id = MeiLib.XMLID(element);

        if (me.currentClefChangeProperty) {
          EventUtil.addClefModifier(rest, me.currentClefChangeProperty);
          me.currentClefChangeProperty = null;
        }

        me.notes_by_id[xml_id] = {
          meiNote : element,
          vexNote : rest,
          system : me.currentSystem_n
        };
        return {
          vexNote : rest,
          id : xml_id
        };
      } catch (e) {
        console.log(e);
        throw new RuntimeError('BadArguments', 'A problem occurred processing ' + Util.serializeElement(element));
      }
    },

    /**
     * @method processmRest
     */
    processmRest : function (element, staff, staff_n, layerDir, staffInfo) {
      var me = this, mRest, atts, xml_id, meter, duration;

      try {
        var mRestOpts = {
          meter : me.systemInfo.getStaveInfo(staff_n).getTimeSpec(),
          element : element,
          stave : staff,
          clef : (element.hasAttribute('ploc') && element.hasAttribute('oloc')) ? me.systemInfo.getClef(staff_n) : null
        };

        mRest = new MRest(mRestOpts);

        xml_id = MeiLib.XMLID(element);

        me.notes_by_id[xml_id] = {
          meiNote : element,
          vexNote : mRest,
          system : me.currentSystem_n
        };
        return {
          vexNote : mRest,
          id : xml_id
        };
      } catch (e) {
        throw new RuntimeError('BadArguments', 'A problem occurred processing ' + Util.serializeElement(element));
      }
    },

    /**
     * @method processSpace
     */
    processSpace : function (element, staff) {
      try {
        return {
          vexNote : new Space({ element : element, stave : staff })
        };
      } catch (e) {
        throw new RuntimeError('BadArguments', 'A problem occurred processing ' + Util.serializeElement(element));
      }
    },

    /**
     * @method processClef
     * @param {XMLElement} element the MEI clef element
     * @param {MEI2VF.Stave} staff the containing staff
     * @param {Number} the number of the containing staff
     */
    processClef : function (element, staff, staff_n, layerDir, staffInfo) {
      this.currentClefChangeProperty = staffInfo.clefChangeInMeasure(element);
    },

    /**
     * @method processBeam
     * @param {XMLElement} element the MEI beam element
     * @param {MEI2VF.Stave} staff the containing staff
     * @param {Number} the number of the containing staff
     * @param {VF.StaveNote.STEM_UP|VF.StaveNote.STEM_DOWN|null} layerDir the direction of the current
     * layer
     */
    processBeam : function (element, staff, staff_n, layerDir, staffInfo) {
      var me = this, elements, regularBeamElements = [];
      me.inBeamNo += 1;
      var process = function () {
        // make sure to get vexNote out of wrapped note objects
        var proc_element = me.processNoteLikeElement(this, staff, staff_n, layerDir, staffInfo);
        return proc_element ? (proc_element.vexNote || proc_element) : null;
      };
      elements = $(element).children().map(process).get();

      // TODO remove filter later and modify beam object to skip objects other than note and clef
      var filteredElements = elements.filter(function (element) {
        return element.beamable === true;
      });

      // set autostem parameter of VF.Beam to true if neither layerDir nor any stem direction in the beam is specified
      if (elements.length > 0) me.allBeams.push(new VF.Beam(filteredElements, !layerDir && !me.hasStemDirInBeam));

      me.inBeamNo -= 1;
      if (me.inBeamNo === 0) {
        me.hasStemDirInBeam = false;
      }
      return elements;
    },

    /**
     * Processes an MEI <b>tuplet</b>.
     * Supported attributes:
     *
     * - num (3 if not specified)
     * - numbase (2 if not specified)
     * - num.format ('count' if not specified)
     * - bracket.visible (auto if not specified)
     * - bracket.place (auto if not specified)
     *
     * @method processTuplet
     * @param {XMLElement} element the MEI tuplet element
     * @param {MEI2VF.Stave} staff the containing staff
     * @param {Number} staff_n the number of the containing staff
     * @param {VF.StaveNote.STEM_UP|VF.StaveNote.STEM_DOWN|null} layerDir the direction of the current
     * layer
     */
    processTuplet : function (element, staff, staff_n, layerDir, staffInfo) {
      var me = this, elements, tuplet, bracketPlace;
      var process = function () {
        // make sure to get vexNote out of wrapped note objects
        var proc_element = me.processNoteLikeElement(this, staff, staff_n, layerDir, staffInfo);
        return proc_element ? (proc_element.vexNote || proc_element) : null;
      };
      elements = $(element).children().map(process).get();

      if (elements.length === 0) {
        Logger.warn('Missing content', 'Not content found in ' + Util.serializeElement(element) +
                                       '". Skipping tuplet creation.');
        return;
      }

      tuplet = new VF.Tuplet(elements, {
        num_notes : +element.getAttribute('num') || 3,
        beats_occupied : +element.getAttribute('numbase') || 2
      });

      if (element.getAttribute('num.format') === 'ratio') {
        tuplet.setRatioed(true);
      }

      tuplet.setBracketed(element.getAttribute('bracket.visible') === 'true');

      bracketPlace = element.getAttribute('bracket.place');
      if (bracketPlace) {
        tuplet.setTupletLocation((bracketPlace === 'above') ? 1 : -1);
      }

      me.allTuplets.push(tuplet);
      return elements;
    },

    /**
     * @method processAttrTie
     */
    processAttrTie : function (mei_tie, xml_id, vexPitch, staff_n) {
      var me = this, i, j;
      for (i = 0, j = mei_tie.length; i < j; ++i) {
        if (mei_tie[i] === 't' || mei_tie[i] === 'm') {
          me.ties.terminateTie(xml_id, {
            vexPitch : vexPitch,
            staff_n : staff_n
          });
        }
        if (mei_tie[i] === 'i' || mei_tie[i] === 'm') {
          me.ties.startTie(xml_id, {
            vexPitch : vexPitch,
            staff_n : staff_n
          });
        }
      }
    },

    /**
     * @method processAttrSlur
     */
    processAttrSlur : function (mei_slur, xml_id) {
      var me = this, tokens;
      if (mei_slur) {
        // create a list of { letter, num }
        tokens = me.parseSlurAttribute(mei_slur);
        $.each(tokens, function () {
          if (this.letter === 't') {
            me.slurs.terminateSlur(xml_id, {
              nesting_level : this.nesting_level
            });
          }
          if (this.letter === 'i') {
            me.slurs.startSlur(xml_id, {
              nesting_level : this.nesting_level
            });
          }
        });
      }
    },

    /**
     * @method parseSlurAttribute
     */
    parseSlurAttribute : function (slur_str) {
      var result = [], numbered_tokens, numbered_token, i, j, num;
      numbered_tokens = slur_str.split(' ');
      for (i = 0, j = numbered_tokens.length; i < j; i += 1) {
        numbered_token = numbered_tokens[i];
        if (numbered_token.length === 1) {
          result.push({
            letter : numbered_token,
            nesting_level : 0
          });
        } else if (numbered_token.length === 2) {
          num = +numbered_token[1];
          if (!num) {
            throw new RuntimeError('MEI2VF.RERR.BadArguments:ParseSlur01', "badly formed slur attribute");
          }
          result.push({
            letter : numbered_token[0],
            nesting_level : num
          });
        } else {
          throw new RuntimeError('MEI2VF.RERR.BadArguments:ParseSlur01', "badly formed slur attribute");
        }
      }
      return result;
    },

    /**
     * @method processSyllables
     */
    processSyllables : function (note, element, staff_n) {
      var me = this, vexSyllable;
      $(element).find('syl').each(function () {
        vexSyllable = new Syllable(this, me.cfg.lyricsFont);
        note.addAnnotation(0, vexSyllable);
        me.systems[me.currentSystem_n].verses.addSyllable(vexSyllable, this, staff_n);
      });
    },

    /**
     * @method drawSystems
     */
    drawSystems : function (ctx) {
      var me = this, i = me.systems.length;
      while (i--) {
        if (me.systems[i]) {
          me.systems[i].format(ctx).draw(ctx);
        }
      }
    },

    /**
     * @method drawVexBeams
     */
    drawVexBeams : function (beams, ctx) {
      $.each(beams, function () {
        this.setContext(ctx).draw();
      });
    },
    /**
     * @method drawVexBeams
     */
    drawVexTuplets : function (tuplets, ctx) {
      $.each(tuplets, function () {
        this.setContext(ctx).draw();
      });
    }
  };

  return Converter;

});
