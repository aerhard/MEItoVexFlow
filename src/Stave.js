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
var MEI2VF = ( function (m2v, MeiLib, VF, $, undefined) {

  m2v.Stave = function () {
    this.init();
    this.objType = 'stave';
  };

  Vex.Inherit(m2v.Stave, VF.Stave, {

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
      me.addModifier(new Vex.Flow.KeySignature(keySpec.key, padding));

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
    }

  });


  return m2v;

}(MEI2VF || {}, MeiLib, Vex.Flow, jQuery));

