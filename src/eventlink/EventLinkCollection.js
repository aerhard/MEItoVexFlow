/*
 * MEItoVexFlow, EventLinkCollection class
 *
 * Author: Alexander Erhard
 * (based on meitovexflow.js)
 *
 * Copyright © 2014 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
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
define([
  'jquery',
  'meilib/MeiLib',
  'mei2vf/core/RuntimeError',
  'mei2vf/core/Util',
  'mei2vf/eventlink/EventLink'
], function ($, MeiLib, RuntimeError, Util, EventLink) {

  /**
   * @class MEI2VF.EventLinkCollection
   * @private
   *
   * @constructor
   */
  var EventLinkCollection = function (systemInfo, unresolvedTStamp2) {
    this.init(systemInfo, unresolvedTStamp2);
  };

  EventLinkCollection.prototype = {

    /**
     * initializes the EventLinkCollection
     */
    init : function (systemInfo, unresolvedTStamp2) {
      /**
       * @property
       */
      this.allVexObjects = [];
      /**
       * @property
       */
      this.allModels = [];
      /**
       * @property
       */
      this.systemInfo = systemInfo;
      /**
       * @property
       */
      this.unresolvedTStamp2 = unresolvedTStamp2;
    },

    validateAtts : function () {
      throw new RuntimeError('You have to provide a validateAtts() method when inheriting MEI2VF.EventLinkCollection.');
    },

    createVexFromInfos : function () {
      throw new RuntimeError('You have to provide a createVexFromInfos method when inheriting MEI2VF.EventLinkCollection.');
    },

    /**
     * create EventLink objects from  <b>tie</b>, <b>slur</b> or <b>hairpin</b>
     * elements
     */
    createInfos : function (link_elements, measureElement, measureIndex, systemInfo) {
      var me = this;

      var link_staveInfo = function (lnkelem) {
        return {
          stave_n : $(lnkelem).attr('staff') || '1',
          layer_n : $(lnkelem).attr('layer') || '1'
        };
      };

      // convert tstamp into startid in current measure
      var local_tstamp2id = function (tstamp, lnkelem, measureElement) {
        var stffinf = link_staveInfo(lnkelem);
        var stave = $(measureElement).find('staff[n="' + stffinf.stave_n + '"]');
        var layer = $(stave).find('layer[n="' + stffinf.layer_n + '"]').get(0);
        if (!layer) {
          var layer_candid = $(stave).find('layer');
          if (layer_candid && !layer_candid.attr('n')) {
            layer = layer_candid;
          }
          if (!layer) {
            throw new RuntimeError('Cannot find layer');
          }
        }
        var staveInfo = systemInfo.getStaveInfo(stffinf.stave_n);
        if (!staveInfo) {
          throw new RuntimeError('Cannot determine staff definition.');
        }
        var meter = staveInfo.getTimeSpec();
        if (!meter.count || !meter.unit) {
          throw new RuntimeError('Cannot determine meter; missing or incorrect @meter.count or @meter.unit.');
        }
        return MeiLib.tstamp2id(tstamp, layer, meter);
      };

      var measure_partOf = function (tstamp2) {
        return tstamp2.substring(0, tstamp2.indexOf('m'));
      };

      var beat_partOf = function (tstamp2) {
        return tstamp2.substring(tstamp2.indexOf('+') + 1);
      };

      $.each(link_elements, function () {
        var eventLink, atts, startid, tstamp, endid, tstamp2, measures_ahead;

        eventLink = new EventLink(null, null);

        atts = Util.attsToObj(this);

        me.validateAtts(atts);

        eventLink.setParams(atts);

        // find startid for eventLink. if tstamp is provided in the
        // element, tstamp will be calculated.
        startid = atts.startid;
        if (startid) {
          eventLink.setFirstId(startid.substring(1));
        } else {
          tstamp = atts.tstamp;
          if (tstamp) {
            startid = local_tstamp2id(tstamp, this, measureElement);
            eventLink.setFirstId(startid);
          }
          // else {
          // // no @startid, no @tstamp ==> eventLink.first_ref
          // remains empty.
          // }
        }

        // find end reference value (id/tstamp) of eventLink:
        endid = atts.endid;
        if (endid) {
          eventLink.setLastId(endid.substring(1));
        } else {
          tstamp2 = atts.tstamp2;
          if (tstamp2) {
            measures_ahead = +measure_partOf(tstamp2);
            if (measures_ahead > 0) {
              eventLink.setLastTStamp(beat_partOf(tstamp2));
              // register that eventLink needs context;
              // need to save: measure.n, link.stave_n,
              // link.layer_n
              var staveInfo = link_staveInfo(this);
              var target_measure_n = measureIndex + measures_ahead;
              var refLocationIndex = target_measure_n + ':' + staveInfo.stave_n + ':' + staveInfo.layer_n;
              if (!me.unresolvedTStamp2[refLocationIndex]) {
                me.unresolvedTStamp2[refLocationIndex] = [];
              }
              me.unresolvedTStamp2[refLocationIndex].push(eventLink);
            } else {
              endid = local_tstamp2id(beat_partOf(tstamp2), this, measureElement);
              eventLink.setLastId(endid);
            }
          }
          // else {
          // // TODO no @endid, no @tstamp2 ==> eventLink.last_ref remains empty.
          // }
        }
        me.addModel(eventLink);
      });
    },

    /**
     * adds a new model to {@link #allModels}
     * @param {Object} obj the object to add
     */
    addModel : function (obj) {
      this.allModels.push(obj);
    },

    /**
     * gets all models
     * @return {Object[]} all models in {@link #allModels}
     */
    getModels : function () {
      return this.allModels;
    },

    /**
     * sets the context for the link collection
     * @param {Object} ctx the canvas context
     */
    setContext : function (ctx) {
      this.ctx = ctx;
      return this;
    },

    /**
     * draws the link collection to the canvas set by {@link #setContext}
     */
    draw : function () {
      var ctx = this.ctx;
      $.each(this.allVexObjects, function () {
        this.setContext(ctx).draw();
      });
    }
  };

  return EventLinkCollection;

});
