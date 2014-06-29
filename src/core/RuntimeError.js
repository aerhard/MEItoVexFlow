define(function(undefined) {

    /**
     * @class MEI2VF.RuntimeError
     * @private
     *
     * @constructor
     * @param {String} error_code
     * @param {String} message
     */
    var RuntimeError = function(error_code, message) {
      this.error_code = error_code;
      this.message = message;
    };

    /**
     * @method
     * @return {String} the string representation of the error
     */
    RuntimeError.prototype.toString = function() {
      return "MEI2VF.RUNTIME_ERROR: " + this.error_code + ': ' + this.message;
    };

    return RuntimeError;

});