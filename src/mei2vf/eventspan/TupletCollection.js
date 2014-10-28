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
  'vex',
  'common/Logger',
  'common/RuntimeError',
  'mei2vf/Tables',
  'mei2vf/eventspan/SpanCollection'
], function (VF, Vex, Logger, RuntimeError, Tables, SpanCollection) {

  /**
   * @class TupletCollection
   * @extend SpanCollection
   * @private
   *
   * @constructor
   */
  var TupletCollection = function () {
    this.init();
  };

  Vex.Inherit(TupletCollection, SpanCollection, {

    init : function () {
      TupletCollection.superclass.init.call(this);
    },

    resolveSpanElements : function (notes_by_id) {
      var me = this;

      var fragmentPostProcessor = function (element, slice) {
        new VF.Tuplet(slice, {
          num_notes : parseInt(element.getAttribute('num'), 10) || 3,
          beats_occupied : parseInt(element.getAttribute('numbase'), 10) || 2
        })
      };

      me.resolveSpans(me.spanElements, fragmentPostProcessor, notes_by_id);
    },

    createVexObject : function (notes, voices, element) {
      var me=this, tickables, tuplet, voice, i, j;

      tuplet = new VF.Tuplet(notes, {
        num_notes : parseInt(element.getAttribute('num'), 10) || 3,
        beats_occupied : parseInt(element.getAttribute('numbase'), 10) || 2
      });

      if (element.getAttribute('num.format') === 'ratio') {
        tuplet.setRatioed(true);
      }

      tuplet.setBracketed(element.getAttribute('bracket.visible') === 'true');

      var bracketPlace = element.getAttribute('bracket.place');
      if (bracketPlace) {
        tuplet.setTupletLocation((bracketPlace === 'above') ? 1 : -1);
      }

      me.vexObjects.push(tuplet);

      // TODO make this more efficient
      for (i = 0, j = voices.length; i < j; i++) {
        voice = voices[i];
        tickables = voice.tickables;
        voice.ticksUsed = new Vex.Flow.Fraction(0, 1);
        voice.tickables = [];
        voice.addTickables(tickables);
      }

    }

  });


  return TupletCollection;

});
