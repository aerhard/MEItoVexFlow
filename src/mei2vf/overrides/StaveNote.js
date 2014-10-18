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


  // TODO modify to draw lines for whole/half rests outside of the staff system
//  // Draw the ledger lines between the stave and the highest/lowest keys
//  drawLedgerLines: function(){
//    if (this.isRest()) { return; }
//    if (!this.context) throw new Vex.RERR("NoCanvasContext",
//      "Can't draw without a canvas context.");
//    var ctx = this.context;
//
//    var bounds = this.getNoteHeadBounds();
//    var highest_line = bounds.highest_line;
//    var lowest_line = bounds.lowest_line;
//    var head_x = this.note_heads[0].getAbsoluteX();
//
//    var that = this;
//    function stroke(y) {
//      if (that.use_default_head_x === true)  {
//        head_x = that.getAbsoluteX() + that.x_shift;
//      }
//      var x = head_x - that.render_options.stroke_px;
//      var length = ((head_x + that.glyph.head_width) - head_x) +
//                   (that.render_options.stroke_px * 2);
//
//      ctx.fillRect(x, y, length, 1);
//    }
//
//    var line; // iterator
//    for (line = 6; line <= highest_line; ++line) {
//      stroke(this.stave.getYForNote(line));
//    }
//
//    for (line = 0; line >= lowest_line; --line) {
//      stroke(this.stave.getYForNote(line));
//    }
//  };


});