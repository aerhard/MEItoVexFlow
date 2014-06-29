define(function(undefined) {

    var Logger = {

    /**
     * @property {Boolean} enabled specifies if logging is enabled or disabled.
     * Defaults to false. Use {@link MEI2VF#setLogging setLogging()} to change
     * the value.
     * @private
     */
    enabled : false,

    /**
     * @method setEnabled enables or disables MEI2VF logging
     * @param {Boolean} value
     */
    setEnabled : function(value) {
      this.enabled = value;
    },

    /**
     * @method L the internal MEI2VF logging function. Passes the function
     * arguments to VexFlow's Vex.L function if {@link #enabled} is `true`
     * @private
     */
    log : function() {
      if (this.enabled)
        Vex.L("MEI2VF", arguments);
    }

  };

    return Logger;

});