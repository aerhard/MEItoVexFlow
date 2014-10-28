/*
 * MEItoVexFlow, EventPointerCollection class
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
  'vexflow',
  'meilib/MeiLib',
  'common/Logger',
  'common/RuntimeError',
  'common/Util'
], function (VF, MeiLib, Logger, RuntimeError, Util) {

  /**
   * @class EventPointerCollection
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

    createInfos : function (elements, measureElement) {
      var me = this, i, j, element, atts, startid, tstamp;

      var link_staveInfo = function (lnkelem) {
        return {
          stave_n : lnkelem.getAttribute('staff') || '1',
          layer_n : lnkelem.getAttribute('layer') || '1'
        };
      };

      // convert tstamp into startid in current measure
      var local_tstamp2id = function (tstamp, lnkelem, measureElement) {
        var stffinf = link_staveInfo(lnkelem);
        var stave = measureElement.querySelector('staff[n="' + stffinf.stave_n + '"]');
        if (!stave) {
          throw new RuntimeError('Could not find staff @n="' + stffinf.stave_n + '" in ' +
                                 Util.serializeElement(measureElement) + ' while processing ' + Util.serializeElement(lnkelem));
        }
        var layer = stave.querySelector('layer[n="' + stffinf.layer_n + '"]');
        if (!layer) {
          var layer_candid = stave.getElementsByTagName('layer')[0];
          if (layer_candid && !layer_candid.hasAttribute('n')) {
            layer = layer_candid;
          }
          if (!layer) {
            throw new RuntimeError('Could not find layer @n="' + stffinf.layer_n + '" in ' +
                                   Util.serializeElement(measureElement) + ' while processing ' + Util.serializeElement(lnkelem));
          }
        }
        var staveInfo = me.systemInfo.getStaveInfo(stffinf.stave_n);
        if (!staveInfo) {
          throw new RuntimeError('Cannot determine staff definition.');
        }
        var meter = staveInfo.getTimeSpec();
        if (!meter.count || !meter.unit) {
          throw new RuntimeError('Cannot determine meter; missing or incorrect @meter.count or @meter.unit.');
        }
        return MeiLib.tstamp2id(tstamp, layer, meter);
      };

      for (i = 0, j = elements.length; i < j; i++) {
        element = elements[i];

        atts = Util.attsToObj(element);

        startid = atts.startid;
        if (startid) {
          startid = startid.substring(1);
        } else {
          tstamp = atts.tstamp;
          if (tstamp) {
            startid = local_tstamp2id(tstamp, element, measureElement);
          } else {
            Logger.warn('@startid or @tstamp expected', Util.serializeElement(element) +
                                                        ' could not be processed because neither @startid nor @tstamp are specified.');
            return;
          }
        }
        me.allModels.push({
          element : element,
          atts : atts,
          startid : startid
        });
      }
    },


    createVexFromInfos : function (notes_by_id) {
      var me = this, i, model, note;
      i = me.allModels.length;
      while (i--) {
        model = me.allModels[i];
        note = notes_by_id[model.startid];
        if (note) {
          me.addToNote(model, note);
        } else {
          if (model.startid) {
            Logger.warn('Unknown reference', Util.serializeElement(model.element) +
                                             ' could not be processed because the reference "' + model.startid +
                                             '" could not be resolved.');
          } else {
            Logger.warn('Unknown reference', Util.serializeElement(model.element) +
                                             ' could not be processed because it could not be assigned to an element.');
          }
        }
      }
    },

    addToNote : function () {
      throw new RuntimeError('You have to provide an addToNote() method when inheriting MEI2VF.EventPointerCollection.');
    }
  };

  return EventPointerCollection;

});
