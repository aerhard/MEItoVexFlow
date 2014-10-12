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
  'common/Util',
  'mei2vf/Tables'
], function (VF, EventUtil, Util, Tables) {


  var MRest = function (options) {
    var dots, i, vexOptions, atts;

    atts = Util.attsToObj(options.element);

    var duration = new VF.Fraction(options.meter.count, options.meter.unit);
    var dur, keys;
    if (duration.value() == 2) {
      dur = Tables.durations['breve'];
      keys = ['b/4'];
    } else if (duration.value() == 4) {
      dur = Tables.durations['long'];
      keys = ['b/4']
    } else {
      dur = 'w';
      keys = ['d/5'];
    }


//    if (options.clef) {
//      vexOptions.keys = [atts.ploc + '/' + atts.oloc];
//      vexOptions.clef = me.systemInfo.getClef(stave_n);
//    } else {
//      vexOptions.keys = keys;
//    }

    if (options.clef) {
      vexOptions = {
        align_center : true,
        duration : dur + 'r',
        duration_override : duration,

        keys : [atts.ploc + '/' + atts.oloc],
        clef : options.clef.type,
        octave_shift : options.clef.shift
      };
    } else {
      vexOptions = {
        align_center : true,
        duration : dur + 'r',
        duration_override : duration,

        keys : keys
      };
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

  MRest.prototype = Object.create(VF.StaveNote.prototype);

  MRest.prototype.beamable = true;


  return MRest;

});

