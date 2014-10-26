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
  'common/Util',
  'common/Logger',
  'common/RuntimeError',
  'mei2vf/stave/StaveInfo'
], function (Util, Logger, RuntimeError, StaveInfo) {

  /**
   * @class MEI2VF.SystemInfo
   * Deals with MEI data provided by scoreDef, staffDef and staffGrp elements and its children
   * @private
   *
   * @constructor

   */
  var SystemInfo = function () {
  };

  SystemInfo.prototype = {

    STAVE_HEIGHT : 40,

    init : function (cfg) {
      var me = this;
      me.cfg = cfg;

      /**
       * contains the current {@link MEI2VF.StaveInfo} objects
       */
      me.currentStaveInfos = [];
      /**
       * @property {Number} systemLeftMar the left margin of the
       * current system (additional to the left print space margin)
       */
      me.systemLeftMar = null;
      /**
       * @property {Number} currentLowestY the lowest Y coordinate of the
       * previously processed staves
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

    /**
     * @method
     */
    setConnectorModels : function (staffGrp, range, isChild, ancestorSymbols) {
      var me = this, symbol, barthru, first_n, last_n;

      var setModelForStaveRange = function (target, obj, add) {
        add = add || '';
        target[obj.top_stave_n + ':' + obj.bottom_stave_n + add] = obj;
      };

      first_n = range.first_n;
      last_n = range.last_n;
      symbol = staffGrp.getAttribute('symbol');

      Logger.debug('Converter.setConnectorModels() {2}', 'symbol: ' + symbol, ' range.first_n: ' +
                                                                              first_n, ' range.last_n: ' + last_n);

      // 1. left connectors specified in the MEI file:
      setModelForStaveRange(me.startConnectorInfos, {
        top_stave_n : first_n,
        bottom_stave_n : last_n,
        symbol : symbol || 'line',
        label : staffGrp.getAttribute('label'),
        labelAbbr : staffGrp.getAttribute('label.abbr'),
        ancestorSymbols : ancestorSymbols
      });

      // 2. left auto line, only (if at all) attached to
      // //staffGrp[not(ancestor::staffGrp)]
      if (!isChild && me.cfg.autoStaveConnectorLine) {
        setModelForStaveRange(me.startConnectorInfos, {
          top_stave_n : first_n,
          bottom_stave_n : last_n,
          symbol : (symbol === 'none') ? 'none' : 'line'
        }, 'autoline');
      }

      // 3. inline connectors
      if (staffGrp.getAttribute('barthru') === 'true') {
        setModelForStaveRange(me.inlineConnectorInfos, {
          top_stave_n : first_n,
          bottom_stave_n : last_n,
          symbol : 'singleright' // default
        });
      }
    },

    getStaveInfo : function (stave_n) {
      return this.currentStaveInfos[stave_n];
    },

    getAllStaveInfos : function () {
      return this.currentStaveInfos;
    },


    /**
     * @method getStaveLabels
     */
    getStaveLabels : function (currentSystem_n) {
      var me = this, labels, i, infos, labelType;
      labels = {};
      if (!me.cfg.labelMode) {
        return labels;
      }
      labelType = (me.cfg.labelMode === 'full' && currentSystem_n === 0) ? 'label' : 'labelAbbr';
      infos = me.getAllStaveInfos();
      i = infos.length;
      while (i--) {
        if (infos[i]) {
          labels[i] = infos[i][labelType];
        }
      }
      return labels;
    },

    getVerseConfig : function () {
      var me = this;
      return {
        font : me.cfg.lyricsFont, maxHyphenDistance : me.cfg.maxHyphenDistance
      };
    },

    /**
     * @method
     */
    getClef : function (stave_n) {
      var me = this, staveInfo;
      staveInfo = me.currentStaveInfos[stave_n];
      if (!staveInfo) {
        throw new RuntimeError('No staff definition for staff n="' + stave_n + '"');
      }
      return staveInfo.getClef();
    },

    getCurrentLowestY : function () {
      return this.currentLowestY;
    },

    setCurrentLowestY : function (y) {
      this.currentLowestY = y;
    },

    getYs : function (currentSystemY) {
      var me = this, currentStaveY, i, j, isFirstStave = true, infoSpacing, lowestYCandidate, ys = [];
      currentStaveY = 0;
      for (i = 1, j = me.currentStaveInfos.length; i < j; i += 1) {
        if (me.currentStaveInfos[i]) {
          infoSpacing = me.currentStaveInfos[i].spacing;
          currentStaveY += (isFirstStave) ? 0 :
                           (infoSpacing !== null) ? me.STAVE_HEIGHT + me.currentStaveInfos[i].spacing :
                           me.STAVE_HEIGHT + me.cfg.staveSpacing;
          ys[i] = currentSystemY + currentStaveY;
          isFirstStave = false;
        }
      }
      lowestYCandidate = currentSystemY + currentStaveY + me.STAVE_HEIGHT;
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
      systemLeftmar = parseFloat(me.scoreDefElement.getAttribute('system.leftmar'));
      if (!isNaN(systemLeftmar)) {
        me.setLeftMar(systemLeftmar);
      }
      children = me.scoreDefElement.childNodes;

      for (i = 0, j = children.length; i < j; i += 1) {
        if (children[i].nodeType === 1) {
          me.processScoreDef_child(children[i]);
        }
      }

      me.updateStaffDefs(scoredef);

    },

    /**
     * process scoreDef in all system which didn't get updated by a staffDef child of the current scoreDef
     * @param scoredef
     */
    updateStaffDefs : function (scoredef) {
      var me = this, i = me.currentStaveInfos.length;
      while (i--) {
        if (me.currentStaveInfos[i] && me.currentStaveInfos[i].getCurrentScoreDef() !== scoredef) {
          me.currentStaveInfos[i].updateDef(null, scoredef);
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
     * @param {Element} element the scoreDef element to process
     */
    processScoreDef_child : function (element) {
      var me = this;
      switch (element.localName) {
        case 'staffGrp' :
          me.processStaffGrp(element);
          break;
        case 'pgHead' :
          me.processPgHead(element);
          break;
        case 'pgFoot' :
          me.processPgFoot(element);
          break;
        default :
          Logger.info('Not supported', 'Element <' + element.localName +
                                       '> is not supported in <scoreDef>. Ignoring element.');
      }
    },

    processPgHead : function (element) {
      Logger.info('Not supported', 'Element <' + element.localName +
                                   '> is not supported in <scoreDef>. Ignoring element.');
    },

    processPgFoot : function (element) {
      Logger.info('Not supported', 'Element <' + element.localName +
                                   '> is not supported in <scoreDef>. Ignoring element.');
    },

    /**
     *
     * @param {Element} staffGrp
     * @param {Boolean} isChild specifies if the staffGrp is a child of another
     *            staffGrp (auto staff connectors only get attached
     *            to the outermost staffGrp elements)
     * @param {Object} ancestorSymbols
     * @return {Object} the range of the current staff group. Properties:
     *         first_n, last_n
     */
    processStaffGrp : function (staffGrp, isChild, ancestorSymbols) {
      var me = this, range = {}, isFirst = true, children, i, j, childRange;
      children = staffGrp.childNodes;
      for (i = 0, j = children.length; i < j; i++) {
        if (children[i].nodeType === 1) {
          childRange = me.processStaffGrp_child(staffGrp, children[i], ancestorSymbols);
          if (childRange) {
            Logger.debug('Converter.processStaffGrp() {1}.{a}', 'childRange.first_n: ' +
                                                                childRange.first_n, ' childRange.last_n: ' +
                                                                                    childRange.last_n);
            if (isFirst) range.first_n = childRange.first_n;
            range.last_n = childRange.last_n;
            isFirst = false;
          }
        }

      }
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
     * @param {Element} parent
     * @param {Element} element
     * @param {Object} ancestorSymbols
     * @return {Object} the range of staves. Properties: first_n, last_n
     */
    processStaffGrp_child : function (parent, element, ancestorSymbols) {
      var me = this, stave_n, myAncestorSymbols;
      switch (element.localName) {
        case 'staffDef' :
          stave_n = me.processStaffDef(element, me.scoreDefElement);
          return {
            first_n : stave_n,
            last_n : stave_n
          };
        case 'staffGrp' :
          myAncestorSymbols =
          (!ancestorSymbols) ? [parent.getAttribute('symbol')] : ancestorSymbols.concat(parent.getAttribute('symbol'));
          return me.processStaffGrp(element, true, myAncestorSymbols);
        default :
          Logger.info('Not supported', 'Element <' + element.localName +
                                       '> is not supported in <staffGrp>. Ignoring element.');
      }
    },

    /**
     * reads a staffDef, writes it to currentStaveInfos
     *
     * @param {Element} element
     * @param {Element} scoreDef
     * @return {Number} the staff number of the staffDef
     */
    processStaffDef : function (element, scoreDef) {
      var me = this, stave_n, staveInfo;
      stave_n = parseInt(element.getAttribute('n'), 10);
      if (!isNaN(stave_n)) {
        staveInfo = me.currentStaveInfos[stave_n];
        if (staveInfo) {
          staveInfo.updateDef(element, scoreDef);
        } else {
          me.currentStaveInfos[stave_n] = new StaveInfo(element, scoreDef, true, true, true);
        }
        return stave_n;
      } else {
        throw new RuntimeError(Util.serializeElement(element) + ' must have an @n attribute of type integer.');
      }
    }
  };

  return SystemInfo;

});
