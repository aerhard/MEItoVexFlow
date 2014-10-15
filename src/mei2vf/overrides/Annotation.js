/**
 * Changes:
 * 1) draw(): let left justified notes align with note heads on the left
 * 2) format(): take text height into account when calculating text_line
 * 3) format(): increase text_lines of annotations separately for top, bottom and the rest
 */

define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {

  VF.Annotation.prototype.setMeiElement = function (element) {
    this.meiElement = element;
    return this;
  };

  VF.Annotation.prototype.getMeiElement = function () {
    return this.meiElement;
  };


  VF.Annotation.format = function (annotations, state) {
    if (!annotations || annotations.length === 0) return false;

    var text_line = state.text_line;
    var max_width = 0;

    var top_text_line = state.top_text_line;
    if (top_text_line === undefined) top_text_line = text_line;
    var bottom_text_line = state.bottom_text_line;
    if (bottom_text_line === undefined) bottom_text_line = text_line;

    // TODO get this from the stave
    var spacing_between_lines = 10;
    var height_in_lines;

    // Format Annotations
    var width;
    for (var i = 0; i < annotations.length; ++i) {
      var annotation = annotations[i];

      height_in_lines = annotation.font.size / spacing_between_lines * 1.5;

      if (annotation.vert_justification === 1) {
        annotation.setTextLine(top_text_line);
        top_text_line += height_in_lines;
      } else if (annotation.vert_justification === 3) {
        annotation.setTextLine(bottom_text_line);
        bottom_text_line += height_in_lines;
      } else {
        annotation.setTextLine(text_line);
        text_line += height_in_lines;
      }

      width = annotation.getWidth() > max_width ? annotation.getWidth() : max_width;
    }

    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  }


  VF.Annotation.prototype.draw = function () {

    // START ADDITION
    var Annotation = VF.Annotation;
    var Modifier = VF.Modifier;
    // END ADDITION

    if (!this.context) throw new Vex.RERR("NoContext", "Can't draw text annotation without a context.");
    if (!this.note) throw new Vex.RERR("NoNoteForAnnotation", "Can't draw text annotation without an attached note.");

    var start = this.note.getModifierStartXY(Modifier.Position.ABOVE, this.index);

    // We're changing context parameters. Save current state.
    this.context.save();
    this.context.setFont(this.font.family, this.font.size, this.font.weight);
    var text_width = this.context.measureText(this.text).width;

    // Estimate text height to be the same as the width of an 'm'.
    //
    // This is a hack to work around the inability to measure text height
    // in HTML5 Canvas (and SVG).
    var text_height = this.context.measureText("m").width;
    var x, y;

    if (this.justification == Annotation.Justify.LEFT) {
      // START MODIFIFICATION
      //x = start.x;
      x = this.note.getAbsoluteX();
      // END MODIFICATION
    } else if (this.justification == Annotation.Justify.RIGHT) {
      x = start.x - text_width;
    } else if (this.justification == Annotation.Justify.CENTER) {
      x = start.x - text_width / 2;
    } else /* CENTER_STEM */ {
      x = this.note.getStemX() - text_width / 2;
    }

    var stem_ext, spacing;
    var has_stem = this.note.hasStem();
    var stave = this.note.getStave();

    // The position of the text varies based on whether or not the note
    // has a stem.
    if (has_stem) {
      stem_ext = this.note.getStem().getExtents();
    }
    spacing = stave.getSpacingBetweenLines();

    // TODO check - spacing is not initialized when has_stem is false. does it need a default value
    // or is has_stem always true?

    if (this.vert_justification == Annotation.VerticalJustify.BOTTOM) {
      y = stave.getYForBottomText(this.text_line);
      if (has_stem) {
        var stem_base = (this.note.getStemDirection() === 1 ? stem_ext.baseY : stem_ext.topY);
        y = Math.max(y, stem_base + (spacing * ((this.text_line) + 2)));
      }

    } else if (this.vert_justification == Annotation.VerticalJustify.CENTER) {
      var yt = this.note.getYForTopText(this.text_line) - 1;
      var yb = stave.getYForBottomText(this.text_line);
      y = yt + ( yb - yt ) / 2 + text_height / 2;

    } else if (this.vert_justification == Annotation.VerticalJustify.TOP) {
      y = Math.min(stave.getYForTopText(this.text_line), this.note.getYs()[0] - 10);
      if (has_stem) {
        y = Math.min(y, (stem_ext.topY - 5) - (spacing * this.text_line));
      }
    } else /* CENTER_STEM */{
      var extents = this.note.getStemExtents();
      y = extents.topY + (extents.baseY - extents.topY) / 2 + text_height / 2;
    }


    // START ADDITION
    this.x = x;
    this.y = y;
    this.text_height = text_height;
    this.text_width = text_width;
    // END ADDITION


    this.context.fillText(this.text, x, y);
    this.context.restore();
  };


});