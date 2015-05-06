/**
 * Changes:
 * 1) set volta start x to measure start even if it's not the first stave modifier (e.g. when
 * a new system starts with a volta
 */

define([
    'vex'
], function (Vex) {

  Vex.Flow.Volta.prototype.draw = function (stave, x) {

    x-=stave.getModifierXShift();

    var Volta = Vex.Flow.Volta;

    if (!stave.context) throw new Vex.RERR("NoCanvasContext", "Can't draw stave without canvas context.");
    var ctx = stave.context;
    var width = stave.width;
    var top_y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
    var vert_height = 1.5 * stave.options.spacing_between_lines_px;
    switch (this.volta) {
      case Vex.Flow.Volta.type.BEGIN:
        ctx.fillRect(this.x + x, top_y, 1, vert_height);
        break;
      case Vex.Flow.Volta.type.END:
        width -= 5;
        ctx.fillRect(this.x + x + width, top_y, 1, vert_height);
        break;
      case Vex.Flow.Volta.type.BEGIN_END:
        width -= 3;
        ctx.fillRect(this.x + x, top_y, 1, vert_height);
        ctx.fillRect(this.x + x + width, top_y, 1, vert_height);
        break;
    }
    // If the beginning of a volta, draw measure number
    if (this.volta == Volta.type.BEGIN || this.volta == Volta.type.BEGIN_END) {
      ctx.save();
      ctx.setFont(this.font.family, this.font.size, this.font.weight);
      ctx.fillText(this.number, this.x + x + 5, top_y + 15);
      ctx.restore();
    }
    ctx.fillRect(this.x + x, top_y, width, 1);
    return this;
  };


});