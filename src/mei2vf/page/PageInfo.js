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
], function (VF, Logger, undefined) {


  var PageInfo = function (config) {

    var me = this;

    me.pageTopMar = config.pageTopMar;
    me.pageLeftMar = config.pageLeftMar;
    me.pageRightMar = config.pageRightMar;
    me.pageBottomMar = config.pageBottomMar;

    /**
     * The print space coordinates calculated from the page config.
     * @property {Object} printSpace
     * @property {Number} printSpace.top
     * @property {Number} printSpace.left
     * @property {Number} printSpace.right
     * @property {Number} printSpace.width
     */
    me.printSpace = {
      // substract four line distances (40px) from pageTopMar in order
      // to compensate VexFlow's default top spacing / allow specifying
      // absolute values
      top : config.pageTopMar - 40,
      left : config.pageLeftMar,
      // not in use:
      //right : config.pageWidth - config.pageRightMar,
      width : (config.pageWidth === null) ? null : Math.floor(config.pageWidth - config.pageRightMar - config.pageLeftMar) - 1
    };

  };


  PageInfo.prototype = {

    getPrintSpace : function () {
      return this.printSpace;
    },

    setPrintSpaceWidth : function (width) {
      var me = this;
      me.printSpace.width = width;
      me.widthCalculated = true;
    },

    hasCalculatedWidth : function () {
      return !!this.widthCalculated;
    },

    getCalculatedWidth : function () {
      var me = this;
      return me.printSpace.width + me.pageLeftMar + me.pageRightMar;
    },

    setLowestY : function (lowestY) {
      this.lowestY = lowestY;
    },

    getCalculatedHeight : function () {
      return this.lowestY + this.pageBottomMar;
    }

  };


  return PageInfo;

});
