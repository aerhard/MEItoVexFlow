/*
 * MEItoVexFlow, Dynamics class
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
   * @class Dynamics
   * @extend EventPointerCollection
   * @private
   *
   * @constructor
   */
  var Dynamics = function (systemInfo, font) {
    this.init(systemInfo, font);
  };

  Vex.Inherit(Dynamics, EventPointerCollection, {

    init : function (systemInfo, font) {
      Dynamics.superclass.init.call(this, systemInfo, font);
    },

    addToNote : function(model, note) {
      var me = this, annot =
      (new VF.Annotation(Util.getText(model.element).trim())).setFont(me.font.family, me.font.size, me.font.weight).setMeiElement(model.element);

      // TEMPORARY: set width of modifier to zero so voices with modifiers
      // don't get too much width; remove when the width calculation in
      // VexFlow does distinguish between different y values when
      // calculating the width of tickables
      annot.setWidth(0);
      if (model.atts.place === 'above') {
        note.vexNote.addAnnotation(0, annot);
      } else {
        note.vexNote.addAnnotation(0, annot.setVerticalJustification(me.BOTTOM));
      }
    }

  });

  return Dynamics;

});
