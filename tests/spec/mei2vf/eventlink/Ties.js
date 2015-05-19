define([
  'mei2vf/eventlink/Ties'
], function (Ties, undefined) {

  describe("Ties", function () {

    describe("createSingleTie()", function () {

      describe("when only one note info object has indices", function () {

        it('initializes the other note with the provided indices', function () {

          var ties = new Ties();

          var noteInfo1 = {
            vexNote: {},
            index : 0
          };

          var noteInfo2 = {};

          ties.createSingleTie(noteInfo1, noteInfo2, {});
          ties.createSingleTie(noteInfo2, noteInfo1, {});

          var hasEqualArrayValues = function (arr1, arr2) {
            return (arr1.length == arr2.length) && arr1.every(function(element, index) {
                return element === arr2[index];
              });
          };

          expect(ties.allVexObjects.length).toEqual(2);
          expect(hasEqualArrayValues(ties.allVexObjects[0].first_indices, ties.allVexObjects[0].last_indices)).toBe(true);
          expect(hasEqualArrayValues(ties.allVexObjects[1].first_indices, ties.allVexObjects[1].last_indices)).toBe(true);

        });

      });

    });

  });

});