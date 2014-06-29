define([
  'jquery',
  'vexflow',
  'core/RuntimeError',
  'eventattributes/EventAttributeCollection'
], function($, VF, RuntimeError, EventAttributeCollection, undefined) {

    /**
     * @class MEI2VF.Directives
     * @extend MEI2VF.EventAttributeCollection
     * @private
     *
     * @constructor
     */
    var Directives = function(systemInfo, font) {
      this.init(systemInfo, font);
    };

    Vex.Inherit(Directives, EventAttributeCollection, {

      init : function(systemInfo, font) {
        Directives.superclass.init.call(this, systemInfo, font);
      },

      createVexFromInfos : function(notes_by_id) {
        var me = this, i, model, note, annot;
        i = me.allModels.length;
        while (i--) {
          model = me.allModels[i];
          note = notes_by_id[model.startid];
          if (note) {
            annot = (new VF.Annotation($(model.element).text().trim())).setFont(me.font.family, me.font.size, me.font.weight);

            // TEMPORARY: set width of modifier to zero so voices with modifiers
            // don't get too much width; remove when the width calculation in
            // VexFlow does distinguish between different y values when
            // calculating the width of tickables
            annot.setWidth(0);
            if (model.atts.place === 'below') {
              note.vexNote.addAnnotation(0, annot.setVerticalJustification(me.BOTTOM));
            } else {
              note.vexNote.addAnnotation(0, annot);
            }
          } else {
            throw new RuntimeError('MEI2VF.RERR.createVexFromInfos', "The reference in the directive could not be resolved.");
          }
        }
      }
    });

  return Directives;

  });
