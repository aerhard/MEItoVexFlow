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
  'm2v/core/RuntimeError',
  'm2v/core/DefaultAppender'
], function (RuntimeError, DefaultAppender, undefined) {

  var emptyFn = function () {
  };

  var Logger = {

    error : emptyFn,
    info : emptyFn,
    warn : emptyFn,
    debug : emptyFn,

    /**
     * An appender object to which the log messages are sent; has to provide the methods error, info, warn and debug;
     * defaults to window.console
     */
    appender : DefaultAppender,

    /**
     * Sets the object to which log messages are sent
     * @param appender
     * @returns {Logger}
     */
    setAppender : function (appender) {
      if (typeof appender === 'object') {
        if (typeof appender.error === 'function' && typeof appender.warn === 'function' &&
            typeof appender.info === 'function' && typeof appender.debug === 'function') {
          this.appender = appender;
          return this;
        }
        throw new RuntimeError('Parameter object does not contain the expected appender methods.');
      }
      throw new RuntimeError('Parameter is not an object');
    },

    /**
     * @method setLevel sets the logging level. Values:
     *
     * - 'debug'|true debug messages
     * - 'info' info, e.g. unsupported elements
     * - 'warn' warnings, e.g. wrong encodings
     * - 'error' errors
     * - false no logging
     * @param {String} level
     */
    setLevel : function (level) {
      var i, j, allLevels, activate = false;
      allLevels = [
        'debug',
        'info',
        'warn',
        'error'
      ];
      if (level === true) activate = true;
      for (i = 0, j = allLevels.length; i < j; i += 1) {
        if (allLevels[i] === level) activate = true;
        if (activate) {
          this[allLevels[i]] = this.appender[allLevels[i]].bind(this.appender);
        } else {
          this[allLevels[i]] = emptyFn;
        }
      }
    },

    /**
     * @method log the MEI2VF logging function. Logs the arguments to the window
     * console if they are listed in {@link logLevels}
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