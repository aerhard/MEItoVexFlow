define([
    'vex'
], function (Vex) {

  Vex.Flow.articulationCodes.articulations['a^b'] = {   // Marcato below
    code : "v16",
    width : 8,
    shift_right : 0,
    shift_up : 6,
    shift_down : 8,
    between_lines : false
  };

  Vex.Flow.articulationCodes.articulations['avb'] = {   // Staccatissimo below
    code : "v66",
    width : 4,
    shift_right : 0,
    shift_up : 3,
    shift_down : -3,
    between_lines : true
  };


  Vex.Flow.Font.glyphs['v66'] = {
    "x_min" : -73.5,
    "x_max" : 72.140625,
    "ha" : 74,
    "o" : "m -36 -126 b 0 0 -17 -56 -1 0 b 70 -254 0 0 70 -249 l 72 -255 l 0 -255 l -73 -255 l -72 -254 b -36 -126 -72 -254 -55 -195 "
  };

  Vex.Flow.Font.glyphs['v16'] = {
    "x_min" : -155.171875,
    "x_max" : 153.8125,
    "ha" : 157,
    "o" : "m -137 353 b -129 355 -134 353 -132 355 b -102 333 -118 355 -111 348 b -8 129 -63 273 -32 205 b 0 106 -4 116 -1 106 b 6 129 0 106 2 116 b 100 333 31 205 62 273 b 114 349 107 344 108 347 b 127 353 118 352 123 353 b 153 327 141 353 153 344 b 144 302 153 320 153 317 b 29 18 96 227 54 123 l 25 -4 b -1 -26 21 -19 13 -26 b -27 -4 -14 -26 -23 -19 l -31 18 b -145 302 -55 123 -98 227 b -155 327 -155 317 -155 320 b -137 353 -155 340 -148 349 "
  };

  // use square breve glyph instead of VexFlow's ||O||
  Vex.Flow.durationToGlyph.duration_codes['1/2'].type.n = {code_head : "noteheadDoubleWholeSquare"};

  //fallback: remove when the CMN long is implemented in VexFlow
  if (!Vex.Flow.durationToTicks.durations['1/4']) {
    Vex.Flow.durationToTicks.durations['1/4'] = Vex.Flow.RESOLUTION / 0.25;
  }

  // fallback: remove when the CMN long is implemented in VexFlow
  if (!Vex.Flow.durationToGlyph.duration_codes['1/4']) {
    Vex.Flow.durationToGlyph.duration_codes['1/4'] = {
      common : {
        head_width : 22,
        stem : false,
        stem_offset : 0,
        flag : false,
        stem_up_extension : -Vex.Flow.STEM_HEIGHT,
        stem_down_extension : -Vex.Flow.STEM_HEIGHT,
        gracenote_stem_up_extension : -Vex.Flow.STEM_HEIGHT,
        gracenote_stem_down_extension : -Vex.Flow.STEM_HEIGHT,
        tabnote_stem_up_extension : -Vex.Flow.STEM_HEIGHT,
        tabnote_stem_down_extension : -Vex.Flow.STEM_HEIGHT,
        dot_shiftY : 0,
        line_above : 0,
        line_below : 0
      }, type : {
        "n" : { // Longa note
          code_head : "noteheadCMNLonga"
        }, // the following shapes are not supported with longas
        "h" : { // Breve note harmonic
          code_head : "v59"
        }, "m" : { // Breve note muted -
          code_head : "vf", stem_offset : 0
        }, "r" : { // Breve rest
          code_head : "v31", head_width : 24, rest : true, position : "B/5", dot_shiftY : 0.5
        }, "s" : { // Breve note slash -
          // Drawn with canvas primitives
          head_width : 15, position : "B/4"
        }
      }
    };
  }

  Vex.Flow.Font.glyphs["noteheadDoubleWholeSquare"] = {
    "x_min" : 0,
    "x_max" : 746,
    "ha" : 746,
    "o" : "0 0 117 0 1 1 560 560 1 -1 0 -1120 m 724 350 b 746 328 736 350 746 340 l 746 -328 b 724 -350 746 -339 736 -350 b 701 -328 711 -350 701 -339 l 701 -270 b 659 -234 701 -253 683 -234 l 83 -234 b 45 -276 67 -234 45 -256 l 45 -328 b 22 -350 45 -339 35 -350 b 0 -328 10 -350 0 -339 l 0 328 b 22 350 0 340 10 350 b 45 328 35 350 45 340 l 45 260 b 77 218 45 260 64 218 l 659 218 b 701 265 679 218 701 232 l 701 328 b 724 350 701 340 711 350 m 45 18 l 45 -36 b 146 -94 45 -70 83 -94 l 606 -94 b 701 -36 664 -94 701 -77 l 701 28 b 606 78 701 57 664 78 l 139 78 b 45 18 71 78 45 59 "
  };
  // NOT PART OF BRAVURA:
  Vex.Flow.Font.glyphs["noteheadCMNLonga"] = {
    "x_min" : 0, "x_max" : 746, "ha" : 746, // based on the Bravura breve glyph; CHANGES: all values < -1400
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