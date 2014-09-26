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
   * @class MEI2VF.Ties
   * @extend MEI2VF.EventLinkCollection
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
      return;
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

        var keysInChord;
        f_note = notes_by_id[model.getFirstId()] || {};
        l_note = notes_by_id[model.getLastId()] || {};


        if (!f_note.vexNote && !l_note.vexNote) {
          Logger.warn('Tie could not be rendered', 'Neither xml:id could be found: "' + model.getFirstId() +
                                                          '" / "' + model.getLastId() + '"');
          return true;
        }

        if (!model.params.curvedir) {
          var layerDir = f_note.layerDir || l_note.layerDir;
          if (layerDir) {
            // calculate default curve direction based on the relative layer
            model.params.curvedir = layerDir === -1 ? 'below' : layerDir === 1 ? 'above' : undefined;
          } else {
            // if the tie links to a note in a chord, let the outer ties of the
            // chord point outwards
            if (f_note.vexNote) {
              keysInChord = f_note.vexNote.keys.length;
              if (keysInChord > 1) {
                model.params.curvedir =
                (+f_note.index === 0) ? 'below' : (+f_note.index === keysInChord - 1) ? 'above' : undefined;
              }
            } else if (l_note.vexNote) {
              keysInChord = l_note.vexNote.keys.length;
              if (keysInChord > 1) {
                model.params.curvedir =
                +l_note.index === 0 ? 'below' : (+l_note.index === keysInChord - 1) ? 'above' : undefined;
              }
            }
          }
        }

        if (f_note.system !== undefined && l_note.system !== undefined && f_note.system !== l_note.system) {
          me.createSingleTie(f_note, {}, model.params);
          if (!model.params.curvedir) {
            model.params.curvedir = (f_note.vexNote.getStemDirection() === -1) ? 'above' : 'below';
          }
          me.createSingleTie({}, l_note, model.params);
        } else {
          me.createSingleTie(f_note, l_note, model.params);
        }
      }
      return this;
    },

    createSingleTie : function (f_note, l_note, params) {
      var me = this, vexTie;
      vexTie = new VF.StaveTie({
        first_note : f_note.vexNote,
        last_note : l_note.vexNote,
        first_indices : f_note.index,
        last_indices : l_note.index
      });
      vexTie.setDir(params.curvedir);
      if (f_note.vexNote && f_note.vexNote.label === 'gracenote') {
        vexTie.render_options.first_x_shift = -5;
      }
      me.allVexObjects.push(vexTie);
    }

  });

  return Ties;


});
