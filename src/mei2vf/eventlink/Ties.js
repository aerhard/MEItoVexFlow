/*
 * MEItoVexFlow, Ties class
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
  'mei2vf/eventlink/EventLinkCollection',
  'mei2vf/eventlink/EventLink'
], function (VF, Logger, EventLinkCollection, EventLink, undefined) {


  /**
   * @class Ties
   * @extend EventLinkCollection
   * @private
   *
   * @constructor
   */

  var Ties = function (systemInfo, unresolvedTStamp2) {
    this.init(systemInfo, unresolvedTStamp2);
  };

  Vex.Inherit(Ties, EventLinkCollection, {

    init : function (systemInfo, unresolvedTStamp2) {
      Ties.superclass.init.call(this, systemInfo, unresolvedTStamp2);
    },

    validateAtts : function () {
    },

    // NB called from tie/slur attributes elements
    startTie : function (startid, linkCond) {
      var eventLink = new EventLink(startid, null);
      eventLink.setParams({
        linkCond : linkCond
      });
      this.allModels.push(eventLink);
    },

    terminateTie : function (endid, linkCond) {
      var cmpLinkCond, found, i, tie, allTies;

      allTies = this.getModels();

      cmpLinkCond = function (lc1, lc2) {
        return (lc1 && lc2 && lc1.vexPitch === lc2.vexPitch && lc1.stave_n === lc2.stave_n);
      };

      found = false;
      for (i = 0; !found && i < allTies.length; ++i) {
        tie = allTies[i];
        if (!tie.getLastId()) {
          if (cmpLinkCond(tie.params.linkCond, linkCond)) {
            found = true;
            tie.setLastId(endid);
          }
          // else {
          // // TODO in case there's no link condition set for the
          // link,
          // // we have to retreive the pitch of the referenced note.
          // // var note_id = tie.getFirstId();
          // // if (note_id) {
          // // var note = me.notes_by_id[note_id];
          // // if (note && cmpLinkCond(tie.params.linkCond,
          // // linkCond)) {
          // // found=true;
          // // tie.setLastId(endid);
          // // }
          // // }
          // }
        }
      }
      // if no tie object found that is uncomplete and with the same
      // pitch, then create a tie that has only endid set.
      if (!found) {
        this.addModel(new EventLink(null, endid));
      }
    },

    createVexFromInfos : function (notes_by_id) {
      var me = this, f_note, l_note, i, j,model;

      for (i=0,j=me.allModels.length;i<j;i++) {
        model = me.allModels[i];

        var keysInChord, tieIndices;
        f_note = notes_by_id[model.getFirstId()] || {};
        l_note = notes_by_id[model.getLastId()] || {};


        if (!f_note.vexNote && !l_note.vexNote) {
          var param, paramString = '';
          for (param in model.params) {
            paramString += param + '="' + model.params[param] + '" ';
          }
          console.log(model);
          Logger.warn('Tie could not be processed', 'No tie start or tie end could be found. Tie parameters: ' + paramString + '. Skipping tie.');
          return true;
        }

        // if the curve direction isn't specified in the model, calculate it:
        if (!model.params.curvedir) {
          var layerDir = f_note.layerDir || l_note.layerDir;
          // if a layer direction is specified, take this as basis for the curve direction
          if (layerDir) {
            model.params.curvedir = layerDir === -1 ? 'below' : layerDir === 1 ? 'above' : undefined;
          } else {
            // [approximation] if the tie links to a note in a chord, set the curve direction
            // according to the position of the note in the chord

            if (f_note.vexNote) {
              keysInChord = f_note.vexNote.keys.length;
              tieIndices = f_note.index;
            } else if (f_note.vexNote) {
              keysInChord = l_note.vexNote.keys.length;
              tieIndices = l_note.index;
            }

            if (keysInChord > 1) {

              if (tieIndices.length === 1) {
                model.params.curvedir =
                  (tieIndices[0] + 1 > keysInChord / 2) ? 'above' : 'below';

              } else {
                model.params.multiCurves = tieIndices.map(function(index) {
                  return (index + 1 > keysInChord / 2) ? 'above' : 'below';
                });
              }

            }

          }
        }

        // if the tied notes belong to different staves, render a tie to each of the staves:
        if (f_note.system !== undefined && l_note.system !== undefined && f_note.system !== l_note.system) {
          me.createSingleTie(f_note, {}, model.params);
          if (!model.params.curvedir) {
            model.params.curvedir = (f_note.vexNote.getStemDirection() === -1) ? 'above' : 'below';
          }
          me.createSingleTie({}, l_note, model.params);
        } else {
          // ... otherwise render only one tie:
          me.createSingleTie(f_note, l_note, model.params);
        }
      }
      return this;
    },

    createSingleTie : function (f_note, l_note, params) {
      var me = this;

      if (params.multiCurves) {

        var curveDirs = params.multiCurves;

        curveDirs.forEach(function(curveDir, i) {
          var vexTie = new VF.StaveTie({
            first_note : f_note.vexNote,
            last_note : l_note.vexNote,

            // set specified indices; if indices are not specified for a note, either
            // use the indices of the other note (in case of a line break, i.e. when
            // the current note is not defined) or set the default value [0]
            first_indices : (f_note.index) ? [f_note.index[i]] : ((f_note.vexNote) ? [0] : [l_note.index[i]]),
            last_indices : (l_note.index) ? [l_note.index[i]] : ((l_note.vexNote) ? [0] : [f_note.index[i]])
          });

          vexTie.setDir((curveDir === 'above') ? -1 : 1);

          if (f_note.vexNote && f_note.vexNote.grace === true) {
            vexTie.render_options.first_x_shift = -5;
          }
          me.allVexObjects.push(vexTie);
        });

      } else {

        var vexTie = new VF.StaveTie({
          first_note : f_note.vexNote,
          last_note : l_note.vexNote,

          // set specified indices; if indices are not specified for a note, either
          // use the indices of the other note (in case of a line break, i.e. when
          // the current note is not defined) or set the default value [0]
          first_indices : f_note.index || ((f_note.vexNote) ? [0] : l_note.index),
          last_indices : l_note.index || ((l_note.vexNote) ? [0] : f_note.index)
        });

        if (params.curvedir) {
          vexTie.setDir((params.curvedir === 'above') ? -1 : 1);
        }
        if (f_note.vexNote && f_note.vexNote.grace === true) {
          vexTie.render_options.first_x_shift = -5;
        }
        me.allVexObjects.push(vexTie);

      }

    }

  });

  return Ties;


});
