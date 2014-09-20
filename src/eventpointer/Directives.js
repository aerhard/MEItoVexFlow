define([
  'vexflow',
  'm2v/core/Logger',
  'm2v/core/Util',
  'm2v/core/RuntimeError',
  'm2v/core/Tables',
  'm2v/eventpointer/EventPointerCollection'
], function (VF, Logger, Util, RuntimeError, Tables, EventPointerCollection, undefined) {

  /**
   * @class MEI2VF.Directives
   * @extend MEI2VF.EventPointerCollection
   * @private
   *
   * @constructor
   */
  var Directives = function (systemInfo, font) {
    this.init(systemInfo, font);
  };

  Vex.Inherit(Directives, EventPointerCollection, {

    init : function (systemInfo, font) {
      Directives.superclass.init.call(this, systemInfo, font);
    },

    createVexFromInfos : function (notes_by_id) {
      var me = this, i, model, note, annot;
      i = me.allModels.length;
      while (i--) {
        model = me.allModels[i];
        note = notes_by_id[model.startid];
        if (note) {
          annot =
          (new VF.Annotation($(model.element).text().replace(/\s+/g, ' ').trim())).setFont(me.font.family, me.font.size, me.font.weight).setMeiElement(model.element);

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
          Logger.log('warn', 'Input error', Util.serializeElement(model.element) +
                                            ' could not be rendered because the reference "' + model.startid +
                                            '" could not be resolved.');
        }
      }
    }
  });

  return Directives;

});
