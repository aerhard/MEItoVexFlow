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
var MEI2VF = ( function (m2v, MeiLib, VF, $, undefined) {


  m2v._template = function () {
    this.init();
  };

  Vex.Inherit(m2v._template, VF.StaveNote, {

  });


  return m2v;

}(MEI2VF || {}, MeiLib, Vex.Flow, jQuery));

