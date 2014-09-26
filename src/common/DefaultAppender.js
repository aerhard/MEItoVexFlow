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
], function () {

  var DefaultAppender = {
    error : function () {
      window.console.error('MEI2VF (' + arguments[0] + "): " + Array.prototype.slice.call(arguments, 1).join(' '));
    },
    info : function () {
      window.console.info('MEI2VF (' + arguments[0] + "): " + Array.prototype.slice.call(arguments, 1).join(' '));
    },
    warn : function () {
      window.console.warn('MEI2VF (' + arguments[0] + "): " + Array.prototype.slice.call(arguments, 1).join(' '));
    },
    debug : function () {
      window.console.log('MEI2VF (' + arguments[0] + "): " + Array.prototype.slice.call(arguments, 1).join(' '));
    }
  };

  return DefaultAppender;

});