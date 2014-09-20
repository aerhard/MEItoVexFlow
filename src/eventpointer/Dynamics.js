define([
  'vexflow',
  'm2v/core/Logger',
  'm2v/core/Util',
  'm2v/core/RuntimeError',
  'm2v/core/Tables',
  'm2v/eventpointer/EventPointerCollection'
], function (VF, Logger, Util, RuntimeError, Tables, EventPointerCollection, undefined) {

  /**
   * @class MEI2VF.Dynamics
   * @extend MEI2VF.EventPointerCollection
   * @private
   *
   * @constructor
   */
  var Dynamics = function (systemInfo, font) {
    this.init(systemInfo, font);
  };

  Vex.Inherit(Dynamics, EventPointerCollection, {

    init : function (systemInfo, font) {
      Dynamics.superclass.init.call(this, systemInfo, font);
    },

    // TODO use Vex.Flow.Textnote instead of VF.Annotation!?
    createVexFromInfos : function (notes_by_id) {
      var me = this, i, model, note, annot;
      i = me.allModels.length;
      while (i--) {
        model = me.allModels[i];
        note = notes_by_id[model.startid];
        if (note) {
          annot =
          (new VF.Annotation($(model.element).text().trim())).setFont(me.font.family, me.font.size, me.font.weight);

          // TEMPORARY: set width of modifier to zero so voices with modifiers
          // don't get too much width; remove when the width calculation in
          // VexFlow does distinguish between different y values when
          // calculating the width of tickables
          annot.setWidth(0);
          if (model.atts.place === 'above') {
            note.vexNote.addAnnotation(0, annot);
          } else {
            note.vexNote.addAnnotation(0, annot.setVerticalJustification(me.BOTTOM));
          }
        } else {
          Logger.log('warn', 'Input error', Util.serializeElement(model.element) +
                                            ' could not be rendered because the reference "' + model.startid +
                                            '" could not be resolved.');
        }
      }

    }
  });

  return Dynamics;

});
