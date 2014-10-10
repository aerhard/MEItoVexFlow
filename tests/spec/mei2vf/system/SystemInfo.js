define([
  'tests/TestUtil',
  'mei2vf/system/SystemInfo',
  'common/Util',
  'common/Logger',
  'common/RuntimeError'
], function (TestUtil, SystemInfo, Util, Logger, RuntimeError, undefined) {

  describe("SystemInfo", function () {

    var mei = TestUtil.createMEIFragment;

    describe("processStaffDef()", function () {

      it('should throw an error if a <staffDef> doesn\'t have @n convertible to an integer', function () {
        var element, systemInfo, i, data = ['<staffDef/>', '<staffDef n=""/>', '<staffDef n="a"/>'];
        systemInfo = new SystemInfo();
        for (i = 0; i < data.length; i++) {
          element = mei(data[i]);
          expect(function() {
            systemInfo.processStaffDef(element);
          }).toThrow(new RuntimeError(Util.serializeElement(element) + ' must have an @n attribute of type integer.'));
        }
      });

      it('should return the staff number of the <staffDef>', function () {
        var element, systemInfo, i, data = [0, 1, 20], n;
        systemInfo = new SystemInfo();
        systemInfo.init();
        systemInfo.scoreDefElement = mei('<scoreDef/>');
        for (i = 0; i < data.length; i++) {
          element = mei('<staffDef n="' + data[i] + '"/>');
          n = systemInfo.processStaffDef(element);
          expect(n).toEqual(data[i]);
        }
      });

    });

  });

});