define([
    'vex'
], function (Vex) {

  Vex.Flow.Ornament.prototype.setMeiElement = function (element) {
    this.meiElement = element;
    return this;
  };
  Vex.Flow.Ornament.prototype.getMeiElement = function () {
    return this.meiElement;
  };


  // ## Static Methods
  // Arrange ornaments inside `ModifierContext`
  Vex.Flow.Ornament.format = function(ornaments, state) {
    if (!ornaments || ornaments.length === 0) return false;

    var text_line = state.text_line;
    var top_text_line = state.top_text_line;
    var bottom_text_line = state.bottom_text_line;
    var max_width = 0;

    // Format Articulations
    var width;
    for (var i = 0; i < ornaments.length; ++i) {
      var ornament = ornaments[i];

      var type = Vex.Flow.ornamentCodes(ornament.type);

      if (ornament.position === 3) {
        ornament.setTextLine(top_text_line);
        top_text_line += (type.between_lines) ? 1 : 1.5;
      } else if (ornament.position=== 4) {
        ornament.setTextLine(bottom_text_line);
        bottom_text_line += (type.between_lines) ? 1 : 1.5;
      } else {
        ornament.setTextLine(text_line);
        text_line += (type.between_lines) ? 1 : 1.5;
      }

      width = ornament.getWidth() > max_width ?
              ornament.getWidth() : max_width;
    }

    state.left_shift += width / 2;
    state.right_shift += width / 2;

    state.text_line = text_line;
    state.top_text_line = top_text_line;
    state.bottom_text_line = bottom_text_line;

    return true;
  };


  Vex.Flow.Ornament.prototype.draw = function () {
    if (!this.context) throw new Vex.RERR("NoContext", "Can't draw Ornament without a context.");
    if (!(this.note && (this.index !== null))) {
      throw new Vex.RERR("NoAttachedNote", "Can't draw Ornament without a note and index.");
    }

    var ctx = this.context;
    var stem_direction = this.note.getStemDirection();
    var stave = this.note.getStave();

    // TODO support bottom ornaments

    // Get stem extents
    var stem_ext = this.note.getStem().getExtents();
    var top, bottom;
    if (stem_direction === Vex.Flow.StaveNote.STEM_DOWN) {
      top = stem_ext.baseY;
      //bottom = stem_ext.topY;
    } else {
      top = stem_ext.topY;
      //bottom = stem_ext.baseY;
    }

    // TabNotes don't have stems attached to them. Tab stems are rendered
    // outside the stave.
    var is_tabnote = this.note.getCategory() === 'tabnotes';
    if (is_tabnote) {
      if (this.note.hasStem()) {
        if (stem_direction === Vex.Flow.StaveNote.STEM_UP) {
          //bottom = stave.getYForBottomText(this.text_line - 2);
        } else if (stem_direction === Vex.Flow.StaveNote.STEM_DOWN) {
          top = stave.getYForTopText(this.text_line - 1.5);
        }
      } else { // Without a stem
        top = stave.getYForTopText(this.text_line - 1);
        //bottom = stave.getYForBottomText(this.text_line - 2);
      }
    }

    var is_on_head = stem_direction === Vex.Flow.StaveNote.STEM_DOWN;
    var spacing = stave.getSpacingBetweenLines();
    var line_spacing = 1;

    // Beamed stems are longer than quarter note stems, adjust accordingly
    if (!is_on_head && this.note.beam) {
      line_spacing += 0.5;
    }

    var total_spacing = spacing * (this.text_line + line_spacing);
    var glyph_y_between_lines = (top - 7) - total_spacing;

    // Get initial coordinates for the modifier position
    var start = this.note.getModifierStartXY(this.position, this.index);
    var glyph_x = start.x + this.ornament.shift_right;
    var glyph_y = Math.min(stave.getYForTopText(this.text_line) - 3, glyph_y_between_lines);
    glyph_y += this.ornament.shift_up + this.y_shift;

    // Ajdust x position if ornament is delayed
    if (this.delayed) {
      glyph_x += this.ornament.width;
      var next_context = Vex.Flow.TickContext.getNextContext(this.note.getTickContext());
      if (next_context) {
        glyph_x += (next_context.getX() - glyph_x) * 0.5;
      } else {
        glyph_x += (stave.x + stave.width - glyph_x) * 0.5;
      }
    }

    var ornament = this;

    function drawAccidental(ctx, code, upper) {
      var acc_mods = {
        "n" : {
          shift_x : 1,
          shift_y_upper : 0,
          shift_y_lower : 0,
          height : 17
        },
        "#" : {
          shift_x : 0,
          shift_y_upper : -2,
          shift_y_lower : -2,
          height : 20
        },
        "b" : {
          shift_x : 1,
          shift_y_upper : 0,
          shift_y_lower : 3,
          height : 18
        },
        "##" : {
          shift_x : 0,
          shift_y_upper : 0,
          shift_y_lower : 0,
          height : 12
        },
        "bb" : {
          shift_x : 0,
          shift_y_upper : 0,
          shift_y_lower : 4,
          height : 17
        },
        "db" : {
          shift_x : -3,
          shift_y_upper : 0,
          shift_y_lower : 4,
          height : 17
        },
        "bbs" : {
          shift_x : 0,
          shift_y_upper : 0,
          shift_y_lower : 4,
          height : 17
        },
        "d" : {
          shift_x : 0,
          shift_y_upper : 0,
          shift_y_lower : 0,
          height : 17
        },
        "++" : {
          shift_x : -2,
          shift_y_upper : -6,
          shift_y_lower : -3,
          height : 22
        },
        "+" : {
          shift_x : 1,
          shift_y_upper : -4,
          shift_y_lower : -2,
          height : 20
        }
      };

      var accidental = Vex.Flow.accidentalCodes(code);

      var acc_x = glyph_x - 3;
      var acc_y = glyph_y + 2;

      var mods = acc_mods[code];

      // Special adjustments for trill glyph
      if (upper) {
        acc_y -= mods ? mods.height : 18;
        acc_y += ornament.type === "tr" ? -8 : 0;
      } else {
        acc_y += ornament.type === "tr" ? -6 : 0;
      }

      // Fine tune position of accidental glyph
      if (mods) {
        acc_x += mods.shift_x;
        acc_y += upper ? mods.shift_y_upper : mods.shift_y_lower;
      }

      // Render the glyph
      var scale = ornament.render_options.font_scale / 1.3;
      Vex.Flow.renderGlyph(ctx, acc_x, acc_y, scale, accidental.code);

      // If rendered a bottom accidental, increase the y value by the
      // accidental height so that the ornament's glyph is shifted up
      if (!upper) {
        glyph_y -= mods ? mods.height : 18;
      }
    }

    // Draw lower accidental for ornament
    if (this.accidental_lower) {
      drawAccidental(ctx, this.accidental_lower, false, glyph_x, glyph_y);
    }

    Vex.Flow.renderGlyph(ctx, glyph_x, glyph_y, this.render_options.font_scale, this.ornament.code);

    // ADDITION:
    this.x = glyph_x;
    this.y = glyph_y;

    // Draw upper accidental for ornament
    if (this.accidental_upper) {
      drawAccidental(ctx, this.accidental_upper, true, glyph_x, glyph_y);
    }

  };

});