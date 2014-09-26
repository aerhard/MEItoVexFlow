define(function () {

  if (!window.MeiLib) window.MeiLib = {};

  /**
   * @class MeiLib.Variant
   * Represents a <b>lem</b>, <b>rdg</b>, <b>sic</b> or <b>corr</b> element.
   *
   * @constructor
   * @param elem {Element}
   * @param xmlID {String} the xml:id attribute value of the element.
   * @param tagname {String} 'lem' for <b>lem</b> and 'rdg for <b>rdg</b> elements.
   * @param source {String} space-separated list of the source IDs what the given
   *            item belongs to.
   * @param resp {String} xmlID of the editor responsible for the given reading or
   *            correction.
   * @param n {String} @n attribute value of the element.
   */
  MeiLib.Variant = function (elem, xmlID, tagname, source, resp, n) {
    this.elem = elem;
    this.xmlID = xmlID;
    this.tagname = tagname;
    this.source = source;
    this.resp = resp;
    this.n = n;
  };

  return MeiLib;

});