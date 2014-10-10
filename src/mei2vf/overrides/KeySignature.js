define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {




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

});