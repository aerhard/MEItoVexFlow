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
   * @class Ornaments
   * @extend PointerCollection
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

    addToNote : function (model, note) {
      this.addOrnamentToNote(note.vexNote, model, 0);
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

      var ornamentMap = {
        'trill':'tr',
        'mordent':'mordent',
        'turn': 'turn'
      };

      var name = ornamentMap[model.element.localName];

      var form;
      if (name==='mordent') {
        form = (atts.form === 'inv') ? '' : '_inverted';
      } else {
        form = (atts.form === 'inv') ? '_inverted' : '';
      }




      var vexOrnament = new VF.Ornament(name + form);

      vexOrnament.setMeiElement(model.element);


      // not yet implemented in vexFlow!?
//      var place = atts.place;
//      if (place) {
//        vexOrnament.position = Tables.positions[place];
//      }


//      notesBar1[0].addModifier(0, new Vex.Flow.Ornament("mordent"));
//      notesBar1[1].addModifier(0, new Vex.Flow.Ornament("mordent_inverted"));
//      notesBar1[2].addModifier(0, new Vex.Flow.Ornament("turn"));
//      notesBar1[3].addModifier(0, new Vex.Flow.Ornament("turn_inverted"));
//      notesBar1[4].addModifier(0, new Vex.Flow.Ornament("tr"));
//      notesBar1[5].addModifier(0, new Vex.Flow.Ornament("upprall"));
//      notesBar1[6].addModifier(0, new Vex.Flow.Ornament("downprall"));
//      notesBar1[7].addModifier(0, new Vex.Flow.Ornament("prallup"));
//      notesBar1[8].addModifier(0, new Vex.Flow.Ornament("pralldown"));
//      notesBar1[9].addModifier(0, new Vex.Flow.Ornament("upmordent"));
//      notesBar1[10].addModifier(0, new Vex.Flow.Ornament("downmordent"));
//      notesBar1[11].addModifier(0, new Vex.Flow.Ornament("lineprall"));
//      notesBar1[12].addModifier(0, new Vex.Flow.Ornament("prallprall"));




      if (atts.accidupper) {
        vexOrnament.setUpperAccidental(Tables.accidentals[atts.accidupper]);
      }
      if (atts.accidlower) {
        vexOrnament.setLowerAccidental(Tables.accidentals[atts.accidlower]);
      }

      note.addModifier(index, vexOrnament);
    }
  });


  return Ornaments;

});
