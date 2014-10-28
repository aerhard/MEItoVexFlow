/*
 * MEItoVexFlow, Syllable class
 * a modified version on VexFlow's annotation.js
 *
 * Authors: Zoltan Komives, Alexander Erhard
 */

// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
define([
  'vexflow',
  'vex'
], function (VF, Vex) {


  var Syllable = function (text, element, font) {
    this.init(text);
    this.setFont(font.family, font.size, font.weight);
    this.setMeiElement(element);
    this.setLineSpacing(font.spacing);
  };

  Syllable.CATEGORY = "annotations";

  // To enable logging for this class. Set `Vex.Flow.Syllable.DEBUG` to `true`.
  function L() {
    if (Syllable.DEBUG) Vex.L("Vex.Flow.Syllable", arguments);
  }

  // START ADDITION
  Syllable.DEFAULT_FONT_SIZE = 10;
  // END ADDITION

  // Text annotations can be positioned and justified relative to the note.
  Syllable.Justify = {
    LEFT : 1,
    CENTER : 2,
    RIGHT : 3,
    CENTER_STEM : 4
  };

  Syllable.VerticalJustify = {
    TOP : 1,
    BOTTOM : 3
  };

  // Arrange annotations within a `ModifierContext`
  Syllable.format = function (annotations, state) {
    if (!annotations || annotations.length === 0) return false;

    var text_line = state.text_line;
    var max_width = 0;

    // Format Syllables
    var width;
    for (var i = 0; i < annotations.length; ++i) {
      var annotation = annotations[i];
      annotation.setTextLine(text_line);
      width = annotation.getWidth() > max_width ? annotation.getWidth() : max_width;
      text_line++;
    }

    state.left_shift += width / 2;
    state.right_shift += width / 2;
    return true;
  };

  // ## Prototype Methods
  //
  // Syllables inherit from `Modifier` and are positioned correctly when
  // in a `ModifierContext`.
  var Modifier = VF.Modifier;

  Vex.Inherit(Syllable, Modifier, {
    // Create a new `Syllable` with the string `text`.
    init : function (text) {
      Syllable.superclass.init.call(this);

      this.note = null;
      this.index = null;
      this.text_line = 0;
      this.text = text;
      this.justification = Syllable.Justify.CENTER;
      // START MODIFICATION
      this.vert_justification = Syllable.VerticalJustify.BOTTOM;
      // END MODIFICATION
      this.font = {
        family : "Arial",
        // START MODIFICATION
        size : Syllable.DEFAULT_FONT_SIZE,
        // END MODIFICATION
        weight : ""
      };

      // START ADDITION
      // Line spacing, relative to font size
      this.line_spacing = 1.1;
      // END ADDITiON

      // The default width is calculated from the text.
      this.setWidth(VF.textWidth(text));
    },

    // START ADDITION
     setMeiElement : function (element) {
      this.meiElement = element;
      return this;
    },

    getMeiElement : function () {
      return this.meiElement;
    },

    setLineSpacing : function (spacing) {
      this.line_spacing = spacing;
      return this;
    },
    // END ADDITiON

    // Set the vertical position of the text relative to the stave.
    setTextLine : function (line) {
      this.text_line = line;
      return this;
    },

    // Set font family, size, and weight. E.g., `Arial`, `10pt`, `Bold`.
    setFont : function (family, size, weight) {
      this.font = { family : family, size : size, weight : weight };
      return this;
    },

    // Set vertical position of text (above or below stave). `just` must be
    // a value in `Syllable.VerticalJustify`.
    setVerticalJustification : function (just) {
      this.vert_justification = just;
      return this;
    },

    // Get and set horizontal justification. `justification` is a value in
    // `Syllable.Justify`.
    getJustification : function () {
      return this.justification;
    },
    setJustification : function (justification) {
      this.justification = justification;
      return this;
    },

    preProcess : function () {

      var PADDING = 5;

      var y;

      var stem_ext, spacing;
      var has_stem = this.note.hasStem();
      var stave = this.note.getStave();

      // The position of the text varies based on whether or not the note
      // has a stem.
      if (has_stem) {
        stem_ext = this.note.getStem().getExtents();
        spacing = stave.getSpacingBetweenLines();
      }

      // START ADDITION
      var font_scale = this.font.size / Syllable.DEFAULT_FONT_SIZE * this.line_spacing;
      // END ADDITION

      if (this.vert_justification == Syllable.VerticalJustify.BOTTOM) {
        y = stave.getYForBottomText(this.text_line);
        if (has_stem) {
          var stem_base = (this.note.getStemDirection() === 1 ? stem_ext.baseY + 2 * PADDING : stem_ext.topY + PADDING);

          // START MODIFICATION
          y = Math.max(y, stem_base + ( spacing * (this.text_line + 1) * font_scale + ( spacing * (this.text_line) ) ));
          // END MODIFICATION
        }

        // TODO refactor top text, too
      } else if (this.vert_justification == Syllable.VerticalJustify.TOP) {
        y = Math.min(stave.getYForTopText(this.text_line), this.note.getYs()[0] - 10);
        if (has_stem) {
          y = Math.min(y, (stem_ext.topY - 5) - (spacing * this.text_line));
        }
      }

      this.y = y;
      return y;
    },

    setY : function (y) {
      this.y = y;
    },

    // Render text beside the note.
    draw : function () {
      if (!this.context) throw new Vex.RERR("NoContext", "Can't draw text annotation without a context.");
      if (!this.note) throw new Vex.RERR("NoNoteForSyllable", "Can't draw text annotation without an attached note.");

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

      if (this.justification == Syllable.Justify.LEFT) {
        x = start.x;
      } else if (this.justification == Syllable.Justify.RIGHT) {
        x = start.x - text_width;
      } else if (this.justification == Syllable.Justify.CENTER) {
        x = start.x - text_width / 2;
      } else /* CENTER_STEM */ {
        x = this.note.getStemX() - text_width / 2;
      }

      // START ADDITION
      this.x = x;

      y = this.y;

      this.text_height = text_height;
      this.text_width = text_width;
      // END ADDITION

      L("Rendering annotation: ", this.text, x, y);
      this.context.fillText(this.text, x, y);
      this.context.restore();
    }
  });

  return Syllable;

});
