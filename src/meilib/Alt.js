define(function () {

  if (!window.MeiLib) window.MeiLib = {};

  /**
   * Represents an MEI <b>app</b> or <b>choice</b> element.
   *
   * @class MeiLib.Alt
   * @constructor
   * @param {Element} elem
   * @param {String} xmlID the xml:id attribute value of the <b>app</b> or
   * <b>choice</b> element.
   * @param {String} parentID the xml:id attribute value of the direct parent
   * element of the <b>app</b> or <b>choice</b> element.
   * @param {String} tagname
   */
  MeiLib.Alt = function (elem, xmlID, parentID, tagname) {
    this.elem = elem;
    this.xmlID = xmlID;
    this.altitems = [];
    this.parentID = parentID;
    this.tagname = tagname;
  };

  MeiLib.Alt.prototype.getDefaultItem = function () {

    /* find the editors pick or the first alternative */
    var findDefault = function (altitems, editorspick_tagname, other_tagname) {
      var first_sic, alt;
      for (alt in altitems) {
        if (altitems[alt].tagname === editorspick_tagname) {
          return altitems[alt];
        } else if (!first_sic && (altitems[alt].tagname === other_tagname)) {
          first_sic = altitems[alt];
        }
      }
      return first_sic;
    };
    if (this.tagname === 'choice') {
      return findDefault(this.altitems, 'corr', 'sic');
    } else if (this.tagname === 'app') {
      //      return findDefault(this.altitems, 'lem', 'rdg');
      return findDefault(this.altitems, 'lem');
    }
  };

  return MeiLib;

});