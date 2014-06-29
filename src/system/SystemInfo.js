define([
  'jquery',
  'core/Logger',
  'core/RuntimeError',
  'system/StaffInfo'
], function($, Logger, RuntimeError, StaffInfo, undefined) {

  /**
     * @class MEI2VF.SystemInfo
     * Deals with MEI data provided by scoreDef, staffDef and staffGrp elements and its children
     * @private
     *
     * @constructor

     */
    var SystemInfo = function() {
      return;
    };

    SystemInfo.prototype = {

      // currently fixed
      STAVE_HEIGHT : 40, // VF.Staff.spacing_between_lines_px * 4;

      init : function(cfg, printSpace) {
        var me = this;
        me.cfg = cfg;
        me.printSpace = printSpace;

        /**
         * contains the current {@link MEI2VF.StaffInfo} objects
         */
        me.currentStaffInfos = [];
        /**
         * @property {Number} systemLeftMar the left margin of the
         * current system (additional to the left print space margin)
         */
        me.systemLeftMar = undefined;
        /**
         * @property {Number} currentLowestY the lowest Y coordinate of the
         * previously processed staffs
         */
        me.currentLowestY = 0;
        
        me.startConnectorInfos = {};
        me.inlineConnectorInfos = {}; 
        
      },

      setLeftMar : function(width) {
        this.systemLeftMar = width;
      },

      getLeftMar : function() {
        return this.systemLeftMar;
      },

      setModelForStaveRange : function(target, obj, add) {
        add = add || '';
        target[obj.top_staff_n + ':' + obj.bottom_staff_n + add] = obj;
      },

      /**
       *
       */
      setConnectorModels : function(staffGrp, range, isChild) {
        var me = this, symbol, barthru, first_n, last_n;

        first_n = range.first_n;
        last_n = range.last_n;
        symbol = $(staffGrp).attr('symbol');
        barthru = $(staffGrp).attr('barthru');

        Logger.log('Converter.setConnectorModels() {2}', 'symbol: ' + symbol, ' range.first_n: ' + first_n, ' range.last_n: ' + last_n);

        // # left connectors specified in the MEI file
        me.setModelForStaveRange(me.startConnectorInfos, {
          top_staff_n : first_n,
          bottom_staff_n : last_n,
          symbol : symbol || 'line',
          label : $(staffGrp).attr('label'),
          labelAbbr : $(staffGrp).attr('label.abbr')
        });

        // # left auto line, only (if at all) attached to
        // //staffGrp[not(ancestor::staffGrp)]
        if (!isChild && me.cfg.autoStaveConnectorLine) {
          me.setModelForStaveRange(me.startConnectorInfos, {
            top_staff_n : first_n,
            bottom_staff_n : last_n,
            symbol : (symbol === 'none') ? 'none' : 'line'
          }, 'autoline');
        }

        // # inline connectors
        if (barthru === 'true') {
          me.setModelForStaveRange(me.inlineConnectorInfos, {
            top_staff_n : first_n,
            bottom_staff_n : last_n,
            symbol : 'singleright' // default
          });
        }
      },

      getStaffInfo : function(staff_n) {
        return this.currentStaffInfos[staff_n];
      },

      getAllStaffInfos : function() {
        return this.currentStaffInfos;
      },

      /**
       *
       */
      getClef : function(staff_n) {
        var me = this, staff_info;
        staff_info = me.currentStaffInfos[staff_n];
        if (!staff_info) {
          throw new RuntimeError('MEI2VF.getClefForStaffNr():E01', 'No staff definition for staff n=' + staff_n);
        }
        return staff_info.getClef();
      },

      getCurrentLowestY : function() {
        return this.currentLowestY;
      },

      setCurrentLowestY : function(y) {
        this.currentLowestY = y;
      },

      getYs : function(currentSystemY) {
        var me = this, currentStaffY, i, j, isFirstStaff = true, infoSpacing, lowestYCandidate, ys = [];
        currentStaffY = 0;
        for ( i = 1, j = me.currentStaffInfos.length; i < j; i += 1) {
          if (me.currentStaffInfos[i]) {
            infoSpacing = me.currentStaffInfos[i].spacing;
            currentStaffY += (isFirstStaff) ? 0 : (infoSpacing !== null) ? me.STAVE_HEIGHT + me.currentStaffInfos[i].spacing : me.STAVE_HEIGHT + me.cfg.staveSpacing;
            ys[i] = currentSystemY + currentStaffY;
            isFirstStaff = false;
          }
        }
        lowestYCandidate = currentSystemY + currentStaffY + me.STAVE_HEIGHT;
        if (lowestYCandidate > me.currentLowestY)
          me.currentLowestY = lowestYCandidate;
        return ys;
      },

      forceSectionStartInfos : function() {
        var me = this, i = me.currentStaffInfos.length;
        while (i--) {
          if (me.currentStaffInfos[i])
            me.currentStaffInfos[i].forceSectionStartInfo();
        }
      },

      forceStaveStartInfos : function() {
        var me = this, i = me.currentStaffInfos.length;
        while (i--) {
          if (me.currentStaffInfos[i])
            me.currentStaffInfos[i].forceStaveStartInfo();
        }
      },

      /**
       *
       */
      processScoreDef : function(scoredef) {
        var me = this, i, j, children, systemLeftmar;
        systemLeftmar = $(scoredef).attr('system.leftmar');
        if ( typeof systemLeftmar === 'string') {
          me.setLeftMar(+systemLeftmar);
        }
        children = $(scoredef).children();
        for ( i = 0, j = children.length; i < j; i += 1) {
          me.processScoreDef_child(children[i]);
        }
      },

      /**
       * MEI element <b>scoreDef</b> may contain (MEI v2.1.0):
       * MEI.cmn: <b>meterSig</b> <b>meterSigGrp</b>
       * MEI.harmony: <b>chordTable</b> MEI.linkalign:
       * <b>timeline</b> MEI.midi: <b>instrGrp</b> MEI.shared:
       * <b>keySig</b> <b>pgFoot</b> <b>pgFoot2</b> <b>pgHead</b>
       * <b>pgHead2</b> <b>staffGrp</b> MEI.usersymbols:
       * <b>symbolTable</b>
       *
       * Supported elements: <b>staffGrp</b>
       *
       * @param {XMLElement} element the scoreDef element to process
       */
      processScoreDef_child : function(element) {
        var me = this;
        switch (element.localName) {
          case 'staffGrp' :
            me.processStaffGrp(element);
            break;
          case 'pgHead' :
            break;
          default :
            throw new RuntimeError('MEI2VF.RERR.NotSupported', 'Element <' + element.localName + '> is not supported in <scoreDef>');
        }
      },


      /**
       *
       * @param {XMLElement} staffGrp
       * @param {Boolean} isChild specifies if the staffGrp is a child of another
       *            staffGrp (auto staff connectors only get attached
       *            to the outermost staffGrp elements)
       * @return {Object} the range of the current staff group. Properties:
       *         first_n, last_n
       */
      processStaffGrp : function(staffGrp, isChild) {
        var me = this, range = {};
        $(staffGrp).children().each(function(i, childElement) {
          var childRange = me.processStaffGrp_child(childElement);
          Logger.log('Converter.processStaffGrp() {1}.{a}', 'childRange.first_n: ' + childRange.first_n, ' childRange.last_n: ' + childRange.last_n);
          if (i === 0)
            range.first_n = childRange.first_n;
          range.last_n = childRange.last_n;
        });
        me.setConnectorModels(staffGrp, range, isChild);
        return range;
      },

      /**
       * MEI element <b>staffGrp</b> may contain (MEI v2.1.0): MEI.cmn: meterSig
       * meterSigGrp MEI.mensural: mensur proport MEI.midi: instrDef
       * MEI.shared: clef clefGrp keySig label layerDef
       *
       * Supported elements: <b>staffGrp</b> <b>staffDef</b>
       *
       * @param {XMLElement} element
       * @return {Object} the range of staffs. Properties: first_n, last_n
       */
      processStaffGrp_child : function(element) {
        var me = this, staff_n;
        switch (element.localName) {
          case 'staffDef' :
            staff_n = me.processStaffDef(element);
            return {
              first_n : staff_n,
              last_n : staff_n
            };
          case 'staffGrp' :
            return me.processStaffGrp(element, true);
          default :
            throw new RuntimeError('MEI2VF.RERR.NotSupported', 'Element <' + element.localName + '> is not supported in <staffGrp>');
        }
      },

      /**
       * reads a staffDef, writes it to currentStaffInfos
       *
       * @param {XMLElement} staffDef
       * @return {Number} the staff number of the staffDef
       */
      processStaffDef : function(staffDef) {
        var me = this, staff_n, staff_info;
        staff_n = +$(staffDef).attr('n');
        staff_info = me.currentStaffInfos[staff_n];
        if (staff_info) {
          staff_info.updateDef(staffDef);
        } else {
          me.currentStaffInfos[staff_n] = new StaffInfo(staffDef, true, true, true);
        }
        return staff_n;
      }
    };

  return SystemInfo;

  });
