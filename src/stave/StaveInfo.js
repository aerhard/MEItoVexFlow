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
 * Contributors and reworking: Alexander Erhard, @davethehat
 */
define([
  'vexflow',
  'mei2vf/core/Logger',
  'mei2vf/core/Util'
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
     * the most current scoreDef element.
     * @private
     */
    me.scoreDef = scoreDef;
    /**
     * the most current staffDef element
     * @private
     */
    me.staffDef = staffDef;
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
    me.keySpec = {key : 'C'}; // default key
    /**
     * the currently valid timeSpec
     * @private
     */
    me.timeSpec = null;
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
    me.clef = null;
    /**
     * a copy of the start clef of a measure-stave; used when there are clef changes in multi-voice staves
     */
    me.startClefCopy = null;

    me.updateKeySpec();
    me.updateTimeSpec();
    me.updateLabels();
    me.updateSpacing();
    me.updateClef(me.staffDef);
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

    /**
     * @private
     */
    updateTimeSpec : function () {
      var me = this;
      if (me.staffDef.hasAttribute('meter.count') && me.staffDef.hasAttribute('meter.unit')) {
        me.timeSpec = {
          count : +me.staffDef.getAttribute('meter.count'),
          unit : +me.staffDef.getAttribute('meter.unit'),
          sym : me.staffDef.getAttribute('meter.sym'),
          meiElement : me.staffDef
        };
      } else if (me.scoreDef.hasAttribute('meter.count') && me.scoreDef.hasAttribute('meter.unit')) {
        me.timeSpec = {
          count : +me.scoreDef.getAttribute('meter.count'),
          unit : +me.scoreDef.getAttribute('meter.unit'),
          sym : me.scoreDef.getAttribute('meter.sym'),
          meiElement : me.scoreDef
        };
      }
    },

    /**
     * @private
     */
    updateKeySpec : function () {
      var me = this;
      if (me.staffDef.hasAttribute('key.pname')) {
        me.keySpec = {
          key : me.convertKeySpec(me.staffDef),
          meiElement : me.staffDef
        };
      } else if (me.scoreDef.hasAttribute('key.pname')) {
        me.keySpec = {
          key : me.convertKeySpec(me.scoreDef),
          meiElement : me.scoreDef
        };
      }
    },

    /**
     * @private
     */
    updateLabels : function () {
      var me = this, label, labelAbbr;
      label = me.staffDef.getAttribute('label');
      if (typeof label === 'string') {
        me.label = label;
      }
      labelAbbr = me.staffDef.getAttribute('label.abbr');
      if (typeof labelAbbr === 'string') {
        me.labelAbbr = labelAbbr;
      }
    },

    /**
     * @private
     */
    updateSpacing : function () {
      var me = this, spacing;
      spacing = me.staffDef.getAttribute('spacing');
      if (spacing !== null && !isNaN(spacing)) {
        me.spacing = +spacing;
      }
      return me.spacing;
    },

    /**
     * @public
     */
    forceSectionStartInfo : function () {
      var me = this;
      me.renderWith.clef = true;
      me.renderWith.keysig = true;
      me.renderWith.timesig = true;
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
      if (me.renderWith.clef && me.staffDef.getAttribute('clef.visible') !== 'false') {
        me.renderWith.clef = false;
        return true;
      }
    },

    /**
     * @public
     */
    showKeysigCheck : function () {
      var me = this;
      if (me.renderWith.keysig) {
        me.renderWith.keysig = false;
        if (me.staffDef.getAttribute('key.sig.show') === 'true' ||
            me.scoreDef.getAttribute('key.sig.show') !== 'false') {
          return true;
        }
      }
    },

    /**
     * @public
     */
    showTimesigCheck : function () {
      var me = this;
      if (me.renderWith.timesig) {
        me.renderWith.timesig = false;
        if (me.staffDef.getAttribute('meter.rend') === 'norm' || me.scoreDef.getAttribute('meter.rend') !== 'invis') {
          return true;
        }
      }
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
     * @public
     */
    checkInitialClef : function () {
      var me = this;
      if (me.startClefCopy) {
        me.clef = me.startClefCopy;
      }
    },

    /**
     * @public
     */
    removeStartClefCopy : function () {
      this.startClefCopy = null;
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
        Logger.warn('@clef.shape expected', 'No clef shape attribute found in ' +
                                                   Util.serializeElement(element) +
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

    getTimeSpec : function () {
      return this.timeSpec;
    },

    /**
     * @private
     * @param newStaffDef
     */
    updateRenderWith : function (newStaffDef) {
      var me = this, result, hasEqualAtt;

      result = {
        clef : false,
        keysig : false,
        timesig : false
      };

      // if (Object.keys(newStaffDef).length === 0) {
      // return result;
      // }

      hasEqualAtt = function (attr_name) {
        return me.staffDef.getAttribute(attr_name) === newStaffDef.getAttribute(attr_name);
      };

      if (!hasEqualAtt('clef.shape') || !hasEqualAtt('clef.line')) {
        result.clef = true;
      }
      if ((!hasEqualAtt('key.pname') || !hasEqualAtt('key.accid') || !hasEqualAtt('key.mode'))) {
        result.keysig = true;
      }
      if (!hasEqualAtt('meter.count') || !hasEqualAtt('meter.unit')) {
        result.timesig = true;
      }

      me.renderWith = result;
    },

    /**
     * @public
     * @param staffDef
     * @param scoreDef
     */
    updateDef : function (staffDef, scoreDef) {
      var me = this;
      me.updateRenderWith(staffDef);
      me.staffDef = staffDef;
      me.scoreDef = scoreDef;
      me.updateKeySpec();
      me.updateTimeSpec();
      me.updateLabels();
      me.updateSpacing();
      if (staffDef.hasAttribute('clef.shape')) {
        me.updateClef(staffDef);
      }
    },

    /**
     * @public
     * @param scoreDef
     */
    overrideWithScoreDef : function (scoreDef) {
      var me = this;

      me.scoreDef = scoreDef;

      if (me.scoreDef.hasAttribute('meter.count') && me.scoreDef.hasAttribute('meter.unit')) {
        me.timeSpec = {
          count : +me.scoreDef.getAttribute('meter.count'),
          unit : +me.scoreDef.getAttribute('meter.unit'),
          sym : me.scoreDef.getAttribute('meter.sym'),
          meiElement : scoreDef
        };
        me.renderWith.timesig = true;
      }
    }
  };

  return StaveInfo;

});
