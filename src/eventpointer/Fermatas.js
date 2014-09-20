define([
  'vexflow',
  'm2v/core/Logger',
  'm2v/core/Util',
  'm2v/core/RuntimeError',
  'm2v/core/Tables',
  'm2v/eventpointer/EventPointerCollection',
  'm2v/event/EventUtil'
], function (VF, Logger, Util, RuntimeError, Tables, EventPointerCollection, EventUtil, undefined) {


  /**
   * @class MEI2VF.Fermatas
   * @extend MEI2VF.EventPointerCollection
   * @private
   *
   * @constructor
   */
  var Fermatas = function (systemInfo, font) {
    this.init(systemInfo, font);
  };

  Vex.Inherit(Fermatas, EventPointerCollection, {

    init : function (systemInfo, font) {
      Fermatas.superclass.init.call(this, systemInfo, font);
    },

    createVexFromInfos : function (notes_by_id) {
      var me = this, i, model, note, annot;
      i = me.allModels.length;
      while (i--) {
        model = me.allModels[i];
        note = notes_by_id[model.startid];
        if (note) {
          EventUtil.addFermata(note.vexNote, model.element, model.atts.place);
        } else {
          console.log(model);
          Logger.log('warn', 'Input error', Util.serializeElement(model.element) +
                                            ' could not be rendered because the reference "' + model.startid +
                                            '" could not be resolved.');
        }
      }

    }

  });

  return Fermatas;

});
