/*
 * StaveVoice.js Author: Zoltan Komives (zolaemil@gmail.com) Created:
 * 25.07.2013
 *
 * Copyright © 2012, 2013 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
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

define(function () {

  /**
   * @class MEI2VF.StaveVoice
   * @private
   *
   * @constructor
   * @param {Object} voice
   * @param {Object} stave_n
   */
  var StaveVoice = function (voice, stave_n) {
    this.voice = voice;
    this.stave_n = stave_n;
  };

  return StaveVoice;

});
