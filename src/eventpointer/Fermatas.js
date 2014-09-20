define([
  'vexflow',
  'm2v/core/Logger',
  'm2v/core/Util',
  'm2v/core/RuntimeError',
  'm2v/core/Tables',
  'm2v/eventpointer/EventPointerCollection'
], function (VF, Logger, Util, RuntimeError, Tables, EventPointerCollection, undefined) {


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
          me.addFermataToNote(note.vexNote, model.element, model.atts.place);
        } else {
          console.log(model);
          Logger.log('warn', 'Input error', Util.serializeElement(model.element) +
                                            ' could not be rendered because the reference "' + model.startid +
                                            '" could not be resolved.');
        }
      }

    },

    /**
     * adds a fermata to a note-like object
     * @method addFermataToNote
     * @param {Vex.Flow.StaveNote} note the note-like VexFlow object
     * @param {Element} element the element containing the fermata specifications
     * @param {'above'/'below'} place The place of the fermata
     * @param {Number} index The index of the note in a chord (optional)
     */
    addFermataToNote : function (note, element, place, index) {
      var vexArtic = new VF.Articulation(Tables.fermata[place]);
      vexArtic.setPosition(Tables.positions[place]);
      vexArtic.setMeiElement(element);
      note.addArticulation(index || 0, vexArtic);
    }
  });

  return Fermatas;

});
