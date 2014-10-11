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

  var Articulation = function (type) {
    this.init(type);
  };

  Articulation.CATEGORY = "articulations";

  Vex.Inherit(Articulation, VF.Articulation, {

    init : function (type) {
      Articulation.superclass.init.call(this, type);
      this.meiElement = [];
    },

    addMeiElement : function (element) {
      this.meiElement.push(element);
      return this;
    },

    getMeiElement : function () {
      return this.meiElement;
    }

  });

  return Articulation;

});
