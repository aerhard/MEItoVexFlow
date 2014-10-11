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
  'common/Logger',
  'common/RuntimeError',
  'common/Util',
  'mei2vf/Tables',
  'mei2vf/eventpointer/Articulation'
], function (VF, Logger, RuntimeError, Util, Tables, Articulation) {


  var EventUtil = {

    DIR : {
      down : VF.StaveNote.STEM_DOWN,
      up : VF.StaveNote.STEM_UP
    },

    /**
     * converts the pitch of an MEI element to a VexFlow pitch
     *
     * @method getVexPitch
     * @param {Element} element the MEI element from which the pitch should be read
     * @return {String} the VexFlow pitch
     */
    getVexPitch : function (element) {
      var pname, oct;
      pname = element.getAttribute('pname');
      oct = element.getAttribute('oct');
      if (!pname || !oct) {
        Logger.warn('Missing attributes', '@pname and @oct must be specified in ' + Util.serializeElement(element) +
                                          '". Setting default pitch c4.');
        return 'c/4';
      }
      return pname + '/' + oct;
    },

    /**
     * @method translateDuration
     */
    translateDuration : function (element, mei_dur) {
      var result = Tables.durations[mei_dur + ''], alias;
      if (!result) {
        alias = {
          'brevis' : 'breve',
          'longa' : 'long'
        };
        if (alias[mei_dur]) {
          Logger.info('Not supported', 'Duration "' + mei_dur + '" in ' + Util.serializeElement(element) +
                                       ' is not supported. Using "' + alias[mei_dur] + '" instead.');
          return Tables.durations[alias[mei_dur] + ''];
        }
        if (mei_dur === undefined) {
          throw new RuntimeError('No duration attribute found in ' + Util.serializeElement(element));
        } else {
          Logger.warn('Not supported', 'Duration "' + mei_dur + ' in "' + Util.serializeElement(element) +
                                       '" is not supported. Using "4" instead.');
        }
        result = Tables.durations['4'];
      }
      return result;
    },

    /**
     * @method processAttsDuration
     */
    processAttsDuration : function (element, atts) {
      var me = this, dur;
      dur = me.translateDuration(element, atts.dur);
      return (atts.dots === '1') ? dur + 'd' : (atts.dots === '2') ? dur + 'dd' : dur;
    },

    /**
     * @method processAttrAccid
     */
    processAttrAccid : function (mei_accid, vexObject, i) {
      var val = Tables.accidentals[mei_accid];
      if (val) {
        vexObject.addAccidental(i, new VF.Accidental(val));
      } else {
        Logger.warn('Not supported', 'The value "' + mei_accid + '" is not supported in @accid. Ignoring attribute.');
      }
    },

    /**
     * @method processAttrHo
     */
    processAttrHo : function (mei_ho, vexObject, stave) {
      vexObject.setExtraLeftPx(+mei_ho * stave.getSpacingBetweenLines() / 2);
    },

    /**
     * adds an articulation to a note-like object
     * @method addArticulation
     * @param {Vex.Flow.StaveNote} note the note-like VexFlow object
     * @param {Element} element the articulation element
     */
    addArticulation : function (note, element) {
      var i, j, articCode, alreadyDefined;

      articCode = Tables.articulations[element.getAttribute('artic')];

      if (articCode) {

        for (i = 0, j = note.modifiers.length; i < j; i++) {
          if (note.modifiers[i].type === articCode) {
            alreadyDefined = note.modifiers[i];
            break;
          }
        }
        if (alreadyDefined) {
          alreadyDefined.addMeiElement(element);
        } else {
          var vexArtic = new Articulation(articCode).addMeiElement(element);
          var place = element.getAttribute('place');
          if (place) {
            vexArtic.setPosition(Tables.positions[place]);
          } else {
            console.log(note);
            // TODO @artic attributes on notes have no place specified; they currently get always rendered above
            vexArtic.setPosition(Tables.positions['above']);
          }
          note.addArticulation(0, vexArtic);
        }

        // NB place is currently not taken into account; it might be good to support
        // multiple articulations of the same kind in different places, although this
        // should only be a requirement in special cases like diplomatic transcriptions

      } else {
        Logger.warn('unknown @artic', 'The @artic attribute in ' + Util.serializeElement(element) +
                                      ' is unknown or undefined. Ignoring articulation.');
      }
    },

    addFermataAtt : function (note, element, place, index) {
      var me = this;
      var vexPlace = Tables.fermata[place];
      me.addNewFermata(note, element, place, index, vexPlace);
    },

    /**
     * adds a fermata to a note-like object
     * @method addFermataAtt
     * @param {Vex.Flow.StaveNote} note the note-like VexFlow object
     * @param {Element} element the element containing the fermata specifications
     * @param {'above'/'below'} place The place of the fermata
     * @param {Number} index The index of the note in a chord (optional)
     */
    addFermata : function (note, element, place, index) {
      var me = this, i, j, alreadyDefined = null, vexPlace;
      vexPlace = Tables.fermata[place];
      for (i = 0, j = note.modifiers.length; i < j; i++) {
        if (note.modifiers[i].type === vexPlace) {
          alreadyDefined = note.modifiers[i];
          break;
        }
      }
      if (alreadyDefined) {
        alreadyDefined.addMeiElement(element);
      } else {
        me.addNewFermata(note, element, place, index, vexPlace);
      }
    },

    addNewFermata : function (note, element, place, index, articCode) {
      var vexArtic = new Articulation(articCode);
      vexArtic.setPosition(Tables.positions[place]);
      vexArtic.addMeiElement(element);
      note.addArticulation(index || 0, vexArtic);
    },

    addStemModifier : function (note, element, stemMod) {
      var n = parseInt(stemMod, 10);
      if (n) {
        note.addArticulation(0, new VF.Tremolo(n));
      } else {
        Logger.info('Not supported', 'The value of @stem.mod="' + stemMod + '" specified in ' +
                                     Util.serializeElement(element) + ' is not supported. Ignoring attribute');
      }
    },

    addClefModifier : function (vexNote, prop) {
      var clef = new VF.ClefNote(prop.type, 'small', prop.shift === -1 ? '8vb' : undefined);
      clef.setMeiElement(prop.meiElement);
      vexNote.addModifier(0, new VF.GraceNoteGroup([clef], false));
      clef.setOffsetLeft(25);
    },

    /**
     * @method setStemDir
     * @param options
     * @param vexOptions
     * @return {Boolean} true if a stem direction has been specified in the MEI code
     */
    setStemDir : function (options, vexOptions) {
      var specified_dir = this.DIR[options.atts['stem.dir']];
      if (specified_dir) {
        vexOptions.stem_direction = specified_dir;
        return true;
      } else if (options.layerDir) {
        vexOptions.stem_direction = options.layerDir;
        return false;
      } else {
        vexOptions.auto_stem = true;
        return false;
      }
    }

  };

  return EventUtil;

});
