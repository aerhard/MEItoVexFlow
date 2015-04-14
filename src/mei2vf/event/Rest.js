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
  'mei2vf/event/EventUtil',
  'common/Util'
], function (VF, EventUtil, Util) {


  var Rest = function (options) {
    var dots, i, vexOptions, atts;

    atts = Util.attsToObj(options.element);


    var duration = EventUtil.processAttsDuration(options.element, atts) + 'r';

    if (options.clef) {
      vexOptions = {
        duration: duration,
        keys : [atts.ploc + '/' + atts.oloc],
        clef : options.clef.type,
        octave_shift : options.clef.shift
      }
        this.manualPosition = true;
    } else {
      vexOptions = {
        duration: duration,
        keys : [(atts.dur === '1') ? 'd/5' : 'b/4']
      }
    }


    VF.StaveNote.call(this, vexOptions);

    if (atts.size === 'cue') {
      EventUtil.setCueSize.call(this);
    }


    dots = +atts.dots || 0;
    for (i = 0; i < dots; i += 1) {
      this.addDotToAll();
    }

    this.setStave(options.stave);

    if (atts.ho) {
      EventUtil.processAttrHo(atts.ho, this, options.stave);
    }

    if (atts.fermata) {
      EventUtil.addFermataAtt(this, options.element, atts.fermata);
    }

  };

  Rest.prototype = Object.create(VF.StaveNote.prototype);

  Rest.prototype.beamable = true;


  return Rest;

});

