/*
 * MEItoVexFlow, Directives class
 * (based on meitovexflow.js)
 * Author of reworkings: Alexander Erhard
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
  'vex',
  'common/Logger',
  'common/Util',
  'mei2vf/Tables',
  'mei2vf/eventpointer/EventPointerCollection'
], function (VF, Vex, Logger, Util, Tables, EventPointerCollection) {

  /**
   * @class MEI2VF.Directives
   * @extend MEI2VF.EventPointerCollection
   * @private
   *
   * @constructor
   */
  var Directives = function (systemInfo, font) {
    this.init(systemInfo, font);
  };

  Vex.Inherit(Directives, EventPointerCollection, {

    init : function (systemInfo, font) {
      Directives.superclass.init.call(this, systemInfo, font);
    },

    addToNote : function (model, note) {
      var me = this, annot, rend, font, rendAtts;

      font = {
        family: me.font.family,
        size: me.font.size,
        weight: ''
      };

      rend = model.element.getElementsByTagName('rend')[0];
      if (rend) {
        rendAtts = Util.attsToObj(rend);
        if (rendAtts.fontfamily) font.family = rendAtts.fontfamily;
        if (rendAtts.fontweight) font.weight += rendAtts.fontweight + ' ';
        if (rendAtts.fontstyle) font.weight += rendAtts.fontstyle;
        if (rendAtts.fontsize) font.size = +rendAtts.fontsize * 1.5;
      }

      annot = (new VF.Annotation(Util.getNormalizedText(model.element).trim())).setFont(font.family, font.size, font.weight).setMeiElement(model.element);

      // TEMPORARY: set width of modifier to zero so voices with modifiers
      // don't get too much width; remove when the width calculation in
      // VexFlow does distinguish between different y values when
      // calculating the width of tickables
      annot.setWidth(0);
      annot.setJustification(1); // left by default
      if (model.atts.place === 'below') {
        note.vexNote.addAnnotation(0, annot.setVerticalJustification(me.BOTTOM));
      } else {
        note.vexNote.addAnnotation(0, annot);
      }
    }

  });

  return Directives;

});
