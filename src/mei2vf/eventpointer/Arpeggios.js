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
  'vex',
  'common/Logger',
  'common/Util',
  'mei2vf/Tables',
  'mei2vf/eventpointer/EventPointerCollection'
], function (VF, Vex, Logger, Util, Tables, EventPointerCollection) {

  /**
   * @class MEI2VF.Arpeggios
   * @extend MEI2VF.EventPointerCollection
   * @private
   *
   * @constructor
   */
  var Arpeggios = function (systemInfo) {
    this.init(systemInfo);
  };

  Vex.Inherit(Arpeggios, EventPointerCollection, {

    init : function (systemInfo, font) {
      Arpeggios.superclass.init.call(this, systemInfo, font);
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

        var pList;
        if (atts.plist) {
          pList = Util.pListToArray(atts.plist);
        }
        
        // TODO handle arpeggio over multiple notes / chords!

        // for now, only look for the first id in the plist

        if (pList && pList[0]) {
          startid = pList[0].substring(1);
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


    addToNote : function(model, note) {
      note.vexNote.addStroke(0, new VF.Stroke(0));
    }

  });

  return Arpeggios;

});
