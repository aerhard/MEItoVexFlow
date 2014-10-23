/**
 * VexFlow extension to support tremolos not only on down- but also on up-stems
 */

define([
  'vexflow',
  'vex'
], function (VF, Vex) {

  VF.Tremolo.prototype.draw = function () {
    if (!this.context) throw new Vex.RERR("NoContext", "Can't draw Tremolo without a context.");
    if (!(this.note && (this.index != null))) {
      throw new Vex.RERR("NoAttachedNote", "Can't draw Tremolo without a note and index.");
    }


    var stem = this.note.getStem();

    var start, x, y;

    if (this.note.duration === 'w') {
      x = (stem.x_end + stem.x_begin) / 2;
      if (stem.stem_direction === 1) {
        y = stem.getExtents().topY - (this.y_spacing * this.num / 2) + stem.stem_extension;
      } else {
        start = this.note.getModifierStartXY(this.position, this.index);
        y = start.y;
      }
    } else if (stem.stem_direction === 1) {
      x = stem.x_end;
      y = stem.getExtents().topY - (this.y_spacing * this.num / 2);
    } else {
      start = this.note.getModifierStartXY(this.position, this.index);
      x = start.x; // or stem.x_begin
      y = start.y;
    }

    x += this.shift_right;
    for (var i = 0; i < this.num; ++i) {
      Vex.Flow.renderGlyph(this.context, x, y, this.render_options.font_scale, this.code);
      y += this.y_spacing;
    }
  };

});