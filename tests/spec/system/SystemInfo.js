define([
  'mei2vf/system/SystemInfo',
  'mei2vf/core/Util',
  'mei2vf/core/Logger',
  'mei2vf/core/RuntimeError'
], function (SystemInfo, Util, Logger, RuntimeError, undefined) {

  var createMEIFragment = function (str) {
    var wrappedString = '<test xmlns="http://www.music-encoding.org/ns/mei">' + str + '</test>';
    var doc = $($.parseXML(wrappedString));
    return $(doc.children()[0]).children()[0];
  };

  describe("SystemInfo", function () {

    describe("processStaffDef()", function () {

      it('should throw an error if a <staffDef> doesn\'t have @n convertible to an integer', function () {
        var element, systemInfo, i, data = ['<staffDef/>', '<staffDef n=""/>', '<staffDef n="a"/>'];
        systemInfo = new SystemInfo();
        for (i = 0; i < data.length; i++) {
          element = createMEIFragment(data[i]);
          expect(function() {
            systemInfo.processStaffDef(element);
          }).toThrow(new RuntimeError(Util.serializeElement(element) + ' must have an @n attribute of type integer.'));
        }
      });

      it('should return the staff number of the <staffDef>', function () {
        var element, systemInfo, i, data = [0, 1, 20], n;
        systemInfo = new SystemInfo();
        systemInfo.init();
        systemInfo.scoreDefElement = createMEIFragment('<scoreDef/>');
        for (i = 0; i < data.length; i++) {
          element = createMEIFragment('<staffDef n="' + data[i] + '"/>');
          n = systemInfo.processStaffDef(element);
          expect(n).toEqual(data[i]);
        }
      });

    });

  });

});