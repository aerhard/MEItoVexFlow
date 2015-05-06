/**
 * Modifications:
 * 1) added conditions in draw() to align notes and create new slur only once. If the note
 * alignment function were called multiple times, the grace notes would get shifted further and
 * further each time draw() is called.
 */

define([
    'vex'
], function (Vex) {

  Vex.Flow.GraceNoteGroup.prototype.draw = function () {
    if (!this.context) {
      throw new Vex.RuntimeError("NoContext", "Can't draw Grace note without a context.");
    }

    var note = this.getNote();

    if (!(note && (this.index !== null))) {
      throw new Vex.RuntimeError("NoAttachedNote", "Can't draw grace note without a parent note and parent note index.");
    }

    function alignGraceNotesWithNote(grace_notes, note) {
      // Shift over the tick contexts of each note
      // So that th aligned with the note
      var tickContext = note.getTickContext();
      var extraPx = tickContext.getExtraPx();
      var x = tickContext.getX() - extraPx.left - extraPx.extraLeft;
      grace_notes.forEach(function (graceNote) {
        var tick_context = graceNote.getTickContext();
        var x_offset = tick_context.getX();
        graceNote.setStave(note.stave);
        tick_context.setX(x + x_offset);
      });
    }

    if (this.graceNotesAligned !== true) {
      alignGraceNotesWithNote(this.grace_notes, note);
      this.graceNotesAligned = true;
    }

    // Draw notes
    this.grace_notes.forEach(function (graceNote) {
      graceNote.setContext(this.context).draw();
    }, this);

    // Draw beam
    if (this.beam) {
      this.beam.setContext(this.context).draw();
    }

    if (this.show_slur) {
      if (!this.slur) {
        // Create and draw slur
        this.slur = new Vex.Flow.StaveTie({
          last_note : this.grace_notes[0],
          first_note : note,
          first_indices : [0],
          last_indices : [0]
        });
        this.slur.render_options.cp2 = 12;
      }
      this.slur.setContext(this.context).draw();
    }
  };

});