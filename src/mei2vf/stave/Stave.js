/*
 * (C) Copyright 2014 Alexander Erhard (http://alexandererhard.com/).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {

  /**
   * Creates a new Stave object at the specified y coordinate. This
   * method sets fixed x coordinates, which will later be substituted in
   * {@link MEI2VF.System#format} - the Vex.Flow.Stave
   * objects must be initialized with some x measurements, but the real
   * values depend on values only available after modifiers, voices etc
   * have been added.
   *
   * @constructor
   * @param {Object} cfg
   */
  var Stave = function (cfg) {
    var me = this, leftBarline, rightBarline;

    me.init(0, cfg.y, 1000, {
      vertical_bar_width : 20, // 10 // Width around vertical bar end-marker
      top_text_position : 1.5, // 1 // in stave lines
      fill_style : me.lineColor
    });
    me.options.bottom_text_position = 6.5;

    me.setSystem(cfg.system);

    if (cfg.barlineInfo) {
      leftBarline = cfg.barlineInfo.leftBarline;
      rightBarline = cfg.barlineInfo.rightBarline;
    }

    if (leftBarline) {
      me.setBegBarType(me.barlines[leftBarline]);
      me.leftBarlineElement = cfg.barlineInfo.leftBarlineElement;
    } else {
      me.setBegBarType(me.barlines['invis']);
    }
    if (rightBarline) {
      me.setEndBarType(me.barlines[rightBarline]);
    }

  };

  Vex.Inherit(Stave, VF.Stave, {

    lineColor : '#999999',

    barlines : {
      'single' : VF.Barline.type.SINGLE,
      'dbl' : VF.Barline.type.DOUBLE,
      'end' : VF.Barline.type.END,
      'rptstart' : VF.Barline.type.REPEAT_BEGIN,
      'rptend' : VF.Barline.type.REPEAT_END,
      'rptboth' : VF.Barline.type.REPEAT_BOTH,
      'invis' : VF.Barline.type.NONE
    },

    addVoltaFromInfo : function (voltaInfo) {
      var begin = voltaInfo.hasOwnProperty('start');
      var end = voltaInfo.hasOwnProperty('end');
      if (begin) {
        this.setVoltaType((end) ? VF.Volta.type.BEGIN_END : VF.Volta.type.BEGIN, voltaInfo.start, 30);
      } else {
        this.setVoltaType((end) ? VF.Volta.type.END : VF.Volta.type.MID, "", 30);
      }
      // TODO [think through in which cases we actually need type.END]
      // 1) at the end of a composition
      // 2) if the current volta is followed by another volta (type.MID might be sufficient when
      // both volte are in the same system, but in cases where the first volta is at the end of
      // a system, it erroneously remains 'open'
    },

    // FIXME check if deviation of clef.shift between clef and end clef is OK
    addClefFromInfo : function (clef) {
      var me = this;
      me.addClef(clef.type, clef.size, clef.shift === -1 ? '8vb' : undefined);

      me.meiClefElement = clef.meiElement;
    },

    addEndClefFromInfo : function (clef) {
      var me = this;
      me.addEndClef(clef.type, 'small', clef.shift);

      me.meiEndClefElement = clef.meiElement;
    },

    addKeySpecFromInfo : function (keySpec, padding) {
      var me = this;
      me.addModifier(new VF.KeySignature(keySpec.key, padding));

      me.meiKeySpecElement = keySpec.meiElement;
    },

    addTimeSpecFromInfo : function (timeSpec, padding) {
      var me = this, symbol, count, unit, vexTimeSig;
      symbol = timeSpec.sym;
      if (symbol) {
        vexTimeSig = (symbol === 'cut') ? 'C|' : 'C';
      } else {
        count = timeSpec.count;
        unit = timeSpec.unit;
        vexTimeSig = (count && unit) ? count + '/' + unit : undefined;
      }
      me.addTimeSignature(vexTimeSig, padding);

      me.meiTimeSpecElement = timeSpec.meiElement;
    },

    hasTimeSig : function () {
      return typeof this.meiTimeSpecElement !== 'undefined';
    },

    setSystem : function (system) {
      this.system = system;
    },

    setSlurStartX : function (x) {
      this.slurStartX = x;
    },

    getSlurStartX : function () {
      return this.system.getSlurStartX();
    },

    setSlurEndX : function (x) {
      this.slurEndX = x;
    },

    getSlurEndX : function () {
      return this.system.getSlurEndX();
    }

  });

  return Stave;

});
