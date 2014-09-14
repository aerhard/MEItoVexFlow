/*
 * StaffInfo.js Author: Zoltan Komives (zolaemil@gmail.com) Created: 03.07.2013
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

var MEI2VF = ( function (m2v, MeiLib, VF, $, undefined) {

  /**
   * @class MEI2VF.StaffInfo
   * Contains the definition and the rendering information (i.e. what
   * clef modifiers are to be rendered) of a single staff
   * @private
   *
   * @constructor
   * @param staffdef
   * @param scoredef
   * @param w_clef
   * @param w_keysig
   * @param w_timesig
   */
  m2v.StaffInfo = function (staffdef, scoredef, w_clef, w_keysig, w_timesig) {
    var me = this;
    /**
     * @private
     */
    me.scoreDef = scoredef;
    /**
     * @private
     */
    me.staffDef = staffdef;
    /**
     * @private
     */
    me.renderWith = {
      clef : w_clef,
      keysig : w_keysig,
      timesig : w_timesig
    };
    /**
     * @private
     */
    me.keySpec = 'C'; // default key
    /**
     * @private
     */
    me.meter = null;
    /**
     * @private
     */
    me.labels = null;
    /**
     * @private
     */
    me.spacing = null;
    /**
     * @private
     */
    me.clef = null;

    me.updateKeySpec();
    me.updateMeter();
    me.updateLabels();
    me.updateSpacing();
    me.updateClef(me.staffDef);
  };

  m2v.StaffInfo.prototype = {

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
    updateMeter : function () {
      var me = this, meter;
      if (me.staffDef.hasAttribute('meter.count') && me.staffDef.hasAttribute('meter.unit')) {
        me.meter = {
          count : +me.staffDef.getAttribute('meter.count'),
          unit : +me.staffDef.getAttribute('meter.unit'),
          sym : me.staffDef.getAttribute('meter.sym')
        };
      } else if (me.scoreDef.hasAttribute('meter.count') && me.scoreDef.hasAttribute('meter.unit')) {
        me.meter = {
          count : +me.scoreDef.getAttribute('meter.count'),
          unit : +me.scoreDef.getAttribute('meter.unit'),
          sym : me.scoreDef.getAttribute('meter.sym')
        };
      }
    },

    /**
     * @private
     */
    updateKeySpec : function () {
      var me = this;
      if (me.staffDef.hasAttribute('key.pname')) {
        me.keySpec = me.convertKeySpec(me.staffDef);
      }
      if (me.scoreDef.hasAttribute('key.pname')) {
        me.keySpec = me.convertKeySpec(me.scoreDef);
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
     * @returns {number|*|m2v.StaffInfo.spacing}
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
     * @param newClefDef
     * @returns {*|m2v.StaffInfo.currentClef}
     */
    clefChangeInMeasure : function (clefElement) {
      var me = this;
      if (!me.initialClefCopy) {
        me.initialClefCopy = {
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
      if (me.initialClefCopy) {
        me.clef = me.initialClefCopy;
      }
    },

    /**
     * @public
     */
    removeInitialClefCopy : function () {
      this.initialClefCopy = null;
    },

    /**
     * @private
     * @param element
     * @returns {*}
     */
    updateClef : function (element) {
      var me = this, clefShape, clefDis, clefDisPlace, clefType, prefix;

      prefix = (element.localName === 'clef') ? '' : 'clef.';

      clefShape = element.getAttribute(prefix + 'shape');
      if (!clefShape) {
        m2v.L('warn', '@clef.shape expected', 'No clef shape attribute found in ' + m2v.Util.serializeElement(element) +
                                              '. Setting default clef.shape "G".');
        clefShape = 'G';
      }
      clefType = clefShape + (element.getAttribute(prefix + 'line') || '');
      clefDis = element.getAttribute(prefix + 'dis');
      clefDisPlace = element.getAttribute(prefix + 'dis.place');

      var type = me.clefTypeMap[clefType];
      if (type) {
        if (clefDis === '8' && clefDisPlace === 'below') {
          me.clef = {type : type, shift : -1};
        } else {
          me.clef = {type : type};
        }
      } else {
        me.clef = {type : 'treble'};
        m2v.L('warn', 'Not supported', 'Clef definition in ' + m2v.Util.serializeElement(element) +
                                       ' is not supported. Setting default treble clef.');
      }
    },

    /**
     * @public
     * @returns {*|m2v.StaffInfo.currentClef}
     */
    getClef : function () {
      return this.clef;
    },

    /**
     * @public
     * @returns {*|m2v.StaffInfo.keySpec}
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
      var me = this, keyname, key_accid, key_mode;
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
            m2v.L('warn', 'Not supported', 'expected to find value "s" or "f" instead of "' + key_accid +
                                           '" in @key.accid of ' + m2v.Util.serializeElement(element) +
                                           '. Skipping processing of this attribute.');
        }
      }
      key_mode = element.getAttribute('key.mode');
      if (key_mode !== null) {
        keyname += (key_mode === 'major') ? '' : 'm';
      }
      return keyname;
    },


    /**
     * gets the vexFlow time signature from an MEI staffDef element
     * @public
     * @return {String} the vexFlow time signature or undefined
     */
    getTimeSig : function () {
      var me = this, symbol, count, unit;
      symbol = me.meter.sym;
      if (symbol) {
        return (symbol === 'cut') ? 'C|' : 'C';
      }
      count = me.meter.count;
      unit = me.meter.unit;
      return (count && unit) ? count + '/' + unit : undefined;
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
      me.updateMeter();
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
        me.meter = {
          count : +me.scoreDef.getAttribute('meter.count'),
          unit : +me.scoreDef.getAttribute('meter.unit'),
          sym : me.scoreDef.getAttribute('meter.sym')
        };
        me.renderWith.timesig = true;
      }
    }

  };

  return m2v;

}(MEI2VF || {}, MeiLib, Vex.Flow, jQuery));
