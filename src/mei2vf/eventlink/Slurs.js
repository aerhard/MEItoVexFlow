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
      var me = this, f_note, l_note, i, j, model, bezier, params, curveDir, layerDir;

      var BELOW = -1;
      var ABOVE = 1;


      for (i = 0, j = me.allModels.length; i < j; i++) {
        model = me.allModels[i];
        params = model.params;
        curveDir = (params.curvedir === 'above') ? ABOVE : (params.curvedir=== 'below') ? BELOW : null;

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


        // if no @curvedir is specified, set @curvedir according to the layer direction or to
        // the position of a note in a chord
        if (!curveDir) {
          layerDir = f_note.layerDir || l_note.layerDir;
          if (layerDir) {
            // calculate default curve direction based on the relative layer
            curveDir = layerDir;
          } else {
            // if the slur links to a note in a chord, let the outer slurs of the
            // chord point outwards

            // TODO adjust to slurs!!
            if (f_note.vexNote) {
              keysInChord = f_note.vexNote.keys.length;
              if (keysInChord > 1) {
                curveDir =
                (+f_note.index === 0) ? BELOW : (+f_note.index === keysInChord - 1) ? ABOVE : undefined;
              }
            } else {
              keysInChord = l_note.vexNote.keys.length;
              if (keysInChord > 1) {
                curveDir = +l_note.index === 0 ? BELOW : (+l_note.index === keysInChord - 1) ? ABOVE : undefined;
              }
            }
          }
        }

        var slurOptions = {
          y_shift_start : +params.startvo || undefined,
          y_shift_end : +params.endvo || undefined,

        };

        var firstStemDir, lastStemDir;
        if (f_note.vexNote) firstStemDir = f_note.vexNote.getStemDirection();
        if (l_note.vexNote) lastStemDir = l_note.vexNote.getStemDirection();

        var setPositionBasedOnDistance = function () {
          var firstNoteLine = f_note.vexNote.getLineNumber();
          var lastNoteLine = l_note.vexNote.getLineNumber();
          var distance = firstNoteLine - lastNoteLine;
          if (firstStemDir !== lastStemDir) {
            if ((firstStemDir === ABOVE && distance < -0.5 && curveDir === ABOVE) ||
                (lastStemDir === BELOW && distance > 0.5 && curveDir === BELOW)) {
              slurOptions.position = VF.Curve.Position.NEAR_TOP;
              slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
            } else if ((distance > 0.5 && curveDir === ABOVE) ||
                       (distance < -0.5 && curveDir === BELOW)) {
              slurOptions.position_end = VF.Curve.Position.NEAR_TOP;
              //                slurOptions.position_end = VF.Curve.Position.NEAR_TOP;
            } else if (distance > 0.5 || distance < -0.5) {
              slurOptions.position = VF.Curve.Position.NEAR_HEAD;
              slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
            }
          } else {
            if (slurOptions.invert === true) {
              slurOptions.position = VF.Curve.Position.NEAR_TOP;
            }
          }
        };


        //bezier = params.bezier;
        // ignore bezier for now!
        bezier = null;
        //      if (bezier) {
        //        slurOptions.cps = me.bezierStringToCps(bezier);
        //      } else {
        //


        if ((curveDir === ABOVE && lastStemDir === ABOVE) ||
            (curveDir === BELOW && lastStemDir === BELOW)) {
          slurOptions.invert = true;
        }



        if (curveDir && f_note.vexNote && l_note.vexNote
          && f_note.vexNote.duration !== 'w' && l_note.vexNote.duration !== 'w') {
          // CURVEDIR SPECIFIED - TWO NOTES THERE
            setPositionBasedOnDistance();

        } else {
          // NO CURVEDIR SPECIFIED

          if (f_note.layerDir || l_note.layerDir) {
            // NO FIXED PLACE - MULTI LAYER
            slurOptions.invert = true;

            if (f_note.vexNote && l_note.vexNote && f_note.vexNote.hasStem() && l_note.vexNote.hasStem()) {
              slurOptions.position = VF.Curve.Position.NEAR_TOP;

              if (f_note.vexNote.getStemDirection() !== l_note.vexNote.getStemDirection()) {
                slurOptions.position_end = VF.Curve.Position.NEAR_HEAD;
              }

            }
          } else {
            setPositionBasedOnDistance();
          }
        }

//        console.log('curve dir: ' + curveDir + ', ' + 'layer dir: ' + params.layerDir + ', ');

        // finally, in all cases, handle system breaks and create slur objects
        if (f_note.system !== undefined && l_note.system !== undefined && f_note.system !== l_note.system) {
          me.createSingleSlur(f_note, {}, {
            y_shift_start : slurOptions.y_shift_start,
            y_shift_end : slurOptions.y_shift_end,
            invert : ((curveDir === ABOVE && firstStemDir === ABOVE) ||
                      (curveDir === BELOW && firstStemDir === BELOW)),
            position : slurOptions.position,
            position_end : slurOptions.position
          });

          slurOptions.position = slurOptions.position_end;
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
      regex = /(\-?\d+)\s+(\-?\d+)/g;
      while (matched = regex.exec(str)) {
        cps.push({
          x : +matched[1],
          y : +matched[2]
        });
      }
      if (!cps[1]) cps[1] = cps[0];
      return cps;
    }
  });

  return Slurs;


});
