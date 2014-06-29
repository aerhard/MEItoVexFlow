define([
  'jquery',
  'vexflow',
  'core/RuntimeError',
  'eventattributes/EventAttributeCollection'
], function($, VF, RuntimeError, EventAttributeCollection, undefined) {

    /**
     * @class MEI2VF.Dynamics
     * @extend MEI2VF.EventAttributeCollection
     * @private
     *
     * @constructor
     */
    var Dynamics = function(systemInfo, font) {
      this.init(systemInfo, font);
    };

    Vex.Inherit(Dynamics, EventAttributeCollection, {

      init : function(systemInfo, font) {
        Dynamics.superclass.init.call(this, systemInfo, font);
      },

      // TODO use Vex.Flow.Textnote instead of VF.Annotation!?
      createVexFromInfos : function(notes_by_id) {
        var me = this, i, model, note, annot;
        i = me.allModels.length;
        while (i--) {
          model = me.allModels[i];
          note = notes_by_id[model.startid];
          if (note) {
            annot = (new VF.Annotation($(model.element).text().trim())).setFont(me.font.family, me.font.size, me.font.weight);
            if (model.atts.place === 'above') {
              note.vexNote.addAnnotation(0, annot);
            } else {
              note.vexNote.addAnnotation(0, annot.setVerticalJustification(me.BOTTOM));
            }
          } else {
            throw new RuntimeError('MEI2VF.RERR.createVexFromInfos', "The reference in the directive could not be resolved.");
          }
        }

      }
    });

  return Dynamics;

  });
