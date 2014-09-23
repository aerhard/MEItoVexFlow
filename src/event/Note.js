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


  var Note = function (options) {
    var me = this, dots, i, element = options.element, atts = options.atts;

    var vexOptions = {
      keys : [options.vexPitch],
      duration : EventUtil.processAttsDuration(element, atts),
      clef : options.clef.type,
      octave_shift : options.clef.shift
    };

    this.hasMeiStemDir = EventUtil.setStemDir(options, vexOptions);


    VF.StaveNote.call(this, vexOptions);


    dots = +atts.dots || 0;
    for (i = 0; i < dots; i += 1) {
      this.addDotToAll();
    }

    this.setStave(options.stave);


    if (atts.accid) {
      EventUtil.processAttrAccid(atts.accid, this, 0);
    }
    if (atts.ho) {
      EventUtil.processAttrHo(atts.ho, this, options.stave);
    }

    $.each($(element).find('artic'), function () {
      EventUtil.addArticulation(me, this);
    });
    if (atts.fermata) {
      EventUtil.addFermataAtt(this, element, atts.fermata);
    }


  };

  Note.prototype = Object.create(VF.StaveNote.prototype);

  Note.prototype.beamable = true;

  return Note;

});

