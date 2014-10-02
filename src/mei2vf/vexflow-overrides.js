define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {

  VF.Tremolo.prototype.draw = function () {
    if (!this.context) throw new Vex.RERR("NoContext",
      "Can't draw Tremolo without a context.");
    if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
      "Can't draw Tremolo without a note and index.");


    var stem = this.note.getStem();

    var start, x,y;

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
      Vex.Flow.renderGlyph(this.context, x, y,
        this.render_options.font_scale, this.code);
      y += this.y_spacing;
    }
  };


  VF.Annotation.prototype.setMeiElement = function (element) {
    this.meiElement = element;
    return this;
  };
  VF.Annotation.prototype.getMeiElement = function () {
    return this.meiElement;
  };
  VF.Articulation.prototype.setMeiElement = function (element) {
    this.meiElement = element;
    return this;
  };
  VF.Articulation.prototype.getMeiElement = function () {
    return this.meiElement;
  };


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

  //######## start addition
  VF.ClefNote.prototype.setOffsetLeft = function (offset) {
    this.offsetLeft = offset;
  };
  //######### end addition

  VF.ClefNote.prototype.draw = function () {
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

    // If the VF.Clef has an annotation, such as 8va, draw it.
    if (this.clef_obj.annotation !== undefined) {
      var attachment = new VF.Glyph(this.clef_obj.annotation.code, this.clef_obj.annotation.point);
      if (!attachment.getContext()) {
        attachment.setContext(this.context);
      }
      attachment.setStave(this.stave);
      attachment.setYShift(this.stave.getYForLine(this.clef_obj.annotation.line) - this.stave.getYForGlyphs());
      attachment.setXShift(this.clef_obj.annotation.x_shift);
      attachment.renderToStave(abs_x);
    }

  };


  // [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
  // Author: Cyril Silverman
  //
  // ## Description
  //
  // This file implements key signatures. A key signature sits on a stave
  // and indicates the notes with implicit accidentals.
  VF.KeySignature = (function () {
    // MODIFIED: ADDED PARAMETER
    function KeySignature(keySpec, customPadding) {
      // MODIFIED: ADDED PARAMETER
      if (arguments.length > 0) this.init(keySpec, customPadding);
    }

    // Space between natural and following accidental depending
    // on vertical position
    KeySignature.accidentalSpacing = {
      '#' : {
        above : 6,
        below : 4
      },
      'b' : {
        above : 4,
        below : 7
      },
      'n' : {
        above : 3,
        below : -1
      }
    };

    // ## Prototype Methods
    Vex.Inherit(KeySignature, VF.StaveModifier, {
      // Create a new Key Signature based on a `key_spec`
      // MODIFIED: ADDED PARAMETER
      init : function (key_spec, customPadding) {
        KeySignature.superclass.init();

        // MODIFIED: added 2 lines
        var padding = customPadding || 10;
        this.setPadding(padding);

        this.glyphFontScale = 38; // TODO(0xFE): Should this match StaveNote?
        this.accList = VF.keySignature(key_spec);
      },

      // Add an accidental glyph to the `stave`. `acc` is the data of the
      // accidental to add. If the `next` accidental is also provided, extra
      // width will be added to the initial accidental for optimal spacing.
      addAccToStave : function (stave, acc, next) {
        var glyph_data = VF.accidentalCodes(acc.type);
        var glyph = new VF.Glyph(glyph_data.code, this.glyphFontScale);

        // Determine spacing between current accidental and the next accidental
        var extra_width = 0;
        if (acc.type === "n" && next) {
          var above = next.line >= acc.line;
          var space = KeySignature.accidentalSpacing[next.type];
          extra_width = above ? space.above : space.below;
        }

        // Set the width and place the glyph on the stave
        glyph.setWidth(glyph_data.width + extra_width);
        this.placeGlyphOnLine(glyph, stave, acc.line);
        stave.addGlyph(glyph);
      },

      // Cancel out a key signature provided in the `spec` parameter. This will
      // place appropriate natural accidentals before the key signature.
      cancelKey : function (spec) {
        // Get the accidental list for the cancelled key signature
        var cancel_accList = VF.keySignature(spec);

        // If the cancelled key has a different accidental type, ie: # vs b
        var different_types = this.accList.length > 0 && cancel_accList[0].type !== this.accList[0].type;

        // Determine how many naturals needed to add
        var naturals = 0;
        if (different_types) {
          naturals = cancel_accList.length;
        } else {
          naturals = cancel_accList.length - this.accList.length;
        }

        // Return if no naturals needed
        if (naturals < 1) return;

        // Get the line position for each natural
        var cancelled = [];
        for (var i = 0; i < naturals; i++) {
          var index = i;
          if (!different_types) {
            index = cancel_accList.length - naturals + i;
          }

          var acc = cancel_accList[index];
          cancelled.push({type : "n", line : acc.line});
        }

        // Combine naturals with main accidental list for the key signature
        this.accList = cancelled.concat(this.accList);

        return this;
      },

      // Add the key signature to the `stave`. You probably want to use the
      // helper method `.addToStave()` instead
      addModifier : function (stave) {
        this.convertAccLines(stave.clef, this.accList[0].type);
        for (var i = 0; i < this.accList.length; ++i) {
          this.addAccToStave(stave, this.accList[i], this.accList[i + 1]);
        }
      },

      // Add the key signature to the `stave`, if it's the not the `firstGlyph`
      // a spacer will be added as well.
      addToStave : function (stave, firstGlyph) {
        if (this.accList.length === 0) {
          return this;
        }

        if (!firstGlyph) {
          stave.addGlyph(this.makeSpacer(this.padding));
        }

        this.addModifier(stave);
        return this;
      },

      // Apply the accidental staff line placement based on the `clef` and
      // the  accidental `type` for the key signature ('# or 'b').
      convertAccLines : function (clef, type) {
        var offset = 0.0; // if clef === "treble"

        var sharps;
        var isTenorSharps = !!((clef === "tenor" || clef === 'subbass') && (type === "#"));
        var isSopranoSharps = !!((clef === 'soprano') && (type === "#"));
        var isBaritoneSharps = !!((clef === 'baritone-f' || clef === 'baritone-c') && (type === "#"));


        var isSopranoFlats = !!((clef === 'soprano' || clef === 'baritone-c' || clef === 'baritone-f') &&
                                (type === "b"));
        var isMezzoSopranoFlats = !!((clef === 'mezzo-soprano') && (type === "b"));

        // no shift: treble
        // only shift: bass, french, alto
        // sequence flats:  (baritone-c, baritone-f, soprano), (mezzo-soprano)
        // sequence sharps: (baritone-c, baritone-f), (soprano), (tenor, subbass)
        // # tenor


        switch (clef) {
          case "bass":
            offset = 1;
            break;
          case 'french':
            offset = 1;
            break;
          case "alto":
            offset = 0.5;
            break;

          case "tenor":
            offset = -0.5;
            break;


          case 'mezzo-soprano':
            offset = 1.5;
            break;

          case 'soprano':
            offset = -1;
            break;

          case 'baritone-f':
            offset = -1.5;
            break;
          case 'baritone-c':
            offset = -1.5;
            break;
        }

        // Special-case for sharps
        var i;
        if (isTenorSharps) {
          sharps = [
            3.5,
            1.5,
            3,
            1,
            2.5,
            0.5,
            2
          ];
          for (i = 0; i < this.accList.length; ++i) {
            this.accList[i].line = sharps[i] + offset;
          }
        } else if (isSopranoSharps) {
          sharps = [
            3.5,
            5,
            3,
            4.5,
            2.5,
            4,
            2
          ];
          for (i = 0; i < this.accList.length; ++i) {
            this.accList[i].line = sharps[i] + offset;
          }
        } else if (isSopranoFlats) {
          sharps = [
            2,
            4,
            2.5,
            4.5,
            3,
            5,
            3.5
          ];
          for (i = 0; i < this.accList.length; ++i) {
            this.accList[i].line = sharps[i] + offset;
          }
        } else if (isMezzoSopranoFlats) {
          sharps = [
            2,
            0.5,
            -1,
            1,
            -0.5,
            1.5,
            0
          ];
          for (i = 0; i < this.accList.length; ++i) {
            this.accList[i].line = sharps[i] + offset;
          }
        } else if (isBaritoneSharps) {
          sharps = [
            3.5,
            1.5,
            3,
            1,
            2.5,
            4,
            2
          ];
          for (i = 0; i < this.accList.length; ++i) {
            this.accList[i].line = sharps[i] + offset;
          }
        } else {
          if (clef != "treble") {
            for (i = 0; i < this.accList.length; ++i) {
              this.accList[i].line += offset;
            }
          }
        }
      }
    });

    return KeySignature;
  }());

  /**
   * Create hyphens between the specified annotations.
   *
   * @constructor
   */
  VF.Hyphen = ( function () {
    function Hyphen(config) {
      if (arguments.length > 0) {
        this.init(config);
      }
    };

    Hyphen.prototype = {
      init : function (config) {
        /**
         * config is a struct that has:
         *
         *  {
         *    first_annot: Annotation or any other object with an x (and optional
         * y) property,
         *    last_annot: Annotation or any other object with an x (and optional
         * y) property,
         *    NOTE: either first_annot or last_annot must have an y property
         *    (optional) max_hyphen_distance: the maximum distance between two
         * hyphens
         *    (optional) hyphen_width: the width of the hyphen character to draw
         *  }
         *
         **/

        this.max_hyphen_distance = config.max_hyphen_distance || 75;
        this.font = {
          family : "Arial",
          size : 10,
          style : ""
        };

        this.config = config;
        this.context = null;

      },

      setContext : function (context) {
        this.context = context;
        return this;
      },

      setFont : function (font) {
        this.font = font;
        return this;
      },

      renderHyphen : function () {
        var cfg = this.config;
        var ctx = this.context;
        var hyphen_width = cfg.hyphen_width || ctx.measureText('-').width;

        var first = cfg.first_annot;
        var last = cfg.last_annot;

        var start_x = (first.text) ? first.x + first.text_width : first.x;
        var end_x = last.x;

        var distance = end_x - start_x;

        if (distance > hyphen_width) {
          var y = (first.y && last.y) ? (first.y + last.y) / 2 : first.y || last.y;
          var hyphen_count = Math.ceil(distance / this.max_hyphen_distance);
          var single_width = distance / (hyphen_count + 1);
          while (hyphen_count--) {
            start_x += single_width;
            ctx.fillText('-', start_x - hyphen_width / 2, y);
          }
        }
      },

      draw : function () {
        if (!this.context) {
          throw new Vex.RERR("NoContext", "No context to render hyphens.");
        }
        var ctx = this.context;
        ctx.save();
        ctx.setFont(this.font.family, this.font.size, this.font.style);
        this.renderHyphen();
        ctx.restore();
        return true;
      }
    };

    return Hyphen;
  }());


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


  VF.Curve.prototype.renderCurve = function (params) {
    var ctx = this.context;
    var cps = this.render_options.cps;

    var x_shift = this.render_options.x_shift;
    var y_shift = this.render_options.y_shift * params.direction;

    // TODO name variables according to staveTie
    // START MODIFICATION (allows to specify y_shift for start & end
    // note separately):
    var y_shift_start = this.render_options.y_shift_start || 0;
    var y_shift_end = this.render_options.y_shift_end || 0;
    var first_x = params.first_x + x_shift;
    var first_y = params.first_y + y_shift + y_shift_start;
    var last_x = params.last_x - x_shift;
    var last_y = params.last_y + y_shift + y_shift_end;
    // END MODIFICATION

    var thickness = this.render_options.thickness;

    var cp_spacing = (last_x - first_x) / (cps.length + 2);

    ctx.beginPath();
    ctx.moveTo(first_x, first_y);
    ctx.bezierCurveTo(first_x + cp_spacing + cps[0].x, first_y + (cps[0].y * params.direction), last_x - cp_spacing +
                                                                                                cps[1].x, last_y +
                                                                                                          (cps[1].y *
                                                                                                           params.direction), last_x, last_y);
    ctx.bezierCurveTo(last_x - cp_spacing + cps[1].x, last_y + ((cps[1].y + thickness) * params.direction), first_x +
                                                                                                            cp_spacing +
                                                                                                            cps[0].x, first_y +
                                                                                                                      ((cps[0].y +
                                                                                                                        thickness) *
                                                                                                                       params.direction), first_x, first_y);
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
  };


  VF.Curve.prototype.draw = function () {
    //#######start addition
    var Curve = VF.Curve;
    //###########end addition


    if (!this.context) {
      throw new Vex.RERR("NoContext", "No context to render tie.");
    }
    var first_note = this.from;
    var last_note = this.to;
    var first_x, last_x, first_y, last_y, stem_direction;

    var metric = "baseY";
    var end_metric = "baseY";
    var position = this.render_options.position;
    var position_end = this.render_options.position_end;

    if (position === Curve.Position.NEAR_TOP) {
      metric = "topY";
      end_metric = "topY";
    }

    if (position_end == Curve.Position.NEAR_HEAD) {
      end_metric = "baseY";
    } else if (position_end == Curve.Position.NEAR_TOP) {
      end_metric = "topY";
    }

    if (first_note) {
      first_x = first_note.getTieRightX();
      stem_direction = first_note.getStemDirection();
      first_y = first_note.getStemExtents()[metric];
    } else {
      // ##### START MODIFICATION
      first_x = last_note.getStave().getSlurStartX();
      // ##### END MODIFICATION
      first_y = last_note.getStemExtents()[metric];
    }

    if (last_note) {
      last_x = last_note.getTieLeftX();
      stem_direction = last_note.getStemDirection();
      last_y = last_note.getStemExtents()[end_metric];
    } else {
      // ##### START MODIFICATION
      last_x = first_note.getStave().getSlurEndX();
      // ##### END MODIFICATION
      last_y = first_note.getStemExtents()[end_metric];
    }

    this.renderCurve({
      first_x : first_x,
      last_x : last_x,
      first_y : first_y,
      last_y : last_y,
      direction : stem_direction * (this.render_options.invert === true ? -1 : 1)
    });
    return true;
  };






  VF.Annotation.prototype.draw = function () {
    if (!this.context) throw new Vex.RERR("NoContext", "Can't draw text annotation without a context.");
    if (!this.note) throw new Vex.RERR("NoNoteForAnnotation", "Can't draw text annotation without an attached note.");

    // START ADDITION
    var Annotation = VF.Annotation;
    var Modifier = VF.Modifier;
    var L = function () {
    };
    // END ADDITION


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
      x = start.x;
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

      spacing = stave.getSpacingBetweenLines();
    }

    // START ADDITION
    var PADDING = 5;
    // END ADDITION

    if (this.vert_justification == Annotation.VerticalJustify.BOTTOM) {

      y = stave.getYForBottomText(this.text_line);
      if (has_stem) {

        // START MODIFICATION
        var stem_base = (this.note.getStemDirection() === 1 ? stem_ext.baseY + 2 * PADDING : stem_ext.topY + PADDING);
        // END MODIFICATION

        y = Math.max(y, stem_base + (spacing * (this.text_line + 2)));
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


    L("Rendering annotation: ", this.text, x, y);
    this.context.fillText(this.text, x, y);
    this.context.restore();
  };










  // VexFlow - Music Engraving for HTML5
  // Copyright Mohit Muthanna 2010
  //
  // This class implements varies types of ties between contiguous notes. The
  // ties include: regular ties, hammer ons, pull offs, and slides.

  /**
   * Create a new tie from the specified notes. The notes must
   * be part of the same line, and have the same duration (in ticks).
   *
   * @constructor
   * @param {!Object} context The canvas context.
   * @param {!Object} notes The notes to tie up.
   * @param {!Object} Options
   */
  VF.StaveTie = ( function () {
    function StaveTie(notes, text) {
      if (arguments.length > 0) {
        this.init(notes, text);
      }
    }


    StaveTie.prototype = {
      init : function (notes, text) {
        /**
         * Notes is a struct that has:
         *
         *  {
         *    first_note: Note,
         *    last_note: Note,
         *    first_indices: [n1, n2, n3],
         *    last_indices: [n1, n2, n3]
         *  }
         *
         **/
        this.notes = notes;
        this.context = null;
        this.text = text;

        this.render_options = {
          cp1 : 8, // Curve control point 1
          cp2 : 12, // Curve control point 2
          text_shift_x : 0,
          first_x_shift : 0,
          last_x_shift : 0,
          y_shift : 7,
          tie_spacing : 0,
          font : {
            family : "Arial",
            size : 10,
            style : ""
          }
        };

        this.font = this.render_options.font;
        this.setNotes(notes);
      },

      setContext : function (context) {
        this.context = context;
        return this;
      },
      setFont : function (font) {
        this.font = font;
        return this;
      },

      /**
       * Set the notes to attach this tie to.
       *
       * @param {!Object} notes The notes to tie up.
       */
      setNotes : function (notes) {
        if (!notes.first_note && !notes.last_note) {
          throw new Vex.RuntimeError("BadArguments", "Tie needs to have either first_note or last_note set.");
        }

        if (!notes.first_indices) {
          notes.first_indices = [0];
        }
        if (!notes.last_indices) {
          notes.last_indices = [0];
        }

        if (notes.first_indices.length != notes.last_indices.length) {
          throw new Vex.RuntimeError("BadArguments", "Tied notes must have similar" + " index sizes");
        }

        // Success. Lets grab 'em notes.
        this.first_note = notes.first_note;
        this.first_indices = notes.first_indices;
        this.last_note = notes.last_note;
        this.last_indices = notes.last_indices;
        return this;
      },

      /**
       * @return {boolean} Returns true if this is a partial bar.
       */
      isPartial : function () {
        return (!this.first_note || !this.last_note);
      },

      // START ADDITION
      setDir : function (dir) {
        this.curvedir = dir;
      },

      getDir : function () {
        return this.curvedir;
      },
      // END ADDITION

      renderTie : function (params) {
        if (params.first_ys.length === 0 || params.last_ys.length === 0) {
          throw new Vex.RERR("BadArguments", "No Y-values to render");
        }

        // START ADDITION
        if (this.curvedir) {
          params.direction = (this.curvedir === 'above') ? -1 : 1;
        } else {
          this.curvedir = params.direction;
        }
        // END ADDITION

        var ctx = this.context;
        var cp1 = this.render_options.cp1;
        var cp2 = this.render_options.cp2;

        if (Math.abs(params.last_x_px - params.first_x_px) < 10) {
          cp1 = 2;
          cp2 = 8;
        }

        var first_x_shift = this.render_options.first_x_shift;
        var last_x_shift = this.render_options.last_x_shift;
        var y_shift = this.render_options.y_shift * params.direction;

        for (var i = 0; i < this.first_indices.length; ++i) {
          var cp_x = ((params.last_x_px + last_x_shift) + (params.first_x_px + first_x_shift)) / 2;
          var first_y_px = params.first_ys[this.first_indices[i]] + y_shift;
          var last_y_px = params.last_ys[this.last_indices[i]] + y_shift;

          if (isNaN(first_y_px) || isNaN(last_y_px)) {
            throw new Vex.RERR("BadArguments", "Bad indices for tie rendering.");
          }

          var top_cp_y = ((first_y_px + last_y_px) / 2) + (cp1 * params.direction);
          var bottom_cp_y = ((first_y_px + last_y_px) / 2) + (cp2 * params.direction);

          ctx.beginPath();
          ctx.moveTo(params.first_x_px + first_x_shift, first_y_px);
          ctx.quadraticCurveTo(cp_x, top_cp_y, params.last_x_px + last_x_shift, last_y_px);
          ctx.quadraticCurveTo(cp_x, bottom_cp_y, params.first_x_px + first_x_shift, first_y_px);

          ctx.closePath();
          ctx.fill();
        }
      },

      renderText : function (first_x_px, last_x_px) {
        if (!this.text) {
          return;
        }
        var center_x = (first_x_px + last_x_px) / 2;
        center_x -= this.context.measureText(this.text).width / 2;

        this.context.save();
        this.context.setFont(this.font.family, this.font.size, this.font.style);
        this.context.fillText(this.text, center_x + this.render_options.text_shift_x, (this.first_note ||
                                                                                       this.last_note).getStave().getYForTopText() -
                                                                                      1);
        this.context.restore();
      },

      draw : function () {
        if (!this.context) {
          throw new Vex.RERR("NoContext", "No context to render tie.");
        }
        var first_note = this.first_note;
        var last_note = this.last_note;
        var first_x_px, last_x_px, first_ys, last_ys, stem_direction;

        if (first_note) {
          first_x_px = first_note.getTieRightX() + this.render_options.tie_spacing;
          stem_direction = first_note.getStemDirection();
          first_ys = first_note.getYs();
        } else {
          first_x_px = last_note.getStave().getTieStartX();
          first_ys = last_note.getYs();
          this.first_indices = this.last_indices;
        }

        if (last_note) {
          last_x_px = last_note.getTieLeftX() + this.render_options.tie_spacing;
          stem_direction = last_note.getStemDirection();
          last_ys = last_note.getYs();
        } else {
          last_x_px = first_note.getStave().getTieEndX();
          last_ys = first_note.getYs();
          this.last_indices = this.first_indices;
        }

        this.renderTie({
          first_x_px : first_x_px,
          last_x_px : last_x_px,
          first_ys : first_ys,
          last_ys : last_ys,
          direction : stem_direction
        });

        this.renderText(first_x_px, last_x_px);
        return true;
      }
    };

    return StaveTie;
  }());


  // Vex Flow
  // Mohit Muthanna <mohit@muthanna.com>
  //
  // Copyright Mohit Cheppudira 2010

  /** @constructor */
  VF.Stave = (function () {
    function Stave(x, y, width, options) {
      if (arguments.length > 0) this.init(x, y, width, options);
    }

    var THICKNESS = (VF.STAVE_LINE_THICKNESS > 1 ? VF.STAVE_LINE_THICKNESS : 0);
    Stave.prototype = {
      init : function (x, y, width, options) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.start_x = this.getGlyphStartX();
        this.end_x = this.getGlyphEndX();
        this.context = null;
        this.glyphs = [];
        this.end_glyphs = [];
        this.modifiers = [];  // non-glyph stave items (barlines, coda, segno, etc.)
        this.measure = 0;
        this.clef = "treble";
        this.font = {
          family : "sans-serif",
          size : 8,
          weight : ""
        };
        this.options = {
          vertical_bar_width : 10,       // Width around vertical bar end-marker
          glyph_spacing_px : 10,
          num_lines : 5,
          fill_style : "#999999",
          spacing_between_lines_px : 10, // in pixels
          space_above_staff_ln : 4,      // in staff lines
          space_below_staff_ln : 4,      // in staff lines
          top_text_position : 1          // in staff lines
        };
        this.bounds = {x : this.x, y : this.y, w : this.width, h : 0};
        Vex.Merge(this.options, options);

        this.resetLines();

        this.modifiers.push(new VF.Barline(VF.Barline.type.SINGLE, this.x)); // beg bar
        this.modifiers.push(new VF.Barline(VF.Barline.type.SINGLE, this.x + this.width)); // end bar
      },

      getGlyphStartX : function () {
        return this.x + 5;
      },

      getGlyphEndX : function () {
        return this.x + this.width;
      },

      resetLines : function () {
        this.options.line_config = [];
        for (var i = 0; i < this.options.num_lines; i++) {
          this.options.line_config.push({visible : true});
        }
        this.height =
        (this.options.num_lines + this.options.space_above_staff_ln) * this.options.spacing_between_lines_px;
        this.options.bottom_text_position = this.options.num_lines + 1;
      },

      setNoteStartX : function (x) {
        this.start_x = x;
        return this;
      },
      getNoteStartX : function () {
        var start_x = this.start_x;

        // Add additional space if left barline is REPEAT_BEGIN and there are other
        // start modifiers than barlines
        if (this.modifiers[0].barline == VF.Barline.type.REPEAT_BEGIN && this.modifiers.length > 2) {
          start_x += 20;
        }
        return start_x;
      },

      getNoteEndX : function () {
        return this.end_x;
      },
      getTieStartX : function () {
        return this.start_x;
      },
      getTieEndX : function () {
        return this.x + this.width;
      },
      setContext : function (context) {
        this.context = context;
        return this;
      },
      getContext : function () {
        return this.context;
      },

      setX : function (x) {
        var i;
        var dx = (typeof this.x == "number") ? x - this.x : 0;
        //      console.log('dx: ' + dx.toString());
        this.x = x;
        this.bounds.x = x;
        this.start_x += dx;
        for (i = 0; i < this.modifiers.length; i++) {
          this.modifiers[i].x = x;
        }
        return this;
      },

      getX : function () {
        return this.x;
      },
      getNumLines : function () {
        return this.options.num_lines;
      },
      setNumLines : function (lines) {
        this.options.num_lines = parseInt(lines, 10);
        this.resetLines();
        return this;
      },
      setY : function (y) {
        this.y = y;
        return this;
      },

      setWidth : function (width) {
        this.width = width;
        this.end_x = this.getGlyphEndX();

        // reset the x position of the end barline
        this.modifiers[1].setX(this.end_x);
        return this;
      },

      getWidth : function () {
        return this.width;
      },

      setMeasure : function (measure) {
        this.measure = measure;
        return this;
      },

      // Bar Line functions
      setBegBarType : function (type) {
        // Only valid bar types at beginning of stave is none, single or begin repeat
        if (type == VF.Barline.type.SINGLE || type == VF.Barline.type.REPEAT_BEGIN ||
            type == VF.Barline.type.NONE) {
          this.modifiers[0] = new VF.Barline(type, this.x);
        }
        return this;
      },

      setEndBarType : function (type) {
        // Repeat end not valid at end of stave
        if (type != VF.Barline.type.REPEAT_BEGIN) {
          this.modifiers[1] = new VF.Barline(type, this.x + this.width);
        }
        return this;
      },

      /**
       * Gets the pixels to shift from the beginning of the stave
       * following the modifier at the provided index
       * @param  {Number} index The index from which to determine the shift
       * @return {Number}       The amount of pixels shifted
       */
      getModifierXShift : function (index) {
        if (typeof index === 'undefined') index = this.glyphs.length - 1;
        if (typeof index !== 'number') new Vex.RERR("InvalidIndex", "Must be of number type");

        var x = this.getGlyphStartX();
        var bar_x_shift = 0;

        for (var i = 0; i < index + 1; ++i) {
          var glyph = this.glyphs[i];
          x += glyph.getMetrics().width;
          bar_x_shift += glyph.getMetrics().width;
        }

        // Add padding after clef, time sig, key sig
        if (bar_x_shift > 0) bar_x_shift += this.options.vertical_bar_width + 10;

        return bar_x_shift;
      },

      // Coda & Segno Symbol functions
      setRepetitionTypeLeft : function (type, y) {
        this.modifiers.push(new VF.Repetition(type, this.x, y));
        return this;
      },

      setRepetitionTypeRight : function (type, y) {
        this.modifiers.push(new VF.Repetition(type, this.x, y));
        return this;
      },

      // Volta functions
      setVoltaType : function (type, number_t, y) {
        this.modifiers.push(new VF.Volta(type, number_t, this.x, y));
        return this;
      },

      // Section functions
      setSection : function (section, y) {
        this.modifiers.push(new VF.StaveSection(section, this.x, y));
        return this;
      },

      // Tempo functions
      setTempo : function (tempo, y) {
        this.modifiers.push(new VF.StaveTempo(tempo, this.x, y));
        return this;
      },

      // Text functions
      setText : function (text, position, options) {
        this.modifiers.push(new VF.StaveText(text, position, options));
        return this;
      },

      getHeight : function () {
        return this.height;
      },

      getSpacingBetweenLines : function () {
        return this.options.spacing_between_lines_px;
      },

      getBoundingBox : function () {
        return new VF.BoundingBox(this.x, this.y, this.width, this.getBottomY() - this.y);
        // body...
      },

      getBottomY : function () {
        var options = this.options;
        var spacing = options.spacing_between_lines_px;
        var score_bottom = this.getYForLine(options.num_lines) + (options.space_below_staff_ln * spacing);

        return score_bottom;
      },

      getBottomLineY : function () {
        return this.getYForLine(this.options.num_lines);
      },

      getYForLine : function (line) {
        var options = this.options;
        var spacing = options.spacing_between_lines_px;
        var headroom = options.space_above_staff_ln;

        var y = this.y + ((line * spacing) + (headroom * spacing)) - (THICKNESS / 2);

        return y;
      },

      getYForTopText : function (line, font_scale) {
        var l = line || 0;
        var scale = font_scale || 1;
        return this.getYForLine(-(l * scale) - this.options.top_text_position);
      },

      getYForBottomText : function (line, font_scale) {
        var l = line || 0;
        var scale = font_scale || 1;
        return this.getYForLine(this.options.bottom_text_position + (l * scale));
      },

      getYForNote : function (line) {
        var options = this.options;
        var spacing = options.spacing_between_lines_px;
        var headroom = options.space_above_staff_ln;
        var y = this.y + (headroom * spacing) + (5 * spacing) - (line * spacing);

        return y;
      },

      getYForGlyphs : function () {
        return this.getYForLine(3);
      },

      addGlyph : function (glyph) {
        glyph.setStave(this);
        this.glyphs.push(glyph);
        this.start_x += glyph.getMetrics().width;
        return this;
      },

      addEndGlyph : function (glyph) {
        glyph.setStave(this);
        this.end_glyphs.push(glyph);
        this.end_x -= glyph.getMetrics().width;
        return this;
      },

      addModifier : function (modifier) {
        this.modifiers.push(modifier);
        modifier.addToStave(this, (this.glyphs.length === 0));
        return this;
      },

      addEndModifier : function (modifier) {
        this.modifiers.push(modifier);
        modifier.addToStaveEnd(this, (this.end_glyphs.length === 0));
        return this;
      },

      addKeySignature : function (keySpec) {
        this.addModifier(new VF.KeySignature(keySpec));
        return this;
      },

      addClef : function (clef, size, annotation) {
        this.clef = clef;
        this.addModifier(new VF.Clef(clef, size, annotation));
        return this;
      },

      addEndClef : function (clef, size, annotation) {
        this.addEndModifier(new VF.Clef(clef, size, annotation));
        return this;
      },

      addTimeSignature : function (timeSpec, customPadding) {
        this.addModifier(new VF.TimeSignature(timeSpec, customPadding));
        return this;
      },

      addEndTimeSignature : function (timeSpec, customPadding) {
        this.addEndModifier(new VF.TimeSignature(timeSpec, customPadding));
      },

      addTrebleGlyph : function () {
        this.clef = "treble";
        this.addGlyph(new VF.Glyph("v83", 40));
        return this;
      },

      /**
       * All drawing functions below need the context to be set.
       */
      draw : function () {
        if (!this.context) throw new Vex.RERR("NoCanvasContext", "Can't draw stave without canvas context.");

        var num_lines = this.options.num_lines;
        var width = this.width;
        var x = this.x;
        var y;
        var glyph;

        // Render lines
        for (var line = 0; line < num_lines; line++) {
          y = this.getYForLine(line);

          this.context.save();
          this.context.setFillStyle(this.options.fill_style);
          this.context.setStrokeStyle(this.options.fill_style);
          if (this.options.line_config[line].visible) {
            this.context.fillRect(x, y, width, VF.STAVE_LINE_THICKNESS);
          }
          this.context.restore();
        }

        // Render glyphs
        x = this.getGlyphStartX();
        for (var i = 0; i < this.glyphs.length; ++i) {
          glyph = this.glyphs[i];
          if (!glyph.getContext()) {
            glyph.setContext(this.context);
          }
          glyph.renderToStave(x);
          x += glyph.getMetrics().width;
        }

        // Render end glyphs
        x = this.getGlyphEndX();
        for (i = 0; i < this.end_glyphs.length; ++i) {
          glyph = this.end_glyphs[i];
          if (!glyph.getContext()) {
            glyph.setContext(this.context);
          }
          x -= glyph.getMetrics().width;
          glyph.renderToStave(x);
        }

        // Draw the modifiers (bar lines, coda, segno, repeat brackets, etc.)
        for (i = 0; i < this.modifiers.length; i++) {
          // Only draw modifier if it has a draw function
          if (typeof this.modifiers[i].draw == "function") {
            this.modifiers[i].draw(this, this.getModifierXShift());
          }
        }

        // Render measure numbers
        if (this.measure > 0) {
          this.context.save();
          this.context.setFont(this.font.family, this.font.size, this.font.weight);
          var text_width = this.context.measureText("" + this.measure).width;
          y = this.getYForTopText(0) + 3;
          this.context.fillText("" + this.measure, this.x - text_width / 2, y);
          this.context.restore();
        }

        return this;
      },

      // Draw Simple barlines for backward compatability
      // Do not delete - draws the beginning bar of the stave
      drawVertical : function (x, isDouble) {
        this.drawVerticalFixed(this.x + x, isDouble);
      },

      drawVerticalFixed : function (x, isDouble) {
        if (!this.context) throw new Vex.RERR("NoCanvasContext", "Can't draw stave without canvas context.");

        var top_line = this.getYForLine(0);
        var bottom_line = this.getYForLine(this.options.num_lines - 1);
        if (isDouble) {
          this.context.fillRect(x - 3, top_line, 1, bottom_line - top_line + 1);
        }
        this.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
      },

      drawVerticalBar : function (x) {
        this.drawVerticalBarFixed(this.x + x, false);
      },

      drawVerticalBarFixed : function (x) {
        if (!this.context) throw new Vex.RERR("NoCanvasContext", "Can't draw stave without canvas context.");

        var top_line = this.getYForLine(0);
        var bottom_line = this.getYForLine(this.options.num_lines - 1);
        this.context.fillRect(x, top_line, 1, bottom_line - top_line + 1);
      },

      /**
       * Get the current configuration for the Stave.
       * @return {Array} An array of configuration objects.
       */
      getConfigForLines : function () {
        return this.options.line_config;
      },

      /**
       * Configure properties of the lines in the Stave
       * @param line_number The index of the line to configure.
       * @param line_config An configuration object for the specified line.
       * @throws Vex.RERR "StaveConfigError" When the specified line number is out of
       *   range of the number of lines specified in the constructor.
       */
      setConfigForLine : function (line_number, line_config) {
        if (line_number >= this.options.num_lines || line_number < 0) {
          throw new Vex.RERR("StaveConfigError", "The line number must be within the range of the number of lines in the Stave.");
        }
        if (!line_config.hasOwnProperty('visible')) {
          throw new Vex.RERR("StaveConfigError", "The line configuration object is missing the 'visible' property.");
        }
        if (typeof(line_config.visible) !== 'boolean') {
          throw new Vex.RERR("StaveConfigError", "The line configuration objects 'visible' property must be true or false.");
        }

        this.options.line_config[line_number] = line_config;

        return this;
      },

      /**
       * Set the staff line configuration array for all of the lines at once.
       * @param lines_configuration An array of line configuration objects.  These objects
       *   are of the same format as the single one passed in to setLineConfiguration().
       *   The caller can set null for any line config entry if it is desired that the default be used
       * @throws Vex.RERR "StaveConfigError" When the lines_configuration array does not have
       *   exactly the same number of elements as the num_lines configuration object set in
       *   the constructor.
       */
      setConfigForLines : function (lines_configuration) {
        if (lines_configuration.length !== this.options.num_lines) {
          throw new Vex.RERR("StaveConfigError", "The length of the lines configuration array must match the number of lines in the Stave");
        }

        // Make sure the defaults are present in case an incomplete set of
        //  configuration options were supplied.
        for (var line_config in lines_configuration) {
          // Allow 'null' to be used if the caller just wants the default for a particular node.
          if (!lines_configuration[line_config]) {
            lines_configuration[line_config] = this.options.line_config[line_config];
          }
          Vex.Merge(this.options.line_config[line_config], lines_configuration[line_config]);
        }

        this.options.line_config = lines_configuration;

        return this;
      }
    };

    return Stave;
  }());










































  // [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
  //
  // ## Description
  //
  // This file implements `Beams` that span over a set of `StemmableNotes`.
  //
  // Requires: vex.js, vexmusic.js, note.js
  Vex.Flow.Beam = (function() {
    function Beam(notes, auto_stem) {
      if (arguments.length > 0) this.init(notes, auto_stem);
    }

    var Stem = Vex.Flow.Stem;

    // ## Prototype Methods
    Beam.prototype = {
      init: function(notes, auto_stem) {
        if (!notes || notes == []) {
          throw new Vex.RuntimeError("BadArguments", "No notes provided for beam.");
        }

        if (notes.length == 1) {
          throw new Vex.RuntimeError("BadArguments", "Too few notes for beam.");
        }

        // Validate beam line, direction and ticks.
        this.ticks = notes[0].getIntrinsicTicks();

        if (this.ticks >= Vex.Flow.durationToTicks("4")) {
          throw new Vex.RuntimeError("BadArguments",
            "Beams can only be applied to notes shorter than a quarter note.");
        }

        var i; // shared iterator
        var note;

        this.stem_direction = Stem.UP;

        for (i = 0; i < notes.length; ++i) {
          note = notes[i];
          if (note.hasStem()) {
            this.stem_direction = note.getStemDirection();
            break;
          }
        }

        var stem_direction = this.stem_direction;
        // Figure out optimal stem direction based on given notes
        if (auto_stem && notes[0].getCategory() === 'stavenotes')  {
          stem_direction = calculateStemDirection(notes);
        } else if (auto_stem && notes[0].getCategory() === 'tabnotes') {
          // Auto Stem TabNotes
          var stem_weight = notes.reduce(function(memo, note) {
            return memo + note.stem_direction;
          }, 0);

          stem_direction = stem_weight > -1 ? Stem.UP : Stem.DOWN;
        }

        // Apply stem directions and attach beam to notes
        for (i = 0; i < notes.length; ++i) {
          note = notes[i];
          if (auto_stem) {
            note.setStemDirection(stem_direction);
            this.stem_direction = stem_direction;
          }
          note.setBeam(this);
        }

        this.postFormatted = false;
        this.notes = notes;
        this.beam_count = this.getBeamCount();
        this.break_on_indices = [];
        this.render_options = {
          beam_width: 5,
          max_slope: 0.25,
          min_slope: -0.25,
          slope_iterations: 20,
          slope_cost: 100,
          show_stemlets: false,
          stemlet_extension: 7,
          partial_beam_length: 10
        };
      },

      // The the rendering `context`
      setContext: function(context) { this.context = context; return this; },

      // Get the notes in this beam
      getNotes: function() { return this.notes; },

      // Get the max number of beams in the set of notes
      getBeamCount: function(){
        var beamCounts =  this.notes.map(function(note) {
          return note.getGlyph().beam_count;
        });

        var maxBeamCount =  beamCounts.reduce(function(max, beamCount) {
          return beamCount > max ? beamCount : max;
        });

        return maxBeamCount;
      },

      // Set which note `indices` to break the secondary beam at
      breakSecondaryAt: function(indices) {
        this.break_on_indices = indices;
        return this;
      },

      // Return the y coordinate for linear function
      getSlopeY: function(x, first_x_px, first_y_px, slope) {
        return first_y_px + ((x - first_x_px) * slope);
      },

      // Calculate the best possible slope for the provided notes
      calculateSlope: function() {
        var first_note = this.notes[0];
        var first_y_px = first_note.getStemExtents().topY;
        var first_x_px = first_note.getStemX();

        var inc = (this.render_options.max_slope - this.render_options.min_slope) /
                  this.render_options.slope_iterations;
        var min_cost = Number.MAX_VALUE;
        var best_slope = 0;
        var y_shift = 0;

        // iterate through slope values to find best weighted fit
        for (var slope = this.render_options.min_slope;
          slope <= this.render_options.max_slope;
          slope += inc) {
          var total_stem_extension = 0;
          var y_shift_tmp = 0;

          // iterate through notes, calculating y shift and stem extension
          for (var i = 1; i < this.notes.length; ++i) {
            var note = this.notes[i];

            var x_px = note.getStemX();
            var y_px = note.getStemExtents().topY;
            var slope_y_px = this.getSlopeY(x_px, first_x_px, first_y_px, slope) + y_shift_tmp;

            // beam needs to be shifted up to accommodate note
            if (y_px * this.stem_direction < slope_y_px * this.stem_direction) {
              var diff =  Math.abs(y_px - slope_y_px);
              y_shift_tmp += diff * -this.stem_direction;
              total_stem_extension += (diff * i);
            } else { // beam overshoots note, account for the difference
              total_stem_extension += (y_px - slope_y_px) * this.stem_direction;
            }

          }

          var last_note = this.notes[this.notes.length - 1];
          var first_last_slope = ((last_note.getStemExtents().topY - first_y_px) /
                                  (last_note.getStemX() - first_x_px));
          // most engraving books suggest aiming for a slope about half the angle of the
          // difference between the first and last notes' stem length;
          var ideal_slope = first_last_slope / 2;
          var distance_from_ideal = Math.abs(ideal_slope - slope);

          // This tries to align most beams to something closer to the ideal_slope, but
          // doesn't go crazy. To disable, set this.render_options.slope_cost = 0
          var cost = this.render_options.slope_cost * distance_from_ideal +
                     Math.abs(total_stem_extension);

          // update state when a more ideal slope is found
          if (cost < min_cost) {
            min_cost = cost;
            best_slope = slope;
            y_shift = y_shift_tmp;
          }
        }

        this.slope = best_slope;
        this.y_shift = y_shift;
      },

      // Create new stems for the notes in the beam, so that each stem
      // extends into the beams.
      applyStemExtensions: function(){
        var first_note = this.notes[0];
        var first_y_px = first_note.getStemExtents().topY;
        var first_x_px = first_note.getStemX();

        for (var i = 0; i < this.notes.length; ++i) {
          var note = this.notes[i];

          var x_px = note.getStemX();
          var y_extents = note.getStemExtents();
          var base_y_px = y_extents.baseY;
          var top_y_px = y_extents.topY;

          // For harmonic note heads, shorten stem length by 3 pixels
          base_y_px += this.stem_direction * note.glyph.stem_offset;

          // Don't go all the way to the top (for thicker stems)
          var y_displacement = Vex.Flow.STEM_WIDTH;

          if (!note.hasStem()) {
            if (note.isRest() && this.render_options.show_stemlets) {
              var centerGlyphX = note.getCenterGlyphX();

              var width = this.render_options.beam_width;
              var total_width = ((this.beam_count - 1)* width * 1.5) + width;

              var stemlet_height = (total_width - y_displacement +
                                    this.render_options.stemlet_extension);

              var beam_y = this.getSlopeY(centerGlyphX, first_x_px,
                first_y_px, this.slope) + this.y_shift;
              var start_y = beam_y + (Vex.Flow.Stem.HEIGHT * this.stem_direction);
              var end_y = beam_y + (stemlet_height * this.stem_direction);

              // Draw Stemlet
              note.setStem(new Vex.Flow.Stem({
                x_begin: centerGlyphX,
                x_end: centerGlyphX,
                y_bottom: this.stem_direction === 1 ? end_y : start_y,
                y_top: this.stem_direction === 1 ? start_y : end_y,
                y_extend: y_displacement,
                stem_extension: -1, // To avoid protruding through the beam
                stem_direction: this.stem_direction
              }));
            }

            continue;
          }

          var slope_y = this.getSlopeY(x_px, first_x_px, first_y_px,
            this.slope) + this.y_shift;

          note.setStem(new Vex.Flow.Stem({
            x_begin: x_px - (Vex.Flow.STEM_WIDTH/2),
            x_end: x_px,
            y_top: this.stem_direction === 1 ? top_y_px : base_y_px,
            y_bottom: this.stem_direction === 1 ? base_y_px :  top_y_px ,
            y_extend: y_displacement,
            stem_extension: Math.abs(top_y_px - slope_y) - Stem.HEIGHT - 1,
            stem_direction: this.stem_direction
          }));
        }
      },

      // Get the x coordinates for the beam lines of specific `duration`
      getBeamLines: function(duration) {
        var beam_lines = [];
        var flipped_beam_lines = [];
        var beam_started = false;
        var current_beam;
        var partial_beam_length = this.render_options.partial_beam_length;

        function determinePartialSide (prev_note, next_note){
          // Compare beam counts and store differences
          var unshared_beams = 0;
          if (next_note && prev_note) {
            unshared_beams = prev_note.getBeamCount() - next_note.getBeamCount();
          }

//          var left_partial = duration !== "8" && unshared_beams > 0;
          var right_partial = duration !== "8" && unshared_beams < 0;

          return {
            left: prev_note,
            right: right_partial
          };
        }

        for (var i = 0; i < this.notes.length; ++i) {
          var note = this.notes[i];
          var prev_note = this.notes[i-1];
          var next_note = this.notes[i+1];
          var ticks = note.getIntrinsicTicks();
          var partial = determinePartialSide(prev_note, next_note);
          var stem_x = note.isRest() ? note.getCenterGlyphX() : note.getStemX();

          // Check whether to apply beam(s)
          if (ticks < Vex.Flow.durationToTicks(duration)) {
            if (!beam_started) {
              var new_line = { start: stem_x, end: null, flipped: note.getStemDirection() !== this.stem_direction};

              if (partial.left && !partial.right) {
                new_line.end = stem_x - partial_beam_length;
              }

              beam_lines.push(new_line);
              beam_started = true;
            } else {
              current_beam = beam_lines[beam_lines.length - 1];
              current_beam.end = stem_x;

              // Should break secondary beams on note
              var should_break = this.break_on_indices.indexOf(i) !== -1;
              // Shorter than or eq an 8th note duration
              var can_break = parseInt(duration, 10) >= 8;
              if (should_break  && can_break) {
                beam_started = false;
              }
            }
          } else {
            if (!beam_started) {
              // we don't care
            } else {
              current_beam = beam_lines[beam_lines.length - 1];
              if (current_beam.end == null) {
                // single note
                current_beam.end = current_beam.start +
                                   partial_beam_length;
              } else {
                // we don't care
              }
            }

            beam_started = false;
          }
        }

        if (beam_started === true) {
          current_beam = beam_lines[beam_lines.length - 1];
          if (current_beam.end == null) {
            // single note
            current_beam.end = current_beam.start -
                               partial_beam_length;
          }
        }

        return beam_lines;
      },

      // Render the stems for each notes
      drawStems: function() {
        this.notes.forEach(function(note) {
          if (note.getStem()) {
            note.getStem().setContext(this.context).draw();
          }
        }, this);
      },

      // Render the beam lines
      drawBeamLines: function() {
        if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

        var valid_beam_durations = ["4", "8", "16", "32", "64"];

        var first_note = this.notes[0];
        var last_note = this.notes[this.notes.length - 1];

        var first_y_px = first_note.getStemExtents().topY;
        var last_y_px = last_note.getStemExtents().topY;

        var first_x_px = first_note.getStemX();

        var beam_width = this.render_options.beam_width * this.stem_direction;

        // Draw the beams.
        for (var i = 0; i < valid_beam_durations.length; ++i) {
          var duration = valid_beam_durations[i];
          var beam_lines = this.getBeamLines(duration);

          for (var j = 0; j < beam_lines.length; ++j) {
            var beam_line = beam_lines[j];

            if (!beam_line.flipped) {
              var first_x = beam_line.start - (this.stem_direction == Stem.DOWN ? Vex.Flow.STEM_WIDTH/2:0);
              var first_y = this.getSlopeY(first_x, first_x_px, first_y_px, this.slope);

              var last_x = beam_line.end +
                           (this.stem_direction == 1 ? (Vex.Flow.STEM_WIDTH/3):(-Vex.Flow.STEM_WIDTH/3));
              var last_y = this.getSlopeY(last_x, first_x_px, first_y_px, this.slope);

              this.context.beginPath();
              this.context.moveTo(first_x, first_y + this.y_shift);
              this.context.lineTo(first_x, first_y + beam_width + this.y_shift);
              this.context.lineTo(last_x + 1, last_y + beam_width + this.y_shift);
              this.context.lineTo(last_x + 1, last_y + this.y_shift);
              this.context.closePath();
              this.context.fill();

            }
          }

          first_y_px += beam_width * 1.5;
          last_y_px += beam_width * 1.5;
        }



        // TODO integrate!:


        var beam_width = this.render_options.beam_width * this.stem_direction * -1;

        var first_y_px = first_note.getStemExtents().topY - beam_width;
        var last_y_px = last_note.getStemExtents().topY - beam_width;

        var first_x_px = first_note.getStemX();


        // Draw the beams.
        for (var i = 0; i < valid_beam_durations.length; ++i) {
          var duration = valid_beam_durations[i];
          var beam_lines = this.getBeamLines(duration);

          for (var j = 0; j < beam_lines.length; ++j) {
            var beam_line = beam_lines[j];

            if (beam_line.flipped) {
              var first_x = beam_line.start - (this.stem_direction * -1 == Stem.DOWN ? Vex.Flow.STEM_WIDTH/2:0);
              var first_y = this.getSlopeY(first_x, first_x_px, first_y_px, this.slope);

              var last_x = beam_line.end +
                           (this.stem_direction * -1 == 1 ? (Vex.Flow.STEM_WIDTH/3):(-Vex.Flow.STEM_WIDTH/3));
              var last_y = this.getSlopeY(last_x, first_x_px, first_y_px, this.slope);

              this.context.beginPath();
              this.context.moveTo(first_x, first_y + this.y_shift);
              this.context.lineTo(first_x, first_y + beam_width + this.y_shift);
              this.context.lineTo(last_x + 1, last_y + beam_width + this.y_shift);
              this.context.lineTo(last_x + 1, last_y + this.y_shift);
              this.context.closePath();
              this.context.fill();

            }
          }

          first_y_px += beam_width * 1.5;
          last_y_px += beam_width * 1.5;
        }




      },

      // Pre-format the beam
      preFormat: function() { return this; },

      // Post-format the beam. This can only be called after
      // the notes in the beam have both `x` and `y` values. ie: they've
      // been formatted and have staves
      postFormat: function() {
        if (this.postFormatted) return;

        this.calculateSlope();
        this.applyStemExtensions();

        this.postFormatted = true;
      },

      // Render the beam to the canvas context
      draw: function() {
        if (!this.context) throw new Vex.RERR("NoCanvasContext",
          "Can't draw without a canvas context.");

        if (this.unbeamable) return;

        if (!this.postFormatted) {
          this.postFormat();
        }

        this.drawStems();
        this.drawBeamLines();

        return true;
      }
    };

    function calculateStemDirection(notes) {
      var lineSum = 0;
      notes.forEach(function(note) {
        if (note.keyProps) {
          note.keyProps.forEach(function(keyProp){
            lineSum += (keyProp.line - 3);
          });
        }
      });

      if (lineSum >= 0)
        return Stem.DOWN;
      return Stem.UP;
    }

    // ## Static Methods
    //
    // Gets the default beam groups for a provided time signature.
    // Attempts to guess if the time signature is not found in table.
    // Currently this is fairly naive.
    Beam.getDefaultBeamGroups = function(time_sig){
      if (!time_sig || time_sig == "c") time_sig = "4/4";

      var defaults = {
        '1/2' :  ['1/2'],
        '2/2' :  ['1/2'],
        '3/2' :  ['1/2'],
        '4/2' :  ['1/2'],

        '1/4' :  ['1/4'],
        '2/4' :  ['1/4'],
        '3/4' :  ['1/4'],
        '4/4' :  ['1/4'],

        '1/8' :  ['1/8'],
        '2/8' :  ['2/8'],
        '3/8' :  ['3/8'],
        '4/8' :  ['2/8'],

        '1/16' : ['1/16'],
        '2/16' : ['2/16'],
        '3/16' : ['3/16'],
        '4/16' : ['2/16']
      };

      var Fraction = Vex.Flow.Fraction;
      var groups = defaults[time_sig];

      if (!groups) {
        // If no beam groups found, naively determine
        // the beam groupings from the time signature
        var beatTotal = parseInt(time_sig.split('/')[0], 10);
        var beatValue = parseInt(time_sig.split('/')[1], 10);

        var tripleMeter = beatTotal % 3 === 0;

        if (tripleMeter) {
          return [new Fraction(3, beatValue)];
        } else if (beatValue > 4) {
          return [new Fraction(2, beatValue)];
        } else if (beatValue <= 4) {
          return [new Fraction(1, beatValue)];
        }
      } else {
        return groups.map(function(group) {
          return new Fraction().parse(group);
        });
      }
    };

    // A helper function to automatically build basic beams for a voice. For more
    // complex auto-beaming use `Beam.generateBeams()`.
    //
    // Parameters:
    // * `voice` - The voice to generate the beams for
    // * `stem_direction` - A stem direction to apply to the entire voice
    // * `groups` - An array of `Fraction` representing beat groupings for the beam
    Beam.applyAndGetBeams = function(voice, stem_direction, groups) {
      return Beam.generateBeams(voice.getTickables(), {
        groups: groups,
        stem_direction: stem_direction
      });
    };

    // A helper function to autimatically build beams for a voice with
    // configuration options.
    //
    // Example configuration object:
    //
    // ```
    // config = {
    //   groups: [new Vex.Flow.Fraction(2, 8)],
    //   stem_direction: -1,
    //   beam_rests: true,
    //   beam_middle_only: true,
    //   show_stemlets: false
    // };
    // ```
    //
    // Parameters:
    // * `notes` - An array of notes to create the beams for
    // * `config` - The configuration object
    //    * `groups` - Array of `Fractions` that represent the beat structure to beam the notes
    //    * `stem_direction` - Set to apply the same direction to all notes
    //    * `beam_rests` - Set to `true` to include rests in the beams
    //    * `beam_middle_only` - Set to `true` to only beam rests in the middle of the beat
    //    * `show_stemlets` - Set to `true` to draw stemlets for rests
    //    * `maintain_stem_directions` - Set to `true` to not apply new stem directions
    //
    Beam.generateBeams = function(notes, config) {

      if (!config) config = {};

      if (!config.groups || !config.groups.length) {
        config.groups = [new Vex.Flow.Fraction(2, 8)];
      }

      // Convert beam groups to tick amounts
      var tickGroups = config.groups.map(function(group) {
        if (!group.multiply) {
          throw new Vex.RuntimeError("InvalidBeamGroups",
            "The beam groups must be an array of Vex.Flow.Fractions");
        }
        return group.clone().multiply(Vex.Flow.RESOLUTION, 1);
      });

      var unprocessedNotes = notes;
      var currentTickGroup = 0;
      var noteGroups       = [];
      var currentGroup     = [];

      function getTotalTicks(vf_notes){
        return vf_notes.reduce(function(memo,note){
          return note.getTicks().clone().add(memo);
        }, new Vex.Flow.Fraction(0, 1));
      }

      function nextTickGroup() {
        if (tickGroups.length - 1 > currentTickGroup) {
          currentTickGroup += 1;
        } else {
          currentTickGroup = 0;
        }
      }

      function createGroups(){
        var nextGroup = [];

        unprocessedNotes.forEach(function(unprocessedNote){
          nextGroup    = [];
          if (unprocessedNote.shouldIgnoreTicks()) {
            noteGroups.push(currentGroup);
            currentGroup = nextGroup;
            return; // Ignore untickables (like bar notes)
          }

          currentGroup.push(unprocessedNote);
          var ticksPerGroup = tickGroups[currentTickGroup].clone();
          var totalTicks = getTotalTicks(currentGroup);

          // Double the amount of ticks in a group, if it's an unbeamable tuplet
          var unbeamable = Vex.Flow.durationToNumber(unprocessedNote.duration) < 8;
          if (unbeamable && unprocessedNote.tuplet) {
            ticksPerGroup.numerator *= 2;
          }

          // If the note that was just added overflows the group tick total
          if (totalTicks.greaterThan(ticksPerGroup)) {
            // If the overflow note can be beamed, start the next group
            // with it. Unbeamable notes leave the group overflowed.
            if (!unbeamable) {
              nextGroup.push(currentGroup.pop());
            }
            noteGroups.push(currentGroup);
            currentGroup = nextGroup;
            nextTickGroup();
          } else if (totalTicks.equals(ticksPerGroup)) {
            noteGroups.push(currentGroup);
            currentGroup = nextGroup;
            nextTickGroup();
          }
        });

        // Adds any remainder notes
        if (currentGroup.length > 0)
          noteGroups.push(currentGroup);
      }

      function getBeamGroups() {
        return noteGroups.filter(function(group){
          if (group.length > 1) {
            var beamable = true;
            group.forEach(function(note) {
              if (note.getIntrinsicTicks() >= Vex.Flow.durationToTicks("4")) {
                beamable = false;
              }
            });
            return beamable;
          }
          return false;
        });
      }

      // Splits up groups by Rest
      function sanitizeGroups() {
        var sanitizedGroups = [];
        noteGroups.forEach(function(group) {
          var tempGroup = [];
          group.forEach(function(note, index, group) {
            var isFirstOrLast = index === 0 || index === group.length - 1;
            var prevNote = group[index-1];

            var breaksOnEachRest = !config.beam_rests && note.isRest();
            var breaksOnFirstOrLastRest = (config.beam_rests &&
                                           config.beam_middle_only && note.isRest() && isFirstOrLast);

            var breakOnStemChange = false;
            if (config.maintain_stem_directions && prevNote &&
                !note.isRest() && !prevNote.isRest()) {
              var prevDirection = prevNote.getStemDirection();
              var currentDirection = note.getStemDirection();
              breakOnStemChange = currentDirection !== prevDirection;
            }

            var isUnbeamableDuration = parseInt(note.duration, 10) < 8;

            // Determine if the group should be broken at this note
            var shouldBreak = breaksOnEachRest || breaksOnFirstOrLastRest ||
                              breakOnStemChange || isUnbeamableDuration;

            if (shouldBreak) {
              // Add current group
              if (tempGroup.length > 0) {
                sanitizedGroups.push(tempGroup);
              }

              // Start a new group. Include the current note if the group
              // was broken up by stem direction, as that note needs to start
              // the next group of notes
              tempGroup = breakOnStemChange ? [note] : [];
            } else {
              // Add note to group
              tempGroup.push(note);
            }
          });

          // If there is a remaining group, add it as well
          if (tempGroup.length > 0) {
            sanitizedGroups.push(tempGroup);
          }
        });

        noteGroups = sanitizedGroups;
      }

      function formatStems() {
        noteGroups.forEach(function(group){
          var stemDirection;
          if (config.maintain_stem_directions) {
            var note = findFirstNote(group);
            stemDirection = note ? note.getStemDirection() : Stem.UP;
          } else {
            if (config.stem_direction){
              stemDirection = config.stem_direction;
            } else {
              stemDirection = calculateStemDirection(group);
            }
          }
          applyStemDirection(group, stemDirection);
        });
      }

      function findFirstNote(group) {
        for (var i = 0; i < group.length; i++) {
          var note = group[i];
          if (!note.isRest()) {
            return note;
          }
        }

        return false;
      }

      function applyStemDirection(group, direction) {
        group.forEach(function(note){
          note.setStemDirection(direction);
        });
      }

      function getTupletGroups() {
        return noteGroups.filter(function(group){
          if (group[0]) return group[0].tuplet;
        });
      }


      // Using closures to store the variables throughout the various functions
      // IMO Keeps it this process lot cleaner - but not super consistent with
      // the rest of the API's style - Silverwolf90 (Cyril)
      createGroups();
      sanitizeGroups();
      formatStems();

      // Get the notes to be beamed
      var beamedNoteGroups = getBeamGroups();

      // Get the tuplets in order to format them accurately
      var tupletGroups = getTupletGroups();

      // Create a Vex.Flow.Beam from each group of notes to be beamed
      var beams = [];
      beamedNoteGroups.forEach(function(group){
        var beam = new Vex.Flow.Beam(group);

        if (config.show_stemlets) {
          beam.render_options.show_stemlets = true;
        }

        beams.push(beam);
      });

      // Reformat tuplets
      tupletGroups.forEach(function(group){
        var firstNote = group[0];
        for (var i=0; i<group.length; ++i) {
          if (group[i].hasStem()) {
            firstNote = group[i];
            break;
          }
        }

        var tuplet = firstNote.tuplet;

        if (firstNote.beam) tuplet.setBracketed(false);
        if (firstNote.stem_direction == Stem.DOWN) {
          tuplet.setTupletLocation(Vex.Flow.Tuplet.LOCATION_BOTTOM);
        }
      });

      return beams;
    };

    return Beam;
  }());




});