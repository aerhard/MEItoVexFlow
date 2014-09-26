define(function () {

  var RuntimeError = function (message) {
    this.name = 'MEI2VF Runtime Error';
    this.message = message;
    this.stack = (new Error()).stack;
  };
  RuntimeError.prototype = new Error;

  return RuntimeError;

});