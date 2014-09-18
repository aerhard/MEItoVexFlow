/*
 * MEItoVexFlow, Util class
 * (based on meitovexflow.js)

 * Author: Alexander Erhard
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
  'vexflow',
  'meilib/MeiLib',
  'm2v/core/Logger',
  'm2v/core/RuntimeError',
  'm2v/core/Util'
], function ($, VF, MeiLib, Logger, RuntimeError, Util, undefined) {

  /**
   * @class MEI2VF.EventPointerCollection
   * @private
   *
   * @constructor
   */
  var EventPointerCollection = function (systemInfo, font) {
    this.init(systemInfo, font);
  };

  EventPointerCollection.prototype = {

    BOTTOM : VF.Annotation.VerticalJustify.BOTTOM,

    /**
     * initializes the EventPointerCollection
     */
    init : function (systemInfo, font) {
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
      this.font = font;
    },

    createVexFromInfos : function () {
      throw new RuntimeError('MEI2VF.DEVELOPMENT_ERROR.createVexFromInfos', 'You have to provide a createVexFromInfos method when inheriting MEI2VF.EventPointerCollection.');
    },

    createInfos : function (elements, measureElement) {
      var me = this;

      var link_staffInfo = function (lnkelem) {
        return {
          staff_n : $(lnkelem).attr('staff') || '1',
          layer_n : $(lnkelem).attr('layer') || '1'
        };
      };

      // convert tstamp into startid in current measure
      var local_tstamp2id = function (tstamp, lnkelem, measureElement) {
        var stffinf = link_staffInfo(lnkelem);
        var staff = $(measureElement).find('staff[n="' + stffinf.staff_n + '"]');
        var layer = $(staff).find('layer[n="' + stffinf.layer_n + '"]').get(0);
        if (!layer) {
          var layer_candid = $(staff).find('layer');
          if (layer_candid && !layer_candid.attr('n')) {
            layer = layer_candid;
          }
          if (!layer) {
            throw new RuntimeError('MEI2VF.RERR.createInfos:E01', 'Cannot find layer');
          }
        }
        var staffdef = me.systemInfo.getStaveInfo(stffinf.staff_n);
        if (!staffdef) {
          throw new RuntimeError('MEI2VF.RERR.createInfos:E02', 'Cannot determine staff definition.');
        }
        var meter = staffdef.getTimeSpec();
        if (!meter.count || !meter.unit) {
          throw new RuntimeError('MEI2VF.RERR.createInfos:E03', "Cannot determine meter; missing or incorrect @meter.count or @meter.unit.");
        }
        return MeiLib.tstamp2id(tstamp, layer, meter);
      };

      $.each(elements, function () {
        var atts, startid, tstamp;

        atts = Util.attsToObj(this);

        startid = atts.startid;
        if (startid) {
          startid = startid.substring(1);
        } else {
          tstamp = atts.tstamp;
          if (tstamp) {
            startid = local_tstamp2id(tstamp, this, measureElement);
          } else {
            Logger.log('warn', '@startid or @tstamp expected', Util.serializeElement(this) +
                                                               ' could not be processed because neither @startid nor @tstamp are specified.');
            return;
          }
        }
        me.allModels.push({
          element : this,
          atts : atts,
          startid : startid
        });
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
    }
  };

  return EventPointerCollection;

});
