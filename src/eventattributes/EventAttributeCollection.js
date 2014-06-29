define([
  'jquery',
  'vexflow',
  'meilib/MeiLib',
  'core/RuntimeError',
  'core/Util'
], function($, VF, MeiLib, RuntimeError, Util, undefined) {

  /**
     * @class MEI2VF.EventAttributeCollection
     * @private
     *
     * @constructor
     */
    var EventAttributeCollection = function(systemInfo, font) {
      this.init(systemInfo, font);
    };

    EventAttributeCollection.prototype = {

      BOTTOM : VF.Annotation.VerticalJustify.BOTTOM,

      /**
       * initializes the EventAttributeCollection
       */
      init : function(systemInfo, font) {
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

      createVexFromInfos : function() {
        throw new RuntimeError('MEI2VF.DEVELOPMENT_ERROR.createVexFromInfos', 'You have to prodide a createVexFromInfos method when inheriting MEI2VF.EventAttributeCollection.');
      },

      createInfos : function(elements, measureElement) {
        var me = this;

        var link_staffInfo = function(lnkelem) {
          return {
            staff_n : $(lnkelem).attr('staff') || '1',
            layer_n : $(lnkelem).attr('layer') || '1'
          };
        };

        // convert tstamp into startid in current measure
        var local_tstamp2id = function(tstamp, lnkelem, measureElement) {
          var stffinf = link_staffInfo(lnkelem);
          var staff = $(measureElement).find('staff[n="' + stffinf.staff_n + '"]');
          var layer = $(staff).find('layer[n="' + stffinf.layer_n + '"]').get(0);
          if (!layer) {
            var layer_candid = $(staff).find('layer');
            if (layer_candid && !layer_candid.attr('n'))
              layer = layer_candid;
            if (!layer)
              throw new RuntimeError('MEI2VF.RERR.createInfos:E01', 'Cannot find layer');
          }
          var staffdef = me.systemInfo.getStaffInfo(stffinf.staff_n);
          if (!staffdef)
            throw new RuntimeError('MEI2VF.RERR.createInfos:E02', 'Cannot determine staff definition.');
          var meter = staffdef.meter;
          if (!meter.count || !meter.unit)
            throw new RuntimeError('MEI2VF.RERR.createInfos:E03', "Cannot determine meter; missing or incorrect @meter.count or @meter.unit.");
          return MeiLib.tstamp2id(tstamp, layer, meter);
        };

        $.each(elements, function() {
          var atts, startid, tstamp;

          atts = Util.attsToObj(this);

          startid = atts.startid;
          if (!startid) {
            tstamp = atts.tstamp;
            if (tstamp) {
              startid = local_tstamp2id(tstamp, this, measureElement);
            } else {
              throw new RuntimeError('MEI2VF.RERR.createInfos', "Neither @startid nor @tstamp are specified");
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
      addModel : function(obj) {
        this.allModels.push(obj);
      },

      /**
       * gets all models
       * @return {Object[]} all models in {@link #allModels}
       */
      getModels : function() {
        return this.allModels;
      }
    };

  return EventAttributeCollection;

  });
