define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {



  // use square breve glyph instead of VexFlow's ||O||
  VF.durationToGlyph.duration_codes['1/2'].type.n = {code_head : "noteheadDoubleWholeSquare"};

  //fallback: remove when the CMN long is implemented in VexFlow
  if (!VF.durationToTicks.durations['1/4']) {
    VF.durationToTicks.durations['1/4'] = VF.RESOLUTION / 0.25;
  }

  // fallback: remove when the CMN long is implemented in VexFlow
  if (!VF.durationToGlyph.duration_codes['1/4']) {
    VF.durationToGlyph.duration_codes['1/4'] = {
      common : {
        head_width : 22,
        stem : false,
        stem_offset : 0,
        flag : false,
        stem_up_extension : -VF.STEM_HEIGHT,
        stem_down_extension : -VF.STEM_HEIGHT,
        gracenote_stem_up_extension : -VF.STEM_HEIGHT,
        gracenote_stem_down_extension : -VF.STEM_HEIGHT,
        tabnote_stem_up_extension : -VF.STEM_HEIGHT,
        tabnote_stem_down_extension : -VF.STEM_HEIGHT,
        dot_shiftY : 0,
        line_above : 0,
        line_below : 0
      },
      type : {
        "n" : { // Longa note
          code_head : "noteheadCMNLonga"
        },
        // the following shapes are not supported with longas
        "h" : { // Breve note harmonic
          code_head : "v59"
        },
        "m" : { // Breve note muted -
          code_head : "vf",
          stem_offset : 0
        },
        "r" : { // Breve rest
          code_head : "v31",
          head_width : 24,
          rest : true,
          position : "B/5",
          dot_shiftY : 0.5
        },
        "s" : { // Breve note slash -
          // Drawn with canvas primitives
          head_width : 15,
          position : "B/4"
        }
      }
    };
  }

  VF.Font.glyphs["noteheadDoubleWholeSquare"] = {
    "x_min" : 0,
    "x_max" : 746,
    "ha" : 746,
    "o" : "0 0 117 0 1 1 560 560 1 -1 0 -1120 m 724 350 b 746 328 736 350 746 340 l 746 -328 b 724 -350 746 -339 736 -350 b 701 -328 711 -350 701 -339 l 701 -270 b 659 -234 701 -253 683 -234 l 83 -234 b 45 -276 67 -234 45 -256 l 45 -328 b 22 -350 45 -339 35 -350 b 0 -328 10 -350 0 -339 l 0 328 b 22 350 0 340 10 350 b 45 328 35 350 45 340 l 45 260 b 77 218 45 260 64 218 l 659 218 b 701 265 679 218 701 232 l 701 328 b 724 350 701 340 711 350 m 45 18 l 45 -36 b 146 -94 45 -70 83 -94 l 606 -94 b 701 -36 664 -94 701 -77 l 701 28 b 606 78 701 57 664 78 l 139 78 b 45 18 71 78 45 59 "
  };
  // NOT PART OF BRAVURA:
  VF.Font.glyphs["noteheadCMNLonga"] = {
    "x_min" : 0,
    "x_max" : 746,
    "ha" : 746,
    // based on the Bravura breve glyph; CHANGES: all values < -1400
    "o" : "0 0 117 0 1 1 560 560 1 -1 0 -1120 " + "m 724 350 " + "b 746 328 736 350 746 340 " + "l 746 -1428 " +
          "b 724 -1450 746 -1439 736 -1450 " + "b 701 -1428 711 -1450 701 -1439 " + "l 701 -270 " +
          "b 659 -234 701 -253 683 -234 " + "l 83 -234 " + "b 45 -276 67 -234 45 -256 " + "l 45 -328 " +
          "b 22 -350 45 -339 35 -350 " + "b 0 -328 10 -350 0 -339 " + "l 0 328 " + "b 22 350 0 340 10 350 " +
          "b 45 328 35 350 45 340 " + "l 45 260 " + "b 77 218 45 260 64 218 " + "l 659 218 " +
          "b 701 265 679 218 701 232 " + "l 701 328 " + "b 724 350 701 340 711 350 " + "m 45 18 " + "l 45 -36 " +
          "b 146 -94 45 -70 83 -94 " + "l 606 -94 " + "b 701 -36 664 -94 701 -77 " + "l 701 28 " +
          "b 606 78 701 57 664 78 " + "l 139 78 " + "b 45 18 71 78 45 59 "
  };

});