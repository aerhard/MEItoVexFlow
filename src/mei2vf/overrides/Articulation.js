/**
 * Changes:
 * 1) let left justified notes align with note heads on the left
 * 2) use this.text_line * 2 instead of this.text_line as y starting point so annotations don't
 * collide when default font sizes are used
 * 3) increase text_lines of annotations separately for top, bottom and the rest
 */

define([
  'vex'
], function (Vex) {

  // ## Static Methods
    // Arrange articulations inside `ModifierContext`
  Vex.Flow.Articulation.format = function(articulations, state) {
    if (!articulations || articulations.length === 0) return false;

    var text_line = state.text_line;
    var top_text_line = state.top_text_line;
    var bottom_text_line = state.bottom_text_line;
    var max_width = 0;

    // Format Articulations
    var width;
    for (var i = 0; i < articulations.length; ++i) {
      var articulation = articulations[i];

      var type = Vex.Flow.articulationCodes(articulation.type);

      if (articulation.position === 3) {
        articulation.setTextLine(top_text_line);
        top_text_line += (type.between_lines) ? 1 : 1.5;
      } else if (articulation.position === 4) {
        articulation.setTextLine(bottom_text_line);
        bottom_text_line += (type.between_lines) ? 1 : 1.5;
      } else {
        articulation.setTextLine(text_line);
        text_line += (type.between_lines) ? 1 : 1.5;
      }

      width = articulation.getWidth() > max_width ?
              articulation.getWidth() : max_width;
    }

    state.left_shift += width / 2;
    state.right_shift += width / 2;

    state.text_line = text_line;
    state.top_text_line = top_text_line;
    state.bottom_text_line = bottom_text_line;

    return true;
  };


  Vex.Flow.Articulation.prototype.draw = function () {
    var Modifier = Vex.Flow.Modifier;
    var L = function () {
    };
    if (!this.context) throw new Vex.RERR("NoContext", "Can't draw Articulation without a context.");
    if (!(this.note && (this.index !== null))) {
      throw new Vex.RERR("NoAttachedNote", "Can't draw Articulation without a note and index.");
    }

    var stem_direction = this.note.getStemDirection();
    var stave = this.note.getStave();

    var is_on_head = (this.position === Modifier.Position.ABOVE && stem_direction === Vex.Flow.StaveNote.STEM_DOWN) ||
                     (this.position === Modifier.Position.BELOW && stem_direction === Vex.Flow.StaveNote.STEM_UP);

    var needsLineAdjustment = function (articulation, note_line, line_spacing) {
      var offset_direction = (articulation.position === Modifier.Position.ABOVE) ? 1 : -1;
      if (!is_on_head && !articulation.getNote().hasStem()) {
        // Add stem length, inless it's on a whole note
        note_line += offset_direction * 3.5;
      }

      var articulation_line = note_line + (offset_direction * line_spacing);

      return (articulation_line >= 1 && articulation_line <= 5 && articulation_line % 1 === 0);
    };

    // Articulations are centered over/under the note head.
    var start = this.note.getModifierStartXY(this.position, this.index);
    var glyph_y = start.y;
    var shiftY = 0;
    var line_spacing = 1;
    var spacing = stave.getSpacingBetweenLines();
    var is_tabnote = this.note.getCategory() === 'tabnotes';
    var stem_ext = this.note.getStem().getExtents();

    var top = stem_ext.topY;
    var bottom = stem_ext.baseY;

    if (stem_direction === Vex.Flow.StaveNote.STEM_DOWN) {
      top = stem_ext.baseY;
      bottom = stem_ext.topY;
    }

    // TabNotes don't have stems attached to them. Tab stems are rendered
    // outside the stave.
    if (is_tabnote) {
      if (this.note.hasStem()) {
        if (stem_direction === Vex.Flow.StaveNote.STEM_UP) {
          bottom = stave.getYForBottomText(this.text_line - 2);
        } else if (stem_direction === Vex.Flow.StaveNote.STEM_DOWN) {
          top = stave.getYForTopText(this.text_line - 1.5);
        }
      } else { // Without a stem
        top = stave.getYForTopText(this.text_line - 1);
        bottom = stave.getYForBottomText(this.text_line - 2);
      }
    }

    var is_above = (this.position === Modifier.Position.ABOVE);
    var note_line = this.note.getLineNumber(is_above);

    // Beamed stems are longer than quarter note stems.
    if (!is_on_head && this.note.beam) {
      line_spacing = this.note.beam.beam_count * 0.5;
    }

    // If articulation will overlap a line, reposition it.
    if (needsLineAdjustment(this, note_line, line_spacing)) line_spacing += 0.5;

    var glyph_y_between_lines;
    if (this.position === Modifier.Position.ABOVE) {
      shiftY = this.articulation.shift_up;
      glyph_y_between_lines = (top - 7) - (spacing * (this.text_line + line_spacing));

      if (this.articulation.between_lines) {
        glyph_y = glyph_y_between_lines;
      } else {
        glyph_y = Math.min(stave.getYForTopText(this.text_line) - 3, glyph_y_between_lines);
      }
    } else {
      shiftY = this.articulation.shift_down - 10;

      glyph_y_between_lines = bottom + 10 + spacing * (this.text_line + line_spacing);
      if (this.articulation.between_lines) {
        glyph_y = glyph_y_between_lines;
      } else {
        glyph_y = Math.max(stave.getYForBottomText(this.text_line), glyph_y_between_lines);
      }
    }

    var glyph_x = start.x + this.articulation.shift_right;
    glyph_y += shiftY + this.y_shift;

    L("Rendering articulation: ", this.articulation, glyph_x, glyph_y);
    Vex.Flow.renderGlyph(this.context, glyph_x, glyph_y, this.render_options.font_scale, this.articulation.code);

    //var context = this.context;
    //context.save();
    //context.beginPath();
    //context.rect(glyph_x, glyph_y, 10, 10);
    //context.fillStyle = 'rgba(0, 0, 255, 0.5)';
    //context.fill();
    //context.restore();


    // ### START ADDITION
    this.x = glyph_x;
    this.y = glyph_y;
    // ### END ADDITION

  };





});