define([
  'vexflow',
  'core/RuntimeError',
  'core/Tables',
  'eventattributes/EventAttributeCollection'
], function(VF, RuntimeError, Tables, EventAttributeCollection, undefined) {

    /**
     * @class MEI2VF.Fermatas
     * @extend MEI2VF.EventAttributeCollection
     * @private
     *
     * @constructor
     */
    var Fermatas = function(systemInfo, font) {
      this.init(systemInfo, font);
    };

    Vex.Inherit(Fermatas, EventAttributeCollection, {

      init : function(systemInfo, font) {
        Fermatas.superclass.init.call(this, systemInfo, font);
      },

      createVexFromInfos : function(notes_by_id) {
        var me = this, i, model, note, annot;
        i = me.allModels.length;
        while (i--) {
          model = me.allModels[i];
          note = notes_by_id[model.startid];
          if (note) {
            me.addFermataToNote(note.vexNote, model.atts.place);
          } else {
            throw new RuntimeError('MEI2VF.RERR.createVexFromInfos', "The reference in the directive could not be resolved.");
          }
        }

      },

      /**
       * adds a fermata to a note-like object
       * @method addFermataToNote
       * @param {Vex.Flow.StaveNote} note the note-like VexFlow object
       * @param {'above'/'below'} place The place of the fermata
       * @param {Number} index The index of the note in a chord (optional)
       */
      addFermataToNote : function(note, place, index) {
        var vexArtic = new VF.Articulation(Tables.fermata[place]);
        vexArtic.setPosition(Tables.positions[place]);
        note.addArticulation(index || 0, vexArtic);
      }
    });

  return Fermatas;

  });
