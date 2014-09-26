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


  var Space = function (options) {
    var vexOptions, atts;

    atts = Util.attsToObj(options.element);


    vexOptions = {
      duration: EventUtil.processAttsDuration(options.element, atts) + 'r'
    };

    VF.GhostNote.call(this, vexOptions);

    this.setStave(options.stave);

  };

  Space.prototype = Object.create(VF.GhostNote.prototype);

  Space.prototype.beamable = true;


  return Space;

});

