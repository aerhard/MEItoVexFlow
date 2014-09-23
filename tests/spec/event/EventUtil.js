define([
  'mei2vf/event/EventUtil',
  'mei2vf/core/Logger'
], function (EventUtil, Logger, undefined) {

  describe("EventUtil", function () {

    describe("getVexPitch()", function () {

      beforeEach(function() {
        spyOn(Logger, 'warn');
      });

      it('warns when the parameter doesn\'t have a @pname and @oct attribute and returns "c/4"', function () {
        var pitch = EventUtil.getVexPitch($('<note/>').get(0));
        expect(pitch).toEqual('c/4');
        expect(Logger.warn).toHaveBeenCalled();
      });

      it('warns when the parameter\'s @pname and @oct attributes are empty and returns "c/4"', function () {
        var pitch = EventUtil.getVexPitch($('<note pname="" oct=""/>').get(0));
        expect(pitch).toEqual('c/4');
        expect(Logger.warn).toHaveBeenCalled();
      });

      it('warns when the parameter doesn\'t have a @pname attribute and returns "c/4"', function () {
        var pitch = EventUtil.getVexPitch($('<note oct="2"/>').get(0));
        expect(pitch).toEqual('c/4');
        expect(Logger.warn).toHaveBeenCalled();
      });

      it('warns when the parameter doesn\'t have an @oct attribute and returns "c/4"', function () {
        var pitch = EventUtil.getVexPitch($('<note pname="a"/>').get(0));
        expect(pitch).toEqual('c/4');
        expect(Logger.warn).toHaveBeenCalled();
      });

      it('doesn\'t warn when the parameter does have @pname and @oct attribute values and generates a VexFlow pitch', function () {
        var pitch = EventUtil.getVexPitch($('<note pname="a" oct="5"/>').get(0));
        expect(pitch).toEqual('a/5');

        var pitch = EventUtil.getVexPitch($('<note pname="a" oct="0"/>').get(0));
        expect(pitch).toEqual('a/0');

        expect(Logger.warn).not.toHaveBeenCalled();
      });

    });


  });

});