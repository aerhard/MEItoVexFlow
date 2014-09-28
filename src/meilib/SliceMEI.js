define(function () {

  if (!window.MeiLib) window.MeiLib = {};

  /**
   * @method SliceMEI
   * Returns a slice of the MEI. The slice is specified by the number of the
   * starting and ending measures.
   *
   * About the <code>staves</code> parameter: it specifies a list of staff
   * numbers. If it is defined, only the listed staves will be kept in the
   * resulting slice. The following elements will be removed from:
   *
   * 1. <b>staffDef</b> elements (@staff value is matched against the specified list)
   * 2. <b>staff</b> elements (@n value is matched against the specified list)
   * 3. any other child element of measures that has
   *
   * @staff specified AND it is not listed.
   *
   * Note that <b>staff</b> elements without @n will be removed.
   *
   * @param {Object} MEI
   * @param {Object} params like { start_n:NUMBER, end_n:NUMBER, noKey:BOOLEAN,
 *            noClef:BOOLEAN, noMeter:BOOLEAN, noConnectors, staves:[NUMBER] },
   *            where <code>noKey</code>, <code>noClef</code> and
   *            <code>noMeter</code> and <code>noConnectors</code> are
   *            optional. taves is optional. If staves is set, it is an array of
   *            staff numbers. Only the staves specified in the list will be
   *            included in the resulting MEI.
   * @return XML DOM object
   */
  MeiLib.SliceMEI = function (MEI, params) {

    var i, j;

    var setVisibles = function (elements, params) {
      var i, j, elem;
      for (i = 0, j = elements.length; i < j; i++) {
        elem = elements[i];
        if (params.noClef) {
          elem.setAttribute('clef.visible', 'false');
        }
        if (params.noKey) {
          elem.setAttribute('key.sig.show', 'false');
        }
        if (params.noMeter) {
          elem.setAttribute('meter.rend', 'false');
        }
      }
    };

    /**
     * Keep or remove child from section depending whether it's inside the section or not.
     * If it's kept, remove unwanted staves
     */
    var keepOrRemove = function (elem, inside_slice, staffNSelector, params) {
      var i, j, staffElements, staffElement, n, removed = false;
      if (!inside_slice) {
        if (elem.localName === 'measure' && Number(elem.getAttribute('n')) === params.start_n) {
          inside_slice = true;
        } else {
          elem.parentNode.removeChild(elem);
          removed = true;
        }
      }

      if (inside_slice) {
        // remove unwanted staff
        if (params.staves && elem.nodeType === 1) {
//          $(elem).find('[staff]').remove(':not(' + staffNSelector + ')');

          var elementsToRemove = elem.querySelectorAll('[staff]' + staffNSelector);
          for (i= 0, j=elementsToRemove.length;i<j;i++){
            elementsToRemove[i].parentNode.removeChild(elementsToRemove[i]);
          }

          staffElements = elem.getElementsByTagName('staff');
          for (i = 0, j = staffElements.length; i < j; i++) {
            staffElement = staffElements[i];
            n = Number(staffElement.getAttribute('n'));
            if (params.staves.indexOf(n) === -1) {
              staffElement.parentNode.removeChild(staffElement);
              i--;
              j--;
            }
          }
        }

        // finish inside_slice state if it's the end of slice.
        if (elem.localName === 'measure' && Number(elem.getAttribute('n')) === params.end_n) {
          inside_slice = false;
        }
      }
      return {inside_slice: inside_slice, removed: removed};
    };

    var paramsStaves = params.staves;
    if (paramsStaves) {
      var staffDefSelector = '';
      var staffNSelector = '';
      for (i = 0, j = paramsStaves.length; i < j; i++) {
        staffDefSelector += ':not([n="' + paramsStaves[i] + '"])';
        staffNSelector += ':not([staff="' + paramsStaves[i] + '"])';
      }
    }

    var slice = MEI.cloneNode(true);
    if (paramsStaves) {
      var staffDefsToRemove = slice.querySelectorAll('staffDef' + staffDefSelector);

      for (i= 0, j=staffDefsToRemove.length;i<j;i++){
        staffDefsToRemove[i].parentNode.removeChild(staffDefsToRemove[i]);
      }
      //$(slice.getElementsByTagName('staffDef')).remove(':not(' + staffDefSelector + ')');
    }
    if (params.noClef || params.noKey || params.noMeter) {
      var scoreDef = slice.getElementsByTagName('scoreDef')[0];
      var staffDefs = scoreDef.getElementsByTagName('staffDef');
      setVisibles([scoreDef], params);
      setVisibles(staffDefs, params);
    }
    if (params.noConnectors) {
      var staffGrpElements = slice.getElementsByTagName('staffGrp');
      for (i = 0, j = staffGrpElements.length; i < j; i++) {
        staffGrpElements[i].removeAttribute('symbol');
      }

    }
    var section = slice.getElementsByTagName('section')[0];
    var inside_slice = false;

    /*
     * Iterate through each child of the section and remove everything outside
     * the slice. Remove
     */
    var section_children = section.childNodes;
    var sectionChild;

//    $(section_children).each(function () {

    var o, p, q, r, res;
    for (o=0,p=section_children.length;o<p;o++) {

      sectionChild = section_children[o];

      if (sectionChild.localName === 'ending') {
        var ending_children = sectionChild.childNodes;

        for (q=0,r=ending_children.length;q<r;q++){
          res = keepOrRemove(ending_children[q], inside_slice, staffNSelector, params);
          inside_slice = res.inside_slice;
          if (res.removed){
            q--;
            r--;
          }
        }
        if (sectionChild.getElementsByTagName('measure').length === 0) {
          sectionChild.parentNode.removeChild(sectionChild);
          o--;
          p--;
        }
      } else {
        res = keepOrRemove(sectionChild, inside_slice, staffNSelector, params);
        inside_slice = res.inside_slice;
        if (res.removed){
          o--;
          p--;
        }
      }

    }

    return slice;
  };

  return MeiLib;

});