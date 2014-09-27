/*
 * (C) Copyright 2014 Alexander Erhard (http://alexandererhard.com/).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
define([
    'vexflow',
    'mei2vf/event/EventUtil'
  ], function (VF, EventUtil) {


    var Chord = function (options) {

          var me = this, atts = options.atts, element = options.element;
          var hasDots, durAtt, durations = [], duration, keys = [], i, j, noteElements, dots;

          noteElements = options.noteElements;

          durAtt = atts.dur;

          if (durAtt) {
            duration = EventUtil.processAttsDuration(element, atts);
            dots = +atts.dots || 0;
            for (i = 0, j = noteElements.length; i < j; i += 1) {
              keys.push(EventUtil.getVexPitch(noteElements[i]));
            }
          } else {
            for (i = 0, j = noteElements.length; i < j; i += 1) {
              durations.push(+noteElements[i].getAttribute('dur'));
              dots =+noteElements[i].getAttribute('dots') || 0;
              keys.push(EventUtil.getVexPitch(noteElements[i]));
            }
            duration = EventUtil.translateDuration(element, Math.max.apply(Math, durations));
            for (i = 0; i < dots; i += 1) {
              duration += 'd';
            }
          }


          var vexOptions = {
            keys : keys,
            duration : duration,
            clef : options.clef.type,
            octave_shift : options.clef.shift
          };

          this.hasMeiStemDir = EventUtil.setStemDir(options, vexOptions);


          VF.StaveNote.call(this, vexOptions);

          for (i = 0; i < dots; i += 1) {
            this.addDotToAll();
          }

          this.setStave(options.stave);

          if (atts.ho) {
            EventUtil.processAttrHo(atts.ho, me, options.stave);
          }

          var articElements = element.getElementsByTagName('artic');
          for (i=0,j=articElements.length;i<j;i++) {
            EventUtil.addArticulation(me, articElements[i]);
          }

          if (atts.fermata) {
            EventUtil.addFermataAtt(me, element, atts.fermata);
          }
      if (atts['stem.mod']) {
        EventUtil.addStemModifier(this, element, atts['stem.mod']);
      }

        };

    Chord.prototype = Object.create(VF.StaveNote.prototype);

    Chord.prototype.beamable = true;

    return Chord;

  });

