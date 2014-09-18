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
define(function (undefined) {

  /**
   * @property {Object} logLevels specifies the active log levels. Use {@link MEI2VF#setLogging setLogging()} to change
   * the values.
   * @private
   */
  var logLevels = {
    error : true,
    warn : true,
    info : true
  };


  var Logger = {

    /**
     * @method setLogging sets the logging level. Values:
     *
     * - 'off': no logging
     * - 'debug' status messages
     * - 'info' unsupported elements
     * - 'warn' wrong encodings
     * - 'error' fatal errors
     * @param {String} value
     */
    setLogging : function (value) {
      var i, j, levels;
      levels = [
        'error',
        'warn',
        'info',
        'debug'
      ];
      logLevels = {};
      if (value === 'off') return;
      for (i = 0, j = levels.length; i < j; i += 1) {
        logLevels[levels[i]] = true;
        if (levels[i] === value) return;
      }
    },

    /**
     * @method L the MEI2VF logging function. Logs the arguments to the window
     * console if they are listed in {@link logLevels}
     * @private
     */
    log : function (level, caller) {
      if (logLevels[level] === true) {
        var line = Array.prototype.slice.call(arguments, 2).join(' ');
        window.console[level]('MEI2VF (' + caller + "): " + line);
      }
    }
  };

  return Logger;

});