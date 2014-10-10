define([
  'jquery'
], function ($) {

  return {

    createMEIFragment : function (str) {
      var wrappedString = '<test xmlns="http://www.music-encoding.org/ns/mei">' + str + '</test>';
      var doc = $($.parseXML(wrappedString));
      return $(doc.children()[0]).children()[0];
    }

  };

});