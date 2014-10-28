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


  var Page = function () {
    this.init();
  };

  Page.prototype = {

    STAVE_HEIGHT : 40,

    init : function () {
      var me = this;
      /**
       * Contains all {@link System} objects
       * @property {System[]} systems
       */
      me.systems = [];
    },

    formatSystems : function (pageInfo, systemInfo, cfg, ctx) {
      var me = this, i, j, totalMinSystemWidth = 0, minSystemWidth, broadestSystemN = 1;
      var systems = me.systems;
      j = systems.length;

      // calculate page width if me.cfg.pageWidth is falsy
      if (!cfg.pageWidth) {
        for (i = 0; i < j; i++) {
          minSystemWidth = systems[i].preFormat(ctx);
          if (totalMinSystemWidth < minSystemWidth) {
            broadestSystemN = i;
            totalMinSystemWidth = minSystemWidth;
          }
        }

        // calculate the width of all systems based on the final width of the system with the
        // largest minSystemWidth and the default space to be added to each measure
        var totalSystemWidth = totalMinSystemWidth +
                               (systems[broadestSystemN].voiceFillFactorSum * cfg.defaultSpacingInMeasure);
        pageInfo.setPrintSpaceWidth(totalSystemWidth);

        for (i = 0; i < j; i++) {
          systems[i].setFinalMeasureWidths(totalSystemWidth);
          systems[i].format(ctx);
        }

      } else {
        // ... if me.cfg.pageWidth is specified, format the measures based on that width
        for (i = 0; i < j; i++) {
          minSystemWidth = systems[i].preFormat(ctx);
          systems[i].setFinalMeasureWidths();
          systems[i].format(ctx);
        }
      }

      pageInfo.setLowestY(systemInfo.getCurrentLowestY() + me.STAVE_HEIGHT);

    },

    addSystem : function (system, n) {
      this.systems[n] = system;
    },

    getSystems : function () {
      return this.systems;
    },

    setContext : function(ctx) {
      this.ctx = ctx;
      return this;
    },

    drawSystems : function (ctx) {
      var me = this, i, j, systems = me.systems, ctx = me.ctx;
      j = systems.length;
      for (i = 0; i < j; i++) {
        systems[i].draw(ctx);
      }
    }


  };

  return Page;

});
