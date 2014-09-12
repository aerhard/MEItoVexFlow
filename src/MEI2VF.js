/**
 * @class MEI2VF
 */
var MEI2VF = ( function (m2v, MeiLib, VF, $, undefined) {


  /**
   * @property {Object} logLevels specifies the active log levels. Use {@link MEI2VF#setLogging setLogging()} to change
   * the values.
   * @private
   */
  m2v.logLevels = {
    error : true,
    warn : true,
    info : true
  };

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
  m2v.setLogging = function (value) {
    var i, j, levels;
    levels = [
      'error',
      'warn',
      'info',
      'debug'
    ];
    m2v.logLevels = {};
    if (value === 'off') return;
    for (i = 0, j = levels.length; i < j; i += 1) {
      m2v.logLevels[levels[i]] = true;
      if (levels[i] === value) return;
    }
  };

  /**
   * @method L the MEI2VF logging function. Logs the arguments to the window
   * console if they are listed in {@link m2v.logLevels}
   * @private
   */
  m2v.L = function (level, caller) {
    if (m2v.logLevels[level] === true) {
      var line = Array.prototype.slice.call(arguments, 2).join(" ");
      window.console[level]('MEI2VF (' + caller + "): " + line);
    }
  };

  /**
   * @class MEI2VF.RUNTIME_ERROR
   * @private
   *
   * @constructor
   * @param {String} error_code
   * @param {String} message
   */
  m2v.RUNTIME_ERROR = function (error_code, message) {
    this.error_code = error_code;
    this.message = message;
  };

  /**
   * @method
   * @return {String} the string representation of the error
   */
  m2v.RUNTIME_ERROR.prototype.toString = function () {
    return "MEI2VF.RUNTIME_ERROR: " + this.error_code + ': ' + this.message;
  };

  return m2v;

}(MEI2VF || {}, MeiLib, Vex.Flow, jQuery)
  );
