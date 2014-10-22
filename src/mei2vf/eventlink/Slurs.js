/*
 * MEItoVexFlow, Slurs class
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
  'mei2vf/eventlink/EventLinkCollection',
  'mei2vf/eventlink/EventLink'
], function (VF, Vex, Logger, EventLinkCollection, EventLink, undefined) {


  /**
   * @class MEI2VF.Slurs
   * @extend MEI2VF.EventLinkCollection
   * @private
   *
   * @constructor
   */

  var Slurs = function (systemInfo, unresolvedTStamp2) {
    this.init(systemInfo, unresolvedTStamp2);
  };

  Vex.Inherit(Slurs, EventLinkCollection, {

    init : function (systemInfo, unresolvedTStamp2) {
      Slurs.superclass.init.call(this, systemInfo, unresolvedTStamp2);
    },

    validateAtts : function () {
    },

    // NB called from slur attributes elements
    startSlur : function (startid, linkCond) {
      var eventLink = new EventLink(startid, null);
      eventLink.setParams({
        linkCond : linkCond
      });
      this.allModels.push(eventLink);
    },

    terminateSlur : function (endid, linkCond) {
      var me = this, cmpLinkCond, found, i, slur;

      var allModels = this.getModels();

      cmpLinkCond = function (lc1, lc2) {
        return lc1.nesting_level === lc2.nesting_level;
      };

      found = false;
      for (i = 0; i < allModels.length; ++i) {
        slur = allModels[i];
        if (slur && !slur.getLastId() && cmpLinkCond(slur.params.linkCond, linkCond)) {
          slur.setLastId(endid);
          found = true;
          break;
        }
      }
      if (!found) {
        me.addModel(new EventLink(null, endid));
      }
    },

    createVexFromInfos : function (notes_by_id) {
      var me = this, f_note, l_note, i, j, model, bezier, params, curveDir, layerDir, slurOptions = {};

      var BELOW = -1;
      var ABOVE = 1;


      for (i = 0, j = me.allModels.length; i < j; i++) {
        model = me.allModels[i];
        params = model.params;
        curveDir = (params.curvedir === 'above') ? ABOVE : (params.curvedir === 'below') ? BELOW : null;

        var keysInChord;
        f_note = notes_by_id[model.getFirstId()] || {};
        l_note = notes_by_id[model.getLastId()] || {};

        // Skip slurs where no vexNote could be found for both first and last note
        if (!f_note.vexNote && !l_note.vexNote) {
          var param, paramString = '';
          for (param in params) {
            paramString += param + '="' + params[param] + '" ';
          }
          console.log(model);
          Logger.warn('Slur could not be processed', 'No slur start or slur end could be found. Slur parameters: ' +
                                                     paramString + '. Skipping slur.');
          return true;
        }

        var firstDefinedNote = (f_note.vexNote) ? f_note : l_note;
        var firstStemDir, lastStemDir;
        if (f_note.vexNote) firstStemDir = f_note.vexNote.getStemDirection();
        if (l_note.vexNote) lastStemDir = l_note.vexNote.getStemDirection();
        layerDir = f_note.layerDir || l_note.layerDir;
        var firstDefinedStemDir = firstStemDir || lastStemDir;


        // TODO
        // STEPS :
        // 1) if bezier, use bezier, otherwise calculate curvedir
        // 2) if y shift, use y shift, otherwise calculate position


        // ### STEP 1: Determine curve and curve dir

        bezier = params.bezier;
        //ignore bezier for now!
        bezier = null;
        if (bezier) {
          slurOptions.cps = me.bezierStringToCps(bezier);
          slurOptions.custom_cps = true;
          // bezier overrrides @curvedir
          curveDir = (slurOptions.cps[0].y < 0) ? ABOVE : BELOW;
        } else {

          if (!curveDir) {
            // if no @curvedir is specified, set @curvedir according to the layer direction or to
            // the position of a note in a chord
            if (layerDir) {
              // if @layerdir is specified, set curveDir to @layerdir
              curveDir = layerDir;
            } else {
              // if the slur links to a note in a chord, let the outer slurs of the
              // chord point outwards

              // TODO adjust to slurs!!
              //              keysInChord = firstDefinedNote.vexNote.keys.length;
              //              if (keysInChord > 1) {
              //                curveDir = (+firstDefinedNote.index === 0) ? BELOW :
              //                           (+firstDefinedNote.index === keysInChord - 1) ? ABOVE : undefined;
              //              } else {
              //                curveDir = firstDefinedStemDir * -1;
              //              }

              curveDir = firstDefinedStemDir * -1;

            }
          }

          // adjust slurOptions to curveDir
          if ((curveDir === BELOW && lastStemDir === ABOVE) || (curveDir === ABOVE && lastStemDir === BELOW)) {
            slurOptions.invert = false;
          } else {
            slurOptions.invert = true;
          }

        }


        // TODO refactor: take stem-top and stem-bottom into account

        // ### STEP 2: Determine position

        var startvo = parseFloat(params.startvo);
        var endvo = parseFloat(params.endvo);

        // skip this for now
        startvo = null;

        if (startvo && endvo) {
          slurOptions.y_shift_start = startvo;
          slurOptions.y_shift_end = endvo;
        } else {

          if (!f_note.vexNote || !l_note.vexNote || !f_note.vexNote.hasStem() || !l_note.vexNote.hasStem()) {
            // always position at head when one of the notes doesn't have a stem
            slurOptions.position = VF.Curve.Position.NEAR_HEAD;
            slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;

          } else if (firstStemDir === lastStemDir || !firstStemDir || !lastStemDir) {
            // same stem direction in both notes

            // shift slurs to stem end if stem direction equals curve direction
            if (firstDefinedStemDir === curveDir) {
              slurOptions.position = VF.Curve.Position.NEAR_TOP;
              slurOptions.position_end = VF.Curve.Position.NEAR_TOP;
            } else {
              slurOptions.position = VF.Curve.Position.NEAR_HEAD;
              slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
            }

          } else {
            // different direction in notes

            // change position
            if (firstDefinedStemDir === curveDir) {
              slurOptions.position = VF.Curve.Position.NEAR_TOP;
              slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
            } else {
              slurOptions.position = VF.Curve.Position.NEAR_HEAD;
              slurOptions.position_end = VF.Curve.Position.NEAR_TOP;
            }

          }

        }


        //
        //          var setPositionBasedOnDistance = function () {
        //            var firstNoteLine = f_note.vexNote.getLineNumber();
        //            var lastNoteLine = l_note.vexNote.getLineNumber();
        //            var distance = firstNoteLine - lastNoteLine;
        //            if (firstStemDir !== lastStemDir) {
        //              if ((firstStemDir === ABOVE && distance < -0.5 && curveDir === ABOVE) ||
        //                  (lastStemDir === BELOW && distance > 0.5 && curveDir === BELOW)) {
        //                slurOptions.position = VF.Curve.Position.NEAR_TOP;
        //                slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
        //              } else if ((distance > 0.5 && curveDir === ABOVE) || (distance < -0.5 && curveDir === BELOW)) {
        //                slurOptions.position_end = VF.Curve.Position.NEAR_TOP;
        //                //                slurOptions.position_end = VF.Curve.Position.NEAR_TOP;
        //              } else if (distance > 0.5 || distance < -0.5) {
        //                slurOptions.position = VF.Curve.Position.NEAR_HEAD;
        //                slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
        //              }
        //            } else {
        //              if (slurOptions.invert === true) {
        //                slurOptions.position = VF.Curve.Position.NEAR_TOP;
        //              }
        //            }
        //          };
        //
        //          if (curveDir && f_note.vexNote && l_note.vexNote && f_note.vexNote.duration !== 'w' &&
        //              l_note.vexNote.duration !== 'w') {
        //            // CURVEDIR SPECIFIED - TWO NOTES THERE
        //            setPositionBasedOnDistance();
        //
        //          } else {
        //            // NO CURVEDIR SPECIFIED
        //
        //            if (f_note.layerDir || l_note.layerDir) {
        //              // NO FIXED PLACE - MULTI LAYER
        //              slurOptions.invert = true;
        //
        //              if (f_note.vexNote && l_note.vexNote && f_note.vexNote.hasStem() && l_note.vexNote.hasStem()) {
        //                slurOptions.position = VF.Curve.Position.NEAR_TOP;
        //
        //                if (f_note.vexNote.getStemDirection() !== l_note.vexNote.getStemDirection()) {
        //                  slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
        //                }
        //
        //              }
        //            } else {
        //              if (f_note.vexNote && l_note.vexNote) {
        //                setPositionBasedOnDistance();
        //              }
        //            }
        //          }
        //
        //        }

        //        console.log('curve dir: ' + curveDir + ', ' + 'layer dir: ' + params.layerDir + ', ');

        // finally, in all cases, handle system breaks and create slur objects
        if (f_note.system !== undefined && l_note.system !== undefined && f_note.system !== l_note.system) {
          me.createSingleSlur(f_note, {}, {
            y_shift_start : slurOptions.y_shift_start,
            y_shift_end : slurOptions.y_shift_end,
            invert : ((curveDir === ABOVE && firstStemDir === ABOVE) || (curveDir === BELOW && firstStemDir === BELOW)),
            position : slurOptions.position,
            position_end : slurOptions.position
          });

          slurOptions.position = slurOptions.position_end;
          slurOptions.invert =
          ((curveDir === ABOVE && lastStemDir === ABOVE) || (curveDir === BELOW && lastStemDir === BELOW));
          me.createSingleSlur({}, l_note, slurOptions);
        } else {
          me.createSingleSlur(f_note, l_note, slurOptions);
        }

      }
      return this;
    },

    createSingleSlur : function (f_note, l_note, slurOptions) {
      this.allVexObjects.push(new VF.Curve(f_note.vexNote, l_note.vexNote, slurOptions));
    },

    bezierStringToCps : function (str) {
      var cps = [], regex, matched;
      regex = /(\-?[\d|\.]+)\s+(\-?[\d|\.]+)/g;
      while (matched = regex.exec(str)) {
        cps.push({
          x : +matched[1],
          y : +matched[2]
        });
      }
      if (!cps[1]) {
        Logger.info('Incomplete attribute', 'Expected four control points in slur/@bezier, but only found two. Providing cps 3 & 4 on basis on cps 1 & 2.')
        cps[1] = {x : -cps[0].x, y : cps[0].y};
      }
      return cps;
    }
  });

  return Slurs;


});
