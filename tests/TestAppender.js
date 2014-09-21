define([
], function (undefined) {

  var TestAppender = {
    // error, info and warn throw errors for debugging
    error : function () {
      window.console.error('MEI2VF Test (' + arguments[0] + "): " + Array.prototype.slice.call(arguments, 1).join(' '));
      throw 'stopped flow for debugging';
    },
    info : function () {
      window.console.info('MEI2VF Test (' + arguments[0] + "): " + Array.prototype.slice.call(arguments, 1).join(' '));
      throw 'stopped flow for debugging';
    },
    warn : function () {
      window.console.warn('MEI2VF Test (' + arguments[0] + "): " + Array.prototype.slice.call(arguments, 1).join(' '));
      throw 'stopped flow for debugging';
    },
    debug : function () {
      window.console.log('MEI2VF Test (' + arguments[0] + "): " + Array.prototype.slice.call(arguments, 1).join(' '));
    }
  };

  return TestAppender;

});