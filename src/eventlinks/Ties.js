define([
  'jquery',
  'vexflow',
  'core/RuntimeError',
  'eventlinks/EventLinkCollection',
  'eventlinks/EventLink'
], function($, VF, RuntimeError, EventLinkCollection, EventLink, undefined) {


    /**
     * @class MEI2VF.Ties
     * @extend MEI2VF.EventLinkCollection
     * @private
     *
     * @constructor
     */

    var Ties = function(systemInfo, unresolvedTStamp2) {
      this.init(systemInfo, unresolvedTStamp2);
    };

    Vex.Inherit(Ties, EventLinkCollection, {

      init : function(systemInfo, unresolvedTStamp2) {
        Ties.superclass.init.call(this, systemInfo, unresolvedTStamp2);
      },

      validateAtts : function() {
        return;
      },

      // NB called from tie/slur attributes elements
      start_tieslur : function(startid, linkCond) {
        var eventLink = new EventLink(startid, null);
        eventLink.setParams({
          linkCond : linkCond
        });
        this.allModels.push(eventLink);
      },

      // TODO: separate tie & slur specific functions in separate objects!?
      terminate_tie : function(endid, linkCond) {
        var cmpLinkCond, found, i, tie, allTies;

        allTies = this.getModels();

        cmpLinkCond = function(lc1, lc2) {
          // return (lc1 && lc2 && lc1.pname === lc2.pname && lc1.oct === lc2.oct
          // && lc1.system === lc2.system);
          return (lc1 && lc2 && lc1.pname === lc2.pname && lc1.oct === lc2.oct);
        };

        if (!linkCond.pname || !linkCond.oct)
          throw new RuntimeError('MEI2VF.RERR.BadArguments:TermTie01', 'no pitch or octave specified for the tie');
        found = false;
        for ( i = 0; !found && i < allTies.length; ++i) {
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
        // pitch,
        // then create a tie that has only endid set.
        if (!found)
          this.addModel(new EventLink(null, endid));
      },

      terminate_slur : function(endid, linkCond) {
        var me = this, cmpLinkCond, found, i, slur;

        var allModels = this.getModels();

        cmpLinkCond = function(lc1, lc2) {
          // return lc1.nesting_level === lc2.nesting_level && lc1.system ===
          // lc2.system;
          return lc1.nesting_level === lc2.nesting_level;
        };

        found = false;
        for ( i = 0; i < allModels.length; ++i) {
          slur = allModels[i];
          if (slur && !slur.getLastId() && cmpLinkCond(slur.params.linkCond, linkCond)) {
            slur.setLastId(endid);
            found = true;
            break;
          }
        }
        if (!found)
          me.addModel(new EventLink(null, endid));
      },

      createVexFromInfos : function(notes_by_id) {
        var me = this, f_note, l_note;
        $.each(me.allModels, function() {
          f_note = notes_by_id[this.getFirstId()] || {};
          l_note = notes_by_id[this.getLastId()] || {};
          if (f_note.system !== undefined && l_note.system !== undefined && f_note.system !== l_note.system) {
            me.createSingleStaveTie(f_note, {}, this.params);

            // temporary: set the same curve direction for the second note by
            // evaluating the stem direction of the first note; change this when
            // the curve dir of the first note is calculated differently in
            // VexFlow
            this.params.curvedir = (f_note.vexNote.getStemDirection() === -1) ? 'above' : 'below';
            me.createSingleStaveTie({}, l_note, this.params);
          } else {
            me.createSingleStaveTie(f_note, l_note, this.params);
          }
        });
        return this;
      },

      createSingleStaveTie : function(f_note, l_note, params) {
        var me = this, vexTie, bezier, cps;
        bezier = params.bezier;
        if (bezier) {
          cps = me.bezierStringToCps(bezier);
          vexTie = new VF.Curve(f_note.vexNote, l_note.vexNote, {
            cps : cps,
            y_shift_start : +params.startvo,
            y_shift_end : +params.endvo
          });
        } else {
          vexTie = new VF.StaveTie({
            first_note : f_note.vexNote,
            last_note : l_note.vexNote,
            first_indices : f_note.index,
            last_indices : l_note.index
          });
          vexTie.setDir(params.curvedir);
        }
        me.allVexObjects.push(vexTie);
      },

      bezierStringToCps : function(str) {
        var cps = [], xy, bezierArray = str.split(' ');
        while (bezierArray[0]) {
          xy = bezierArray.splice(0, 2);
          cps.push({
            x : +xy[0],
            y : +xy[1]
          });
        }
        return cps;
      }
    });

  return Ties;


  });
