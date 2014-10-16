/*
 * StaveInfo.js Author: Zoltan Komives (zolaemil@gmail.com) Created: 03.07.2013
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
 * Contributors and additions: Alexander Erhard, @davethehat
 */

define([
  'vexflow',
  'common/Logger',
  'common/Util'
], function (VF, Logger, Util) {

  /**
   * @class MEI2VF.StaveInfo
   * Contains the definition and the rendering information (i.e. what
   * clef modifiers are to be rendered) of a single staff
   * @private
   *
   * @constructor
   * @param staffDef
   * @param scoreDef
   * @param w_clef
   * @param w_keysig
   * @param w_timesig
   */
  var StaveInfo = function (staffDef, scoreDef, w_clef, w_keysig, w_timesig) {
    var me = this;
    /**
     * @private
     */
    me.renderWith = {
      clef : w_clef,
      keysig : w_keysig,
      timesig : w_timesig
    };
    /**
     * the currently valid keySpec
     * @private
     */
    me.keySpec = {key : 'C', meiElement : staffDef}; // default key
    /**
     * the currently valid timeSpec
     * @private
     */
    me.timeSpec = {};
    /**
     * the currently valid staff labels
     * @private
     */
    me.labels = null;
    /**
     * the currently valid stave spacing
     * @private
     */
    me.spacing = null;
    /**
     * the currently valid clef
     * @private
     */
    me.clef = {};
    /**
     * a copy of the start clef of a measure-stave; used when there are clef changes in multi-voice staves
     */
    me.startClefCopy = null;

    me.updateDef(staffDef, scoreDef, true);
  };

  StaveInfo.prototype = {

    /**
     * @private
     */
    clefTypeMap : {
      G : 'treble',
      G1 : 'french',
      G2 : 'treble',
      F3 : 'baritone-f',
      F4 : 'bass',
      F5 : 'subbass',
      C1 : 'soprano',
      C2 : 'mezzo-soprano',
      C3 : 'alto',
      C4 : 'tenor',
      C5 : 'baritone-c',
      perc : 'percussion'
    },

    getCurrentScoreDef : function () {
      return this.currentScoreDef;
    },

    /**
     * @public
     * @param staffDef
     * @param scoreDef
     */
    updateDef : function (staffDef, scoreDef, skipRenderWith) {
      var me = this, clefDefiningElement, timeSigDefiningElement, keySigDefiningElement;

      me.currentScoreDef = scoreDef;

      var getDefiningElement = function (element1, element2, att) {
        if (element1 && element1.hasAttribute(att)) {
          return element1;
        }
        if (element2 && element2.hasAttribute(att)) {
          return element2;
        }
      };

      clefDefiningElement = getDefiningElement(staffDef, scoreDef, 'clef.shape');
      keySigDefiningElement = getDefiningElement(staffDef, scoreDef, 'key.pname');
      timeSigDefiningElement = getDefiningElement(staffDef, scoreDef, 'meter.count');

      if (!skipRenderWith) {
        me.updateRenderWith(clefDefiningElement, keySigDefiningElement, timeSigDefiningElement);
      }

      if (clefDefiningElement) me.updateClef(clefDefiningElement);
      if (keySigDefiningElement) me.updateKeySpec(keySigDefiningElement);
      if (timeSigDefiningElement) me.updateTimeSpec(timeSigDefiningElement);

      // TODO currently, labels and spacing are only read from <staffDef>
      if (staffDef) {
        me.updateLabels(staffDef);
        me.updateSpacing(staffDef);
      }

    },

    /**
     * updated the definition from a <scoreDef> only if the <scoreDef> hasn't been processed yet with a <staffDef>
     * @param scoreDef
     */
    updateIfNew : function (scoreDef) {
      var me = this;
      if (scoreDef !== me.currentScoreDef) {
        me.updateDef(null, scoreDef);
      }
    },

    /**
     * @private
     * @param newStaffDef
     */
    updateRenderWith : function (clefDefiningElement, keySigDefiningElement, timeSigDefiningElement) {
      var me = this, result, hasEqualAtt;

      result = {
        clef : false,
        keysig : false,
        timesig : false
      };

      hasEqualAtt = function (currentElement, newElement, attr_name) {
        return currentElement.getAttribute(attr_name) === newElement.getAttribute(attr_name);
      };

      var hasEqualClefAtt = function (currentElement, newElement, currentPrefix, newPrefix, attr_name) {
        return currentElement.getAttribute(currentPrefix + attr_name) === newElement.getAttribute(newPrefix + attr_name);
      };

      var currentClefElement = me.clef.meiElement;
      var currentKeySigElement = me.keySpec.meiElement;
      var currentTimeSigElement = me.timeSpec.meiElement;

      if (clefDefiningElement) {
        var currentPrefix = (currentClefElement.localName === 'clef') ? '' : 'clef.';
        var newPrefix = (clefDefiningElement.localName === 'clef') ? '' : 'clef.';
        if (!hasEqualClefAtt(currentClefElement, clefDefiningElement, currentPrefix, newPrefix, 'shape') ||
            !hasEqualClefAtt(currentClefElement, clefDefiningElement, currentPrefix, newPrefix, 'line')) {
          result.clef = true;
        }
      }

      if (keySigDefiningElement && (!hasEqualAtt(currentKeySigElement, keySigDefiningElement, 'key.pname') ||
                                    !hasEqualAtt(currentKeySigElement, keySigDefiningElement, 'key.accid') ||
                                    !hasEqualAtt(currentKeySigElement, keySigDefiningElement, 'key.mode'))) {
        result.keysig = true;
      }
      if (timeSigDefiningElement && (!hasEqualAtt(currentTimeSigElement, timeSigDefiningElement, 'meter.count') ||
                                     !hasEqualAtt(currentTimeSigElement, timeSigDefiningElement, 'meter.unit') ||
                                     !hasEqualAtt(currentTimeSigElement, timeSigDefiningElement, 'meter.sym'))) {
        result.timesig = true;
      }

      me.renderWith = result;
    },

    /**
     * @private
     */
    updateLabels : function (staffDef) {
      var me = this, label, labelAbbr;
      label = staffDef.getAttribute('label');
      if (typeof label === 'string') {
        me.label = label;
      }
      labelAbbr = staffDef.getAttribute('label.abbr');
      if (typeof labelAbbr === 'string') {
        me.labelAbbr = labelAbbr;
      }
    },

    /**
     * @private
     */
    updateSpacing : function (staffDef) {
      var me = this, spacing;
      spacing = staffDef.getAttribute('spacing');
      if (spacing !== null && !isNaN(spacing)) {
        me.spacing = +spacing;
      }
      return me.spacing;
    },

    /**
     * @private
     * @param element
     * @returns {*}
     */
    updateClef : function (element) {
      var me = this, clefShape, clefDis, clefDisPlace, clefType, prefix;

      // prefix for clef attribute names
      prefix = (element.localName === 'clef') ? '' : 'clef.';

      clefShape = element.getAttribute(prefix + 'shape');
      if (!clefShape) {
        Logger.warn('@clef.shape expected', 'No clef shape attribute found in ' + Util.serializeElement(element) +
                                            '. Setting default clef.shape "G".');
        clefShape = 'G';
      }
      clefType = clefShape + (element.getAttribute(prefix + 'line') || '');
      clefDis = element.getAttribute(prefix + 'dis');
      clefDisPlace = element.getAttribute(prefix + 'dis.place');

      var type = me.clefTypeMap[clefType];
      if (type) {
        if (clefDis === '8' && clefDisPlace === 'below') {
          me.clef = {
            type : type,
            shift : -1,
            meiElement : element
          };
        } else {
          me.clef = {
            type : type,
            meiElement : element
          };
        }
      } else {
        me.clef = {
          type : 'treble',
          meiElement : null
        };
        Logger.warn('Not supported', 'Clef definition in ' + Util.serializeElement(element) +
                                     ' is not supported. Setting default treble clef.');
      }
    },

    /**
     * @private
     */
    updateTimeSpec : function (element) {
      var me = this;
      me.timeSpec = {
        count : +element.getAttribute('meter.count'),
        unit : +element.getAttribute('meter.unit'),
        sym : element.getAttribute('meter.sym'),
        meiElement : element
      };
    },

    /**
     * @private
     */
    updateKeySpec : function (element) {
      var me = this;
      me.keySpec = {
        key : me.convertKeySpec(element),
        meiElement : element
      };
    },

    /**
     * @private
     * @param element
     * @returns {*}
     */
    convertKeySpec : function (element) {
      var keyname, key_accid, key_mode;
      keyname = element.getAttribute('key.pname').toUpperCase();
      key_accid = element.getAttribute('key.accid');
      if (key_accid !== null) {
        switch (key_accid) {
          case 's' :
            keyname += '#';
            break;
          case 'f' :
            keyname += 'b';
            break;
          default :
            Logger.warn('Not supported', 'expected to find value "s" or "f" instead of "' + key_accid +
                                         '" in @key.accid of ' + Util.serializeElement(element) +
                                         '. Ignoring processing of this attribute.');
        }
      }
      key_mode = element.getAttribute('key.mode');
      if (key_mode !== null) {
        keyname += (key_mode === 'major') ? '' : 'm';
      }
      return keyname;
    },


    /**
     * @public
     * @param clefElement
     */
    clefChangeInMeasure : function (clefElement) {
      var me = this;
      if (!me.startClefCopy) {
        me.startClefCopy = {
          type : me.clef.type,
          size : me.clef.size,
          shift : me.clef.shift
        };
      }
      me.updateClef(clefElement);
      return me.clef;
    },

    /**
     * called at the beginning of each layer. Sets the clef to the initial clef of the stave and saves
     * any existing clef to this.changedClef
     * @public
     */
    checkInitialClef : function () {
      var me = this;
      if (me.startClefCopy) {
        me.changedClef = me.clef;
        me.clef = me.startClefCopy;
      }
    },

    /**
     * called after the last layer. Removes this.startClefCopy and sets the current clef to the last
     * clef change
     * @public
     */
    finalizeClefInfo : function () {
      var me = this;
      if (me.changedClef) {
        me.clef = me.changedClef;
        me.changedClef = null;
      }
      me.startClefCopy = null;
    },

    /**
     * @public
     */
    forceSectionStartInfo : function () {
      this.renderWith = {
        clef: true,
        keysig:true,
        timesig: true
      }
    },

    /**
     * @public
     */
    forceStaveStartInfo : function () {
      var me = this;
      me.renderWith.clef = true;
      me.renderWith.keysig = true;
    },

    /**
     * @public
     */
    showClefCheck : function () {
      var me = this;
      if (me.renderWith.clef && me.clef.meiElement && me.clef.meiElement.getAttribute('clef.visible') !== 'false') {
        me.renderWith.clef = false;
        return true;
      }
    },

    /**
     * @public
     */
    showKeysigCheck : function () {
      var me = this;
      if (me.renderWith.keysig && me.keySpec.meiElement && me.keySpec.meiElement.getAttribute('key.sig.show') !== 'false') {
        me.renderWith.keysig = false;
        return true;
      }
    },

    /**
     * @public
     */
    showTimesigCheck : function () {
      var me = this;
      if (me.renderWith.timesig) {
        me.renderWith.timesig = false;
        if (me.timeSpec.meiElement && me.timeSpec.meiElement.getAttribute('meter.rend') !== 'invis') {
          return true;
        }
      }
    },

    /**
     * @public
     */
    getClef : function () {
      return this.clef;
    },

    /**
     * @public
     */
    getKeySpec : function () {
      return this.keySpec;
    },

    /**
     * @public
     */
    getTimeSpec : function () {
      return this.timeSpec;
    }

  };

  return StaveInfo;

});
