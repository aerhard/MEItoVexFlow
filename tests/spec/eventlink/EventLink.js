define([
  'm2v/eventlink/EventLink',
  'm2v/eventlink/EventReference'
], function (EventLink, EventReference, undefined) {

  describe("EventLink", function () {

    it('getFirstId() and getLastId() return null after object construction without parameters', function () {
      console.log('\n\n************ Unit test: EventLink *********');
      var  link = new EventLink();
      expect(link.getFirstId()).toBeNull();
      expect(link.getLastId()).toBeNull();
    });

    it('getFirstId() and getLastId() return the values passed in the constructor', function () {
      var link = new EventLink('n01', 'n02');
      expect(link.getFirstId()).toEqual('n01');
      expect(link.getLastId()).toEqual('n02');
    });

    it('xml:ids in EventReference passed with the corresponding setters override constructor parameters', function () {
      var link = new EventLink('n01', 'n02');
      var ref6 = new EventReference('n03');
      var ref7 = new EventReference('n04');
      link.setFirstRef(ref6);
      link.setLastRef(ref7);
      expect(link.getFirstId()).toEqual('n03');
      expect(link.getLastId()).toEqual('n04');
    });

    it('ID getters return the values passed with ID setters', function () {
      var link = new EventLink();
      link.setFirstId('n03');
      link.setLastId('n04');
      expect(link.getFirstId()).toEqual('n03');
      expect(link.getLastId()).toEqual('n04');
    });

    it('supports setting of tstamps', function () {
      var link = new EventLink();
      link.setFirstTStamp('1.5');
      link.setLastTStamp('1m+1');
      expect(link.getFirstId()).toBeNull();
      expect(link.getLastId()).toBeNull();
    });

    it('supports setting of mixed references', function () {
      var link = new EventLink();
      link.setFirstId('n01');
      link.setLastTStamp('1m+1');
      expect(link.getFirstId()).toEqual('n01');
      expect(link.getLastId()).toBeNull();
    });

  });

});