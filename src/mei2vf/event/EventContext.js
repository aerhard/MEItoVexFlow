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
  'common/Logger'
], function (VF, Logger) {


  var EventContext = function (notes_by_id, system_n, stave, stave_n, beamInfosToResolve) {

    var me = this;
    /**
     * inBeamNo specifies the number of beams the current events are under
     */
    me.inBeamNo = 0;
    /**
     * hasStemDirInBeam specifies if a stem.dir has been specified in the current beam
     */
    me.hasStemDirInBeam = false;
    me.hasSpaceInBeam = false;
    /**
     * Grace note or grace chord objects to be added to the next non-grace note or chord
     * @property {Vex.Flow.StaveNote[]} graceNoteQueue
     */
    me.graceNoteQueue = [];
    me.clefChangeInfo = null;

    me.notes_by_id = notes_by_id;
    me.system_n = system_n;
    me.stave = stave;
    me.stave_n = stave_n;
    me.beamInfosToResolve = beamInfosToResolve;
    me.newBeamInfosToResolve = [];

  };

  EventContext.prototype = {

    setLayerDir : function (layerDir) {
      this.layerDir = layerDir;
    },

    getLayerDir : function () {
      return this.layerDir;
    },

    getStave : function () {
      return this.stave;
    },

    enterBeam : function () {
      this.inBeamNo += 1;
    },

    exitBeam : function () {
      var me = this;
      me.inBeamNo -= 1;
      if (me.inBeamNo === 0) {
        me.hasStemDirInBeam = false;
        me.hasSpaceInBeam = false;
      }
    },

    addBeamInfoToResolve : function (element, vexNotes) {
      this.newBeamInfosToResolve.push({
        element : element,
        vexNotes : vexNotes
      });
    },

    shiftBeamInfoToResolve : function () {
      return this.beamInfosToResolve.shift();
    },

    setSpaceInBeam : function (val) {
      this.hasSpaceInBeam = val;
    },

    getSpaceInBeam : function () {
      return this.hasSpaceInBeam;
    },

    setStemDirInBeam : function (val) {
      this.hasStemDirInBeam = val;
    },

    getStemDirInBeam : function () {
      return this.hasStemDirInBeam;
    },

    isInBeam : function (){
      return this.inBeamNo > 0;
    },

    addEvent : function (xml_id, obj) {
      var me = this;
      obj.system = me.system_n;
      obj.layerDir = me.layerDir;
      me.notes_by_id[xml_id] = obj;
    },

    setClefChangeInfo : function (info) {
      this.clefChangeInfo = info;
    },

    getClefChangeInfo : function () {
      return this.clefChangeInfo;
    }

  };

  return EventContext;

});
