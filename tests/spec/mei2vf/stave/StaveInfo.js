define([
  'tests/TestUtil',
  'mei2vf/stave/StaveInfo',
  'common/Util',
  'common/Logger',
  'common/RuntimeError'
], function (TestUtil, StaveInfo, Util, Logger, RuntimeError) {

  describe("StaveInfo", function () {

    var mei = TestUtil.createMEIFragment;

    describe("Constructor", function () {

      it('sets renderWith to parameters 3-5', function () {

        var staveInfo = new StaveInfo(undefined, undefined, false, false, false);

        expect(staveInfo.renderWith.clef).toEqual(false);
        expect(staveInfo.renderWith.keysig).toEqual(false);
        expect(staveInfo.renderWith.timesig).toEqual(false);

        staveInfo = new StaveInfo(undefined, undefined, true, true, true);

        expect(staveInfo.renderWith.clef).toEqual(true);
        expect(staveInfo.renderWith.keysig).toEqual(true);
        expect(staveInfo.renderWith.timesig).toEqual(true);

      });

      it('sets default key signature if no key signature is defined', function () {

        var staffDef = mei('<staffDef/>');
        var scoreDef = mei('<scoreDef/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, false, false, false);

        expect(staveInfo.keySpec.key).toEqual('C');
        expect(staveInfo.keySpec.meiElement).toEqual(staffDef);

      });

      it('prefers specifications in <staffDef> over those in <scoreDef>', function () {

        var staffDef = mei('<staffDef key.pname="a" key.mode="minor" meter.count="4" meter.unit="4" clef.shape="G" clef.line="2"/>');
        var scoreDef = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, false, false, false);

        expect(staveInfo.keySpec.key).toEqual('Am');
        expect(staveInfo.keySpec.meiElement).toEqual(staffDef);

        expect(staveInfo.timeSpec.count).toEqual(4);
        expect(staveInfo.timeSpec.unit).toEqual(4);
        expect(staveInfo.timeSpec.sym).toBeNull();
        expect(staveInfo.timeSpec.meiElement).toEqual(staffDef);

        expect(staveInfo.clef.type).toEqual('treble');
        expect(staveInfo.clef.shift).toBeUndefined();
        expect(staveInfo.clef.meiElement).toEqual(staffDef);

      });

      it('chooses specifications in <scoreDef> if they are not present in the <staffDef>', function () {

        var staffDef = mei('<staffDef/>');
        var scoreDef = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, false, false, false);

        expect(staveInfo.keySpec.key).toEqual('B');
        expect(staveInfo.keySpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.timeSpec.count).toEqual(2);
        expect(staveInfo.timeSpec.unit).toEqual(2);
        expect(staveInfo.timeSpec.sym).toEqual('C');
        expect(staveInfo.timeSpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.clef.type).toEqual('bass');
        expect(staveInfo.clef.shift).toEqual(-1);
        expect(staveInfo.clef.meiElement).toEqual(scoreDef);

      });

    });


    describe("updateDef", function () {

      it('doesn\t override specifications if no MEI elements have been passed', function () {

        var staffDef = mei('<staffDef/>');
        var scoreDef = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, false, false, false);

        staveInfo.updateDef(null, null);

        expect(staveInfo.keySpec.key).toEqual('B');
        expect(staveInfo.keySpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.timeSpec.count).toEqual(2);
        expect(staveInfo.timeSpec.unit).toEqual(2);
        expect(staveInfo.timeSpec.sym).toEqual('C');
        expect(staveInfo.timeSpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.clef.type).toEqual('bass');
        expect(staveInfo.clef.shift).toEqual(-1);
        expect(staveInfo.clef.meiElement).toEqual(scoreDef);

      });

      it('doesn\t override specifications if there are no relevant specifications in the elements passed', function () {

        var staffDef = mei('<staffDef/>');
        var scoreDef = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, false, false, false);

        var staffDef1 = mei('<staffDef/>');
        var scoreDef1 = mei('<scoreDef/>');

        staveInfo.updateDef(staffDef1, scoreDef1);

        expect(staveInfo.keySpec.key).toEqual('B');
        expect(staveInfo.keySpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.timeSpec.count).toEqual(2);
        expect(staveInfo.timeSpec.unit).toEqual(2);
        expect(staveInfo.timeSpec.sym).toEqual('C');
        expect(staveInfo.timeSpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.clef.type).toEqual('bass');
        expect(staveInfo.clef.shift).toEqual(-1);
        expect(staveInfo.clef.meiElement).toEqual(scoreDef);

      });


      it('overrides with specifications in <staffDef> if present', function () {

        var staffDef = mei('<staffDef/>');
        var scoreDef = mei('<scoreDef key.pname="c" key.mode="major" meter.count="3" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="3" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, false, false, false);

        var staffDef1 = mei('<staffDef key.pname="a" key.mode="minor" meter.count="4" meter.unit="4" clef.shape="G" clef.line="2"/>');
        var scoreDef1 = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        staveInfo.updateDef(staffDef1, scoreDef1);

        expect(staveInfo.keySpec.key).toEqual('Am');
        expect(staveInfo.keySpec.meiElement).toEqual(staffDef);

        expect(staveInfo.timeSpec.count).toEqual(4);
        expect(staveInfo.timeSpec.unit).toEqual(4);
        expect(staveInfo.timeSpec.sym).toBeNull();
        expect(staveInfo.timeSpec.meiElement).toEqual(staffDef);

        expect(staveInfo.clef.type).toEqual('treble');
        expect(staveInfo.clef.shift).toBeUndefined();
        expect(staveInfo.clef.meiElement).toEqual(staffDef);

      });

      it('overrides with specifications in <scoreDef> if not present in <staffDef>', function () {

        var staffDef = mei('<staffDef/>');
        var scoreDef = mei('<scoreDef key.pname="c" key.mode="major" meter.count="3" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="3" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, false, false, false);

        var staffDef1 = mei('<staffDef/>');
        var scoreDef1 = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        staveInfo.updateDef(staffDef1, scoreDef1);

        expect(staveInfo.keySpec.key).toEqual('B');
        expect(staveInfo.keySpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.timeSpec.count).toEqual(2);
        expect(staveInfo.timeSpec.unit).toEqual(2);
        expect(staveInfo.timeSpec.sym).toEqual('C');
        expect(staveInfo.timeSpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.clef.type).toEqual('bass');
        expect(staveInfo.clef.shift).toEqual(-1);
        expect(staveInfo.clef.meiElement).toEqual(scoreDef);

      });


      it('overrides with specifications in <scoreDef> if <staffDef> is undefined', function () {

        var staffDef = mei('<staffDef/>');
        var scoreDef = mei('<scoreDef key.pname="c" key.mode="major" meter.count="3" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="3" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, false, false, false);

        var scoreDef1 = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        staveInfo.updateDef(undefined, scoreDef1);

        expect(staveInfo.keySpec.key).toEqual('B');
        expect(staveInfo.keySpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.timeSpec.count).toEqual(2);
        expect(staveInfo.timeSpec.unit).toEqual(2);
        expect(staveInfo.timeSpec.sym).toEqual('C');
        expect(staveInfo.timeSpec.meiElement).toEqual(scoreDef);

        expect(staveInfo.clef.type).toEqual('bass');
        expect(staveInfo.clef.shift).toEqual(-1);
        expect(staveInfo.clef.meiElement).toEqual(scoreDef);

      });

    });

    describe("clefChangeInMeasure", function () {

      it('should set new clef properties', function () {

        var staffDef = mei('<staffDef key.pname="a" key.mode="minor" meter.count="4" meter.unit="4" clef.shape="G" clef.line="2"/>');
        var scoreDef = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, true, true, true);

        var clef = mei('<clef shape="C" line="4" dis="8" dis.place="below"/>');

        staveInfo.clefChangeInMeasure(clef);

        expect(staveInfo.clef.type).toEqual('tenor');
        expect(staveInfo.clef.shift).toEqual(-1);
        expect(staveInfo.clef.meiElement).toBe(clef);

      });

    });

    describe("updateRenderWith", function () {

      it('should set renderWith.clef to true if the current clef is defined by a <clef> and the new staff definition has diverging properties ', function () {

        var staffDef = mei('<staffDef key.pname="a" key.mode="minor" meter.count="4" meter.unit="4" clef.shape="G" clef.line="2"/>');
        var scoreDef = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, true, true, true);

        var clef = mei('<clef shape="C" line="4"/>');

        staveInfo.clefChangeInMeasure(clef);

        var staffDef1 = mei('<staffDef key.pname="a" key.mode="minor" meter.count="4" meter.unit="4" clef.shape="G" clef.line="2"/>');
        var scoreDef1 = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');
        staveInfo.updateDef(staffDef1, scoreDef1);

        expect(staveInfo.renderWith.clef).toEqual(true);

      });

      it('should set renderWith.clef to false if the current clef is defined by a <clef> and the new staff definition has corresponding properties ', function () {

        var staffDef = mei('<staffDef key.pname="a" key.mode="minor" meter.count="4" meter.unit="4" clef.shape="G" clef.line="2"/>');
        var scoreDef = mei('<scoreDef key.pname="b" key.mode="major" meter.count="2" meter.unit="2" meter.sym="C" clef.shape="F" clef.line="4" clef.dis="8" clef.dis.place="below"/>');

        var staveInfo = new StaveInfo(staffDef, scoreDef, true, true, true);

        var clef = mei('<clef shape="C" line="4"/>');

        staveInfo.clefChangeInMeasure(clef);

        var staffDef1 = mei('<staffDef key.pname="a" key.mode="minor" meter.count="4" meter.unit="4" clef.shape="C" clef.line="4"/>');

        staveInfo.updateDef(staffDef1, scoreDef);

        expect(staveInfo.renderWith.clef).toEqual(false);

      });

    });

  });

});