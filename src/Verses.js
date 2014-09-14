var MEI2VF = ( function(m2v, MeiLib, VF, $, undefined) {

    /**
     * @class MEI2VF.Verses
     * @private
     *
     * @constructor
     * @param {Object} config
     */
    m2v.Verses = function(config) {
      var me = this;
      me.hyphensByVerse = {};
      me.syllablesByVerse = {};
      me.font = config.font;
      me.maxHyphenDistance = config.maxHyphenDistance;
    };

    m2v.Verses.prototype = {

      /**
       * @public
       * @param annot
       * @param wordpos
       * @param verse_n
       * @param staff_n
       * @returns {m2v.Verses}
       */
      addSyllable : function(annot, wordpos, verse_n, staff_n) {
        var me = this;
        verse_n = verse_n || '1';
        if (!me.syllablesByVerse[verse_n]) {
          me.syllablesByVerse[verse_n] = [];
        }
        me.syllablesByVerse[verse_n].push(annot);
        if (wordpos) {
          if (!me.hyphensByVerse[verse_n]) {
            me.hyphensByVerse[verse_n] = me.newHyphenation();
          }
          me.hyphensByVerse[verse_n].addSyllable(annot, wordpos, staff_n);
        }
        return me;
      },

      newHyphenation : function() {
        return new m2v.Hyphenation(this.font, this.maxHyphenDistance);
      },

      /**
       * @public
       * @returns {m2v.Verses}
       */
      format : function() {
        var me = this, verse_n, text_line, verse, i, j;
        text_line = 0;
        for (verse_n in me.syllablesByVerse) {
          verse = me.syllablesByVerse[verse_n];
          for (i = 0, j = verse.length; i < j; i++) {
            verse[i].setTextLine(text_line);
          }
          text_line += 1;
        };
        return me;
      },

      /**
       * @public
       * @param ctx
       * @param leftX
       * @param rightX
       * @returns {m2v.Verses}
       */
      drawHyphens : function(ctx, leftX, rightX) {
        var me = this, verse_n;
        for (verse_n in me.hyphensByVerse) {
          me.hyphensByVerse[verse_n].setContext(ctx).draw(leftX, rightX);
        };
        return me;
      }

    };

    return m2v;

  }(MEI2VF || {}, MeiLib, Vex.Flow, jQuery));
