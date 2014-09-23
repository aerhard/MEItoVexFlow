define([
  'm2v/eventlink/eventReference',
  'm2v/core/RuntimeError'
], function (EventReference, RuntimeError, undefined) {

  describe("EventReference", function () {

    var dict;

    var note1 = { localName : 'note', attrs : { id : 'n01', pname : 'a' } };
    var note2 = { localName : 'note', attrs : { id : 'n02', pname : 'b' } };
    var note3 = { localName : 'note', attrs : { id : 'n03', pname : 'c' } };
    var note4 = { localName : 'note', attrs : { id : 'n04', pname : 'd' } };
    var notes = [];

    it('getId() returns null after object construction without parameters', function () {
      console.log('\n\n************ Unit test: EventReference *********');
      var ref = new EventReference();
      expect(ref.getId()).toBeNull();
    });

    it('getId() returns the id passed to the constructor', function () {
      var ref = new EventReference('n01');
      expect(ref.getId()).toEqual('n01');
    });

    it('getId() returns the id set with setId()', function () {
      var ref = new EventReference();
      ref.setId('n01');
      expect(ref.getId()).toEqual('n01');
    });

    it('getId() returns null when xml:id and tstamp are undefined', function () {
      var ref = new EventReference();
      ref.setTStamp();
      expect(ref.getId()).toBeNull();
    });

    it('getId() returns null when tstamp but not xml:id are set', function () {
      var ref = new EventReference();
      ref.setTStamp('1.5');
      expect(ref.getId()).toBeNull();
    });

    it('setTStamp() leads to an error when no parameter is passed to the function but an xml:id exists', function () {
      var ref = new EventReference('n01');
      expect(function() {
        ref.setTStamp();
      }).toThrow(new RuntimeError('tstamp must be set in order to resolve reference.'));
    });

    it('getId() returns null when xml:id and tstamp are set, but no meicontext', function () {
      var ref = new EventReference('n01');
      ref.setTStamp('2.5');
      expect(ref.getId()).toBeNull();
    });

//
//    console.log('>>>>>setTStamp() and tryResolveReference() - all defined, but context');
//    var ref5 = new EventReference('n01');
//    try {
//      ref5.setTStamp('2.5');
//      console.log(ref5.getId()); //undefined
//    } catch (e) {
//      console.log(e.toString()); //'MEI2VF.EventReference: resolution of tstamp is not supported'
//    }

  });

});