define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {


  // Vex Flow Notation
  // Implements key signatures
  //
  // Requires vex.js.

  VF.StaveNote.prototype.getTieRightX = function () {
    var tieStartX = this.getAbsoluteX();
    tieStartX += this.glyph.head_width + this.x_shift + this.extraRightPx;
    //if (this.modifierContext) tieStartX += this.modifierContext.getExtraRightPx();
    return tieStartX;
  };

  VF.StaveNote.prototype.getYForBottomText = function (text_line) {
    var extents = this.getStemExtents();
    return Vex.Max(this.stave.getYForBottomText(text_line), extents.baseY +
                                                            (this.render_options.annotation_spacing * (text_line + 1)));
  };

});