/*
 * MEItoVexFlow, SystemInfo class
 *
 * Author: Alexander Erhard
 * (process... methods based on meitovexflow.js)
 * Contributor: @davethehat
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
  'm2v/core/Logger',
  'm2v/core/RuntimeError',
  'm2v/stave/StaveInfo'
], function ($, Logger, RuntimeError, StaveInfo, undefined) {

  /**
   * @class MEI2VF.SystemInfo
   * Deals with MEI data provided by scoreDef, staffDef and staffGrp elements and its children
   * @private
   *
   * @constructor

   */
  var SystemInfo = function () {
    return;
  };

  SystemInfo.prototype = {

    STAVE_HEIGHT : 40,

    init : function (cfg, printSpace) {
      var me = this;
      me.cfg = cfg;
      me.printSpace = printSpace;

      /**
       * contains the current {@link MEI2VF.StaveInfo} objects
       */
      me.currentStaveInfos = [];
      /**
       * @property {Number} systemLeftMar the left margin of the
       * current system (additional to the left print space margin)
       */
      me.systemLeftMar = undefined;
      /**
       * @property {Number} currentLowestY the lowest Y coordinate of the
       * previously processed staffs
       */
      me.currentLowestY = 0;

      me.startConnectorInfos = {};
      me.inlineConnectorInfos = {};

    },

    setLeftMar : function (width) {
      this.systemLeftMar = width;
    },

    getLeftMar : function () {
      return this.systemLeftMar;
    },

    setModelForStaveRange : function (target, obj, add) {
      add = add || '';
      target[obj.top_staff_n + ':' + obj.bottom_staff_n + add] = obj;
    },

    /**
     * @method
     */
    setConnectorModels : function (staffGrp, range, isChild, ancestorSymbols) {
      var me = this, symbol, barthru, first_n, last_n;

      first_n = range.first_n;
      last_n = range.last_n;
      symbol = $(staffGrp).attr('symbol');
      barthru = $(staffGrp).attr('barthru');

      Logger.debug('Converter.setConnectorModels() {2}', 'symbol: ' + symbol, ' range.first_n: ' +
                                                                                     first_n, ' range.last_n: ' +
                                                                                              last_n);

      // 1. left connectors specified in the MEI file:
      me.setModelForStaveRange(me.startConnectorInfos, {
        top_staff_n : first_n,
        bottom_staff_n : last_n,
        symbol : symbol || 'line',
        label : $(staffGrp).attr('label'),
        labelAbbr : $(staffGrp).attr('label.abbr'),
        ancestorSymbols : ancestorSymbols
      });

      // 2. left auto line, only (if at all) attached to
      // //staffGrp[not(ancestor::staffGrp)]
      if (!isChild && me.cfg.autoStaveConnectorLine) {
        me.setModelForStaveRange(me.startConnectorInfos, {
          top_staff_n : first_n,
          bottom_staff_n : last_n,
          symbol : (symbol === 'none') ? 'none' : 'line'
        }, 'autoline');
      }

      // 3. inline connectors
      if (barthru === 'true') {
        me.setModelForStaveRange(me.inlineConnectorInfos, {
          top_staff_n : first_n,
          bottom_staff_n : last_n,
          symbol : 'singleright' // default
        });
      }
    },

    getStaveInfo : function (staff_n) {
      return this.currentStaveInfos[staff_n];
    },

    getAllStaveInfos : function () {
      return this.currentStaveInfos;
    },

    /**
     * @method
     */
    getClef : function (staff_n) {
      var me = this, staff_info;
      staff_info = me.currentStaveInfos[staff_n];
      if (!staff_info) {
        throw new RuntimeError('MEI2VF.getClefForStaffNr():E01', 'No staff definition for staff n=' + staff_n);
      }
      return staff_info.getClef();
    },

    getCurrentLowestY : function () {
      return this.currentLowestY;
    },

    setCurrentLowestY : function (y) {
      this.currentLowestY = y;
    },

    getYs : function (currentSystemY) {
      var me = this, currentStaffY, i, j, isFirstStaff = true, infoSpacing, lowestYCandidate, ys = [];
      currentStaffY = 0;
      for (i = 1, j = me.currentStaveInfos.length; i < j; i += 1) {
        if (me.currentStaveInfos[i]) {
          infoSpacing = me.currentStaveInfos[i].spacing;
          currentStaffY += (isFirstStaff) ? 0 :
                           (infoSpacing !== null) ? me.STAVE_HEIGHT + me.currentStaveInfos[i].spacing :
                           me.STAVE_HEIGHT + me.cfg.staveSpacing;
          ys[i] = currentSystemY + currentStaffY;
          isFirstStaff = false;
        }
      }
      lowestYCandidate = currentSystemY + currentStaffY + me.STAVE_HEIGHT;
      if (lowestYCandidate > me.currentLowestY) {
        me.currentLowestY = lowestYCandidate;
      }
      return ys;
    },

    forceSectionStartInfos : function () {
      var me = this, i = me.currentStaveInfos.length;
      while (i--) {
        if (me.currentStaveInfos[i]) {
          me.currentStaveInfos[i].forceSectionStartInfo();
        }
      }
    },

    forceStaveStartInfos : function () {
      var me = this, i = me.currentStaveInfos.length;
      while (i--) {
        if (me.currentStaveInfos[i]) {
          me.currentStaveInfos[i].forceStaveStartInfo();
        }
      }
    },

    /**
     *
     */
    processScoreDef : function (scoredef) {
      var me = this, i, j, children, systemLeftmar;
      me.scoreDefElement = scoredef;
      me.scoreDef = $(scoredef);
      systemLeftmar = me.scoreDef.attr('system.leftmar');
      if (typeof systemLeftmar === 'string') {
        me.setLeftMar(+systemLeftmar);
      }
      children = me.scoreDef.children();

      if (children.length === 0) {
        me.updateStaffDefs(scoredef);
      }

      for (i = 0, j = children.length; i < j; i += 1) {
        me.processScoreDef_child(children[i]);
      }
    },

    /**
     * TODO CHANGE
     * @param scoredef
     */
    updateStaffDefs : function (scoredef) {
      var me = this, i = me.currentStaveInfos.length;
      while (i--) {
        if (me.currentStaveInfos[i]) {
          me.currentStaveInfos[i].overrideWithScoreDef(scoredef);
        }
      }
    },


    /**
     * MEI element <b>scoreDef</b> may contain (MEI v2.1.0):
     * MEI.cmn: <b>meterSig</b> <b>meterSigGrp</b>
     * MEI.harmony: <b>chordTable</b> MEI.linkalign:
     * <b>timeline</b> MEI.midi: <b>instrGrp</b> MEI.shared:
     * <b>keySig</b> <b>pgFoot</b> <b>pgFoot2</b> <b>pgHead</b>
     * <b>pgHead2</b> <b>staffGrp</b> MEI.usersymbols:
     * <b>symbolTable</b>
     *
     * Supported elements: <b>staffGrp</b>
     *
     * @param {XMLElement} element the scoreDef element to process
     */
    processScoreDef_child : function (element) {
      var me = this;
      switch (element.localName) {
        case 'staffGrp' :
          me.processStaffGrp(element);
          break;
        case 'pgHead' :
          break;
        default :
          Logger.info('SystemInfo.processScoreDef_child()', 'Element <' + element.localName +
                                                                   '> is not supported in <scoreDef>. Skipping.');
      }
    },


    /**
     *
     * @param {XMLElement} staffGrp
     * @param {Boolean} isChild specifies if the staffGrp is a child of another
     *            staffGrp (auto staff connectors only get attached
     *            to the outermost staffGrp elements)
     * @return {Object} the range of the current staff group. Properties:
     *         first_n, last_n
     */
    processStaffGrp : function (staffGrp, isChild, ancestorSymbols) {
      var me = this, range = {}, isFirst = true;
      $(staffGrp).children().each(function (i, childElement) {
        var childRange = me.processStaffGrp_child(staffGrp, childElement, ancestorSymbols);
        if (childRange) {
          Logger.debug('Converter.processStaffGrp() {1}.{a}', 'childRange.first_n: ' +
                                                                     childRange.first_n, ' childRange.last_n: ' +
                                                                                         childRange.last_n);
          if (isFirst) range.first_n = childRange.first_n;
          range.last_n = childRange.last_n;
          isFirst = false;
        }
      });
      me.setConnectorModels(staffGrp, range, isChild, ancestorSymbols);
      return range;
    },

    /**
     * MEI element <b>staffGrp</b> may contain (MEI v2.1.0): MEI.cmn: meterSig
     * meterSigGrp MEI.mensural: mensur proport MEI.midi: instrDef
     * MEI.shared: clef clefGrp keySig label layerDef
     *
     * Supported elements: <b>staffGrp</b> <b>staffDef</b>
     *
     * @param {XMLElement} parent
     * @param {XMLElement} element
     * @return {Object} the range of staffs. Properties: first_n, last_n
     */
    processStaffGrp_child : function (parent, element, ancestorSymbols) {
      var me = this, staff_n, myAncestorSymbols;
      switch (element.localName) {
        case 'staffDef' :
          staff_n = me.processStaffDef(element);
          return {
            first_n : staff_n,
            last_n : staff_n
          };
        case 'staffGrp' :
          myAncestorSymbols =
          (!ancestorSymbols) ? [parent.getAttribute('symbol')] : ancestorSymbols.concat(parent.getAttribute('symbol'));
          return me.processStaffGrp(element, true, myAncestorSymbols);
        default :
          Logger.info('SystemInfo.processScoreDef_child()', 'Element <' + element.localName +
                                                                   '> is not supported in <staffGrp>. Skipping.');
      }
    },

    /**
     * reads a staffDef, writes it to currentStaveInfos
     *
     * @param {XMLElement} staffDef
     * @return {Number} the staff number of the staffDef
     */
    processStaffDef : function (staffDef) {
      var me = this, staff_n, staff_info;
      staff_n = +$(staffDef).attr('n');
      staff_info = me.currentStaveInfos[staff_n];
      if (staff_info) {
        staff_info.updateDef(staffDef, me.scoreDefElement);
      } else {
        me.currentStaveInfos[staff_n] = new StaveInfo(staffDef, me.scoreDefElement, true, true, true);
      }
      return staff_n;
    }
  };

  return SystemInfo;

});
