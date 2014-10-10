define([
  'vexflow',
  'vex'
], function (VF, Vex, undefined) {

  VF.Articulation.prototype.setMeiElement = function (element) {
    this.meiElement = element;
    return this;
  };
  VF.Articulation.prototype.getMeiElement = function () {
    return this.meiElement;
  };

});