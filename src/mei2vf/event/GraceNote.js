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


  var GraceNote = function (options) {
    var me = this, dots, i, j, element = options.element, atts = options.atts;

    var vexOptions = {
      keys : [options.vexPitch],
      duration : EventUtil.processAttsDuration(element, options.atts),
      clef : options.clef.type,
      octave_shift : options.clef.shift
    };

    this.hasMeiStemDir = EventUtil.setStemDir(options, vexOptions);


    VF.GraceNote.call(this, vexOptions);


    dots = +options.atts.dots || 0;
    for (i = 0; i < dots; i += 1) {
      this.addDotToAll();
    }

    this.slash = options.atts['stem.mod'] === '1slash';

    this.setStave(options.stave);

    var childNodes = element.childNodes;
    for (i = 0, j = childNodes.length; i < j; i++) {
      switch (childNodes[i].localName) {
        case 'accid':
          atts.accid = childNodes[i].getAttribute('accid');
          break;
        case 'artic':
          EventUtil.addArticulation(me, childNodes[i]);
          break;
        default:
          break;
      }
    }

    if (atts.accid) {
      EventUtil.processAttrAccid(atts.accid, this, 0);
    }
    if (atts.ho) {
      EventUtil.processAttrHo(atts.ho, this, options.stave);
    }
    if (atts.fermata) {
      EventUtil.addFermataAtt(this, element, atts.fermata);
    }


  };

  GraceNote.prototype = Object.create(VF.GraceNote.prototype);

  GraceNote.prototype.grace = true;
  //GraceNote.prototype.beamable = false;

  return GraceNote;

});

