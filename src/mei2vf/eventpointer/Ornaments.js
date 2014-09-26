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
  'common/Util',
  'mei2vf/Tables',
  'mei2vf/eventpointer/EventPointerCollection'
], function (VF, Vex, Logger, Util, Tables, EventPointerCollection) {

  /**
   * @class MEI2VF.Ornaments
   * @extend MEI2VF.PointerCollection
   * @private
   *
   * @constructor
   */
  var Ornaments = function (systemInfo, font) {
    this.init(systemInfo, font);
  };

  Vex.Inherit(Ornaments, EventPointerCollection, {

    init : function (systemInfo, font) {
      Ornaments.superclass.init.call(this, systemInfo, font);
    },

    createVexFromInfos : function (notes_by_id) {
      var me = this, i, model, note;
      i = me.allModels.length;
      while (i--) {
        model = me.allModels[i];
        note = notes_by_id[model.startid];
        if (note) {
          me.addOrnamentToNote(note.vexNote, model);
        } else {
          console.log(model);
          Logger.warn('Unknown reference', Util.serializeElement(model.element) +
                                            ' could not be rendered because the reference "' + model.startid +
                                            '" could not be resolved.');
        }
      }
    },

    /**
     * adds an ornament to a note-like object
     * @method addOrnamentToNote
     * @param {Vex.Flow.StaveNote} note the note-like VexFlow object
     * @param {Object} model the data model
     * @param {Number} index The index of the note in a chord (optional)
     */
    addOrnamentToNote : function (note, model, index) {
      var atts = model.atts;
      // TODO support @tstamp2 etc -> make Link instead of Pointer

      var vexOrnament = new VF.Ornament("tr");

      if (atts.accidupper) {
        vexOrnament.setUpperAccidental(Tables.accidentals[atts.accidupper]);
      }
      if (atts.accidlower) {
        vexOrnament.setLowerAccidental(Tables.accidentals[atts.accidlower]);
      }

      // TODO support position below
      //      vexOrnament.setPosition(Tables.positions[model.atts.place]);
      vexOrnament.setPosition(VF.Modifier.Position.ABOVE);

      note.addModifier(index || 0, vexOrnament);
    }
  });


  return Ornaments;

});
