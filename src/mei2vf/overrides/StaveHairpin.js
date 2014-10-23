/**
 * Modifications:
 * 1) Added ctx.save() etc
 */

define([
  'vexflow',
  'vex'
], function (VF, Vex) {

  // VexFlow - Music Engraving for HTML5
  // Copyright Mohit Muthanna 2010
  // This class by Raffaele Viglianti, 2012 http://itisnotsound.wordpress.com/
  //
  // This class implements hairpins between notes.
  // Hairpins can be either Crescendo or Descrescendo.

  /**
   * Create a new hairpin from the specified notes.
   *
   * @constructor
   * @param {!Object} notes The notes to tie up.
   * @param {!Object} type The type of hairpin
   */

  VF.StaveHairpin = (function () {
    function StaveHairpin(notes, type) {
      if (arguments.length > 0) this.init(notes, type);
    }

    StaveHairpin.type = {
      CRESC : 1,
      DECRESC : 2
    };

    /* Helper function to convert ticks into pixels.
     * Requires a Formatter with voices joined and formatted (to
     * get pixels per tick)
     *
     * options is struct that has:
     *
     *  {
     *   height: px,
     *   y_shift: px, //vertical offset
     *   left_shift_ticks: 0, //left horizontal offset expressed in ticks
     *   right_shift_ticks: 0 // right horizontal offset expressed in ticks
     *  }
     *
     **/
    StaveHairpin.FormatByTicksAndDraw = function (ctx, formatter, notes, type, position, options) {
      var ppt = formatter.pixelsPerTick;

      if (ppt == null) {
        throw new Vex.RuntimeError("BadArguments", "A valid Formatter must be provide to draw offsets by ticks.");
      }

      var l_shift_px = ppt * options.left_shift_ticks;
      var r_shift_px = ppt * options.right_shift_ticks;

      var hairpin_options = {
        height : options.height,
        y_shift : options.y_shift,
        left_shift_px : l_shift_px,
        right_shift_px : r_shift_px};

      new StaveHairpin({
        first_note : notes.first_note,
        last_note : notes.last_note
      }, type).setContext(ctx).setRenderOptions(hairpin_options).setPosition(position).draw();
    };

    StaveHairpin.prototype = {

    setMeiElement : function (element) {
      this.meiElement = element;
      return this;
    },

    getMeiElement : function () {
      return this.meiElement;
    },


      init : function (notes, type) {
        /**
         * Notes is a struct that has:
         *
         *  {
       *    first_note: Note,
       *    last_note: Note,
       *  }
         *
         **/

        this.setNotes(notes);
        this.hairpin = type;
        this.position = VF.Modifier.Position.BELOW;

        this.context = null;

        this.render_options = {
          height : 10,
          y_shift : 0, //vertical offset
          left_shift_px : 0, //left horizontal offset
          right_shift_px : 0 // right horizontal offset
        };

        this.setNotes(notes);
      },

      setContext : function (context) {
        this.context = context;
        return this;
      },

      setPosition : function (position) {
        if (position == VF.Modifier.Position.ABOVE || position == VF.Modifier.Position.BELOW) {
          this.position = position;
        }
        return this;
      },

      setRenderOptions : function (options) {
        if (options) {
          Vex.Merge(this.render_options, options);
        }
        return this;
      },

      /**
       * Set the notes to attach this hairpin to.
       *
       * @param {!Object} notes The start and end notes.
       */
      setNotes : function (notes) {
        if (!notes.first_note && !notes.last_note) {
          throw new Vex.RuntimeError("BadArguments", "Hairpin needs to have either first_note or last_note set.");
        }

        // Success. Lets grab 'em notes.
        this.first_note = notes.first_note;
        this.last_note = notes.last_note;
        return this;
      },

      renderHairpin : function (params) {
        var ctx = this.context;

        ctx.save();
        ctx.lineWidth = 1.3;
        ctx.beginPath();

        var dis = this.render_options.y_shift + 20;
        var y_shift = params.first_y;

        if (this.position == VF.Modifier.Position.ABOVE) {
          dis = -dis + 30;
          y_shift = params.first_y - params.staff_height;
        }

        var l_shift = this.render_options.left_shift_px;
        var r_shift = this.render_options.right_shift_px;

        var x, x1, y, height;
        x = params.first_x + l_shift;
        x1 = params.last_x + r_shift;
        y = y_shift + dis;
        height = this.render_options.height;

        this.x = x;
        this.x1 = x1;
        this.y = y;
        this.height = height;

        var height_diff;

        switch (this.hairpin) {
          case StaveHairpin.type.CRESC:
            if (params.continued_left) {
              height_diff = height * 0.2;
              ctx.moveTo(x1 + l_shift, y);
              ctx.lineTo(x, y + height_diff);
              ctx.moveTo(x + l_shift,  y + height - height_diff);
              ctx.lineTo(x1, y + height);
            } else {
              ctx.moveTo(x1, y);
              ctx.lineTo(x, y + (height / 2));
              ctx.lineTo(x1, y + height);
            }
            break;
          case StaveHairpin.type.DECRESC:
            if (params.continued_right) {
              height_diff = height * 0.2;
              ctx.moveTo(x + l_shift, y);
              ctx.lineTo(x1, y + height_diff);
              ctx.moveTo(x1 + l_shift,  y + height - height_diff);
              ctx.lineTo(x, y + height);
            } else {
              ctx.moveTo(x + l_shift, y);
              ctx.lineTo(x1, y + (height / 2));
              ctx.lineTo(x, y + height);
            }
            break;
          default:
            // Default is NONE, so nothing to draw
            break;
        }

        ctx.stroke();
        ctx.restore();
      },

      draw : function () {
        if (!this.context) throw new Vex.RERR("NoContext", "Can't draw Hairpin without a context.");

        var first_note = this.first_note;
        var last_note = this.last_note;
        var start, end;

        if (first_note && last_note) {
          start = first_note.getModifierStartXY(this.position, 0);
          end = last_note.getModifierStartXY(this.position, 0);

          this.renderHairpin({
            first_x : start.x,
            last_x : end.x,
            first_y : first_note.getStave().y + first_note.getStave().height,
            // currently not in use:
//            last_y : last_note.getStave().y + last_note.getStave().height,
            staff_height : first_note.getStave().height,
            continued_left : false,
            continued_right : false
          });
          return true;
        } else if (first_note) {
          start = first_note.getModifierStartXY(this.position, 0);
          this.renderHairpin({
            first_x : start.x,
            last_x : first_note.getStave().getSlurEndX(),
            first_y : first_note.getStave().y + first_note.getStave().height,
            // currently not in use:
            //            last_y : last_note.getStave().y + last_note.getStave().height,
            staff_height : first_note.getStave().height,
            continued_left : false,
            continued_right : true
          });
          return true;

        } else {
          end = last_note.getModifierStartXY(this.position, 0);
          this.renderHairpin({
            first_x : last_note.getStave().getSlurStartX(),
            last_x : end.x,
            first_y : last_note.getStave().y + last_note.getStave().height,
            // currently not in use:
            //            last_y : last_note.getStave().y + last_note.getStave().height,
            staff_height : last_note.getStave().height,
            continued_left : true,
            continued_right : false
          });
        }

      }
    };
    return StaveHairpin;
  }());


});

