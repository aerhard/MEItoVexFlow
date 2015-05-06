define([
    'vex'
], function (Vex) {

  Vex.Flow.ClefNote.prototype.setMeiElement = function (element) {
    this.meiElement = element;
    return this;
  };
  Vex.Flow.ClefNote.prototype.getMeiElement = function () {
    return this.meiElement;
  };



  //######## start addition
  Vex.Flow.ClefNote.prototype.setOffsetLeft = function (offset) {
    this.offsetLeft = offset;
  };
  //######### end addition

  Vex.Flow.ClefNote.prototype.draw = function () {
    if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");

    if (!this.glyph.getContext()) {
      this.glyph.setContext(this.context);
    }
    var abs_x = this.getAbsoluteX() - (this.offsetLeft || 0);

    this.glyph.setStave(this.stave);
    this.glyph.setYShift(this.stave.getYForLine(this.clef.line) - this.stave.getYForGlyphs());

    // ##########START MODIFICATION
    this.glyph.renderToStave(abs_x);
    // ##########END MODIFICATION

    // If the Vex.Flow.Clef has an annotation, such as 8va, draw it.
    if (this.clef_obj.annotation !== undefined) {
      var attachment = new Vex.Flow.Glyph(this.clef_obj.annotation.code, this.clef_obj.annotation.point);
      if (!attachment.getContext()) {
        attachment.setContext(this.context);
      }
      attachment.setStave(this.stave);
      attachment.setYShift(this.stave.getYForLine(this.clef_obj.annotation.line) - this.stave.getYForGlyphs());
      attachment.setXShift(this.clef_obj.annotation.x_shift);
      attachment.renderToStave(abs_x);
    }

  };

});