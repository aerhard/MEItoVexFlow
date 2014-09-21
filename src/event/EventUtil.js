/*
 * MEItoVexFlow, EventUtil class
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
  'm2v/core/Logger',
  'm2v/core/Util',
  'm2v/core/Tables'
], function (VF, Logger, Util, Tables, undefined) {


  var EventUtil = {

    /**
     * converts the pitch of an MEI <b>note</b> element to a VexFlow pitch
     *
     * @method getVexPitch
     * @param {Element} element the MEI element from which the pitch should be read
     * @return {String} the VexFlow pitch
     */
    getVexPitch : function (element) {
      var pname, oct;
      pname = $(element).attr('pname');
      oct = $(element).attr('oct');
      if (!pname || !oct) {
        Logger.warn('Encoding error', '@pname and @oct must be specified in ' + Util.serializeElement(element) +
                                             '". Setting default pitch C4.');
        return 'C/4';
      }
      return pname + '/' + oct;
    },

    /**
     * @method translateDuration
     */
    translateDuration : function (mei_dur) {
      var result = Tables.durations[mei_dur + ''], alias;
      alias = {
        'brevis' : 'breve',
        'longa' : 'long'
      };
      if (result) {
        return result;
      }
      if (alias[mei_dur]) {
        Logger.info('Not supported', 'Duration "' + mei_dur + '" is not supported. Using "' + alias[mei_dur] +
                                            '" instead.');
        return Tables.durations[alias[mei_dur] + ''];
      }

      Logger.warn('Not supported', 'Duration "' + mei_dur +
                                          '" is not supported. Using "4" instead. May lead to display errors.');
      return Tables.durations['4'];
    },

    /**
     * @method processAttsDuration
     */
    processAttsDuration : function (mei_note, noDots) {
      var me = this, dur, dur_attr;

      dur_attr = $(mei_note).attr('dur');
      if (dur_attr === undefined) {
        Logger.warn('@dur expected', 'No duration attribute found in ' + Util.serializeElement(mei_note) +
                                            '. Using "4" instead.');
        dur_attr = '4';
      }
      dur = me.translateDuration(dur_attr);
      if (!noDots && $(mei_note).attr('dots') === '1') {
        dur += 'd';
      }
      return dur;
    },

    /**
     * @method processAttrAccid
     */
    processAttrAccid : function (mei_accid, vexObject, i) {
      var val = Tables.accidentals[mei_accid];
      if (val) {
        vexObject.addAccidental(i, new VF.Accidental(val));
      } else {
        Logger.warn('Encoding error', 'Invalid accidental "' + mei_accid + '". Skipping attribute.');
      }
    },

    /**
     * @method processAttrHo
     */
    processAttrHo : function (mei_ho, vexObject, staff) {
      var me = this;
      vexObject.setExtraLeftPx(+mei_ho * staff.getSpacingBetweenLines() / 2);
    },

    /**
     * adds an articulation to a note-like object
     * @method addArticulation
     * @param {Vex.Flow.StaveNote} note the note-like VexFlow object
     * @param {XMLElement} element the articulation element
     */
    addArticulation : function (note, element) {
      var articCode = Tables.articulations[element.getAttribute('artic')];
      if (articCode) {
        var vexArtic = new VF.Articulation(articCode).setMeiElement(element);
        var place = element.getAttribute('place');
        if (place) {
          vexArtic.setPosition(Tables.positions[place]);
        }
        note.addArticulation(0, vexArtic);
      } else {
        Logger.warn('unknown @artic', 'The @artic attribute in ' + Util.serializeElement(element) +
                                             ' is unknown or undefined. Skipping element.');
      }
    },

    /**
     * adds a fermata to a note-like object
     * @method addFermata
     * @param {Vex.Flow.StaveNote} note the note-like VexFlow object
     * @param {Element} element the element containing the fermata specifications
     * @param {'above'/'below'} place The place of the fermata
     * @param {Number} index The index of the note in a chord (optional)
     */
    addFermata : function (note, element, place, index) {
      var vexArtic = new VF.Articulation(Tables.fermata[place]);
      vexArtic.setPosition(Tables.positions[place]);
      vexArtic.setMeiElement(element);
      note.addArticulation(index || 0, vexArtic);
    },

    addClefModifier : function (vexNote, prop) {
      var clef = new VF.ClefNote(prop.type, 'small', prop.shift === -1 ? '8vb' : undefined);
      vexNote.addModifier(0, new VF.GraceNoteGroup([clef], false));
      clef.setOffsetLeft(25);
    }


  };

  return EventUtil;

});
