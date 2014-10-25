/*
 * MEItoVexFlow, Hairpins class
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
  'common/RuntimeError',
  'mei2vf/Tables',
  'mei2vf/eventspan/SpanCollection'
], function (VF, Vex, Logger, RuntimeError, Tables, SpanCollection, undefined) {

  /**
   * @class BeamCollection
   * @extend SpanCollection
   * @private
   *
   * @constructor
   */
  var BeamCollection = function () {
    this.init();
  };

  Vex.Inherit(BeamCollection, SpanCollection, {

    init : function () {
      BeamCollection.superclass.init.call(this);
    },

    resolveSpanElements : function (notes_by_id) {
      var me = this;
      var spanObjectCreator = function (notes) {
        me.vexObjects.push(new VF.Beam(notes, false));
      };
      me.resolveSpans(me.spanElements, spanObjectCreator, null, notes_by_id);
    }

  });


  return BeamCollection;

});
