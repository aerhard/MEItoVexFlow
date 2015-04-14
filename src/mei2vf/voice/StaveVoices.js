/*
 * StaveVoices.js Author: Zoltan Komives (zolaemil@gmail.com) Created:
 * 25.07.2013
 *
 * Copyright © 2012, 2013 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
 * University of Maryland
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/*
 * Contributor: Alexander Erhard
 */
define([
    'vexflow',
    'mei2vf/voice/StaveVoice'
], function (VF, StaveVoice) {


    /**
     * @class MEI2VF.StaveVoices
     * Stores all voices in a given measure along with the respective staff id.
     * Passes all voices to Vex.Flow.Formatter and calls joinVoices, then draws
     * all voices.
     * @private
     *
     * @constructor
     */
    var StaveVoices = function () {
        this.all_voices = [];
        this.formatter = new VF.Formatter();
    };

    StaveVoices.prototype = {
        addStaffVoice: function (staveVoice) {
            this.all_voices.push(staveVoice);
        },

        addVoice: function (voice, stave_n) {
            this.addStaffVoice(new StaveVoice(voice, stave_n));
        },

        reset: function () {
            this.all_voices = [];
        },

        preFormat: function () {
            var me = this, all, stave_n, i, voice;
            all = me.all_voices;
            me.vexVoices = [];
            me.vexVoicesStaffWise = {};
            i = all.length;

            while (i--) {
                voice = all[i].voice;
                me.vexVoices.push(voice);
                stave_n = all[i].stave_n;
                if (me.vexVoicesStaffWise[stave_n]) {
                    me.vexVoicesStaffWise[stave_n].push(voice);
                } else {
                    me.vexVoicesStaffWise[stave_n] = [voice];
                }
            }

            me.formatter.preCalculateMinTotalWidth(me.vexVoices);
            return me.formatter.getMinTotalWidth();
        },

        /**
         * returns how much of the total tick count in the measure is actually used by the first voice
         * return {Number}
         */
        getFillFactor: function () {
            var voice = this.vexVoices[0], ticksUsed;
            ticksUsed = voice.getTicksUsed().numerator;
            return (ticksUsed === 0) ? 1 : ticksUsed / voice.getTotalTicks().numerator;
        },

        /**
         *
         * @param {Object} stave a staff in the current measure used to set
         * the x dimensions of the voice
         */
        format: function (stave) {
            var me = this, i, f, alignRests;
            f = me.formatter;
            for (i in me.vexVoicesStaffWise) {
                alignRests = (me.vexVoicesStaffWise[i].length > 1);
                //alignRests=false;
                f.joinVoices(me.vexVoicesStaffWise[i]);
                if (alignRests) {
                    var voicesInStave = me.vexVoicesStaffWise[i];
                    for (var j = 0; j < voicesInStave.length; j++) {
                        me.alignRestsToNotes(voicesInStave[j].tickables, true, true);
                    }
                }
            }

            var justifyWidth = stave.getNoteEndX() - stave.getNoteStartX() - 10;
            f.createTickContexts(me.vexVoices);
            f.preFormat(justifyWidth, stave.getContext(), me.vexVoices, null);
        },

        // TODO make dependend on clashes with notes etc

        // from VF's formatter, modified
        alignRestsToNotes: function (notes, align_all_notes, align_tuplets) {

            var lookAhead = function (notes, rest_line, i, compare) {
                // If no valid next note group, next_rest_line is same as current.
                var next_rest_line = rest_line;

                // Get the rest line for next valid non-rest note group.
                i++;
                while (i < notes.length) {
                    if (!notes[i].isRest() && !notes[i].shouldIgnoreTicks()) {
                        next_rest_line = notes[i].getLineForRest();
                        break;
                    }
                    i++;
                }
            };

            for (var i = 0; i < notes.length; ++i) {

                // ADDED CONDITION && !notes[i].manualPosition
                if (notes[i] instanceof Vex.Flow.StaveNote && notes[i].isRest()
                    && !notes[i].manualPosition) {
                    var note = notes[i];

                    if (note.tuplet && !align_tuplets) continue;

                    // If activated rests not on default can be rendered as specified.
                    var position = note.getGlyph().position.toUpperCase();
                    if (position != "R/4" && position != "B/4") {
                        continue;
                    }

                    if (align_all_notes || note.beam != null) {
                        // Align rests with previous/next notes.
                        var props = note.getKeyProps()[0];
                        if (i === 0) {
                            props.line = lookAhead(notes, props.line, i, false);
                            note.setKeyLine(0, props.line);
                        } else if (i > 0 && i < notes.length) {
                            // If previous note is a rest, use its line number.
                            var rest_line;
                            if (notes[i - 1].isRest()) {
                                rest_line = notes[i - 1].getKeyProps()[0].line;
                                props.line = rest_line;
                            } else {
                                rest_line = notes[i - 1].getLineForRest();
                                // Get the rest line for next valid non-rest note group.
                                props.line = lookAhead(notes, rest_line, i, true);
                            }
                            note.setKeyLine(0, props.line);
                        }
                    }
                }
            }

        },

        //    getStaveLowestY : function (stave_n) {
        //      var me=this, i, j, voices, lowestY = 0;
        //      voices = me.vexVoicesStaffWise[stave_n];
        //      if (voices) {
        //        console.log(voices);
        //        for (i=0,j=voices.length;i<j;i++) {
        //          lowestY = Math.max(lowestY, voices[i].boundingBox.y + voices[i].boundingBox.h);
        //        }
        //        return lowestY;
        //      }
        //    },

        // TODO: also use this for auto y formatting!!

        getYBounds: function () {
            var me = this, vStaveWise = me.vexVoicesStaffWise;
            var yBounds = {};
            for (var i in vStaveWise) {
                yBounds[i] = [];
                for (var k = 0, l = vStaveWise[i].length; k < l; k++) {
                    yBounds[i].push(vStaveWise[i][k].getBoundingBox());
                }
            }
            return yBounds;
        },


        draw: function (context) {
            var i, staveVoice, all_voices = this.all_voices;
            for (i = 0; i < all_voices.length; ++i) {
                staveVoice = all_voices[i];

                this.drawVoice.call(staveVoice.voice, context);
                //        staveVoice.voice.draw(context, staves[staveVoice.stave_n]);
            }
        },

        // modified version of VF.Voice.draw() which calls setStave with the voice's stave as parameter
        drawVoice: function (context) {
            var boundingBox = null;
            for (var i = 0; i < this.tickables.length; ++i) {
                var tickable = this.tickables[i];

                if (!tickable.getStave()) {
                    throw new Vex.RuntimeError("MissingStave", "The voice cannot draw tickables without staves.");
                }

                tickable.setStave(tickable.getStave());

                if (i === 0) boundingBox = tickable.getBoundingBox();

                if (i > 0 && boundingBox) {
                    var tickable_bb = tickable.getBoundingBox();
                    if (tickable_bb) boundingBox.mergeWith(tickable_bb);
                }

                tickable.setContext(context);
                tickable.draw();
            }

            this.boundingBox = boundingBox;
        }


    };


    return StaveVoices;

});
