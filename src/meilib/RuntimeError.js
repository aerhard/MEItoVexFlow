define(function () {

  if (!window.MeiLib) window.MeiLib = {};

  /**
   * @class RuntimeError
   *
   * @constructor
   * @param {String} errorcode
   * @param {String} message
   */
  MeiLib.RuntimeError = function (errorcode, message) {
    this.errorcode = errorcode;
    this.message = message;
  };
  /**
   * @method toString
   * @return {String} the string representation of the error
   */
  MeiLib.RuntimeError.prototype.toString = function () {
    return 'MeiLib.RuntimeError: ' + this.errorcode + ': ' + this.message ? this.message : "";
  };
  /**
   * @class MeiLib
   * @singleton
   */

  return MeiLib;

});