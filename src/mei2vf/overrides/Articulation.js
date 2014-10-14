/**
 * Changes:
 * 1) let left justified notes align with note heads on the left
 * 2) use this.text_line * 2 instead of this.text_line as y starting point so annotations don't
 * collide when default font sizes are used
 * 3) increase text_lines of annotations separately for top, bottom and the rest
 */

define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {

  // ## Static Methods
    // Arrange articulations inside `ModifierContext`
  VF.Articulation.format = function(articulations, state) {
    if (!articulations || articulations.length === 0) return false;

    var text_line = state.text_line;
    var max_width = 0;

    var top_text_line = text_line;
    var bottom_text_line = text_line;

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
  }


});