define([
  'jquery',
  'meilib/Alt',
  'meilib/Variant',
  'meilib/SliceMEI'
], function ($, Alt, Variant, SliceMEI) {

  if (!window.MeiLib) window.MeiLib = {};

  /**
   * @class MeiLib.MeiDoc
   * A Rich MEI is an MEI that contain ambiguity represented by Critical Apparatus
   * (<b>app</b>, <b>rdg</b>, etc.), or Editorial Transformation (<b>choice</b>,
   * <b>corr</b>, etc.)
   * elements.
   *
   * @constructor
   * @param {XMLDocument} meiXmlDoc the MEI document.
   */
  MeiLib.MeiDoc = function (meiXmlDoc) {
    if (meiXmlDoc) {
      this.init(meiXmlDoc);
    }
  }
  /**
   * @method init
   * Initializes a <code>MeiLib.MeiDoc</code> object.
   *
   * The constructor extracts information about alternative encodings and compiles
   * them into a JS object (this.ALTs). The obejcts are exposed as per the
   * following: 1. <code>sourceList</code> is the list of sources as defined in
   * the MEI header (meiHead). 2. <code>editorList</code> is the list of editors
   * listed in the MEI header. 3. <code>ALTs</code> is the object that contains
   * information about the alternative encodings. It contains one entry per for
   * each <b>app</b> or <b>choice</b> element. It is indexed by the xml:id
   * attribute value of the elements. 4. <code>altgroups</code> is the obejct that
   * contains how <b>app</b> and <b>choice</b> elements are grouped together to
   * form a logical unit of alternative encoding.
   *
   * @param {XMLDocument} meiXmlDoc an XML document containing the rich MEI
   */
  MeiLib.MeiDoc.prototype.init = function (meiXmlDoc) {
    this.xmlDoc = meiXmlDoc;
    this.rich_head = meiXmlDoc.getElementsByTagNameNS("http://www.music-encoding.org/ns/mei", 'meiHead')[0];
    this.rich_music = meiXmlDoc.getElementsByTagNameNS("http://www.music-encoding.org/ns/mei", 'music')[0];
    this.rich_score = this.rich_music.getElementsByTagName('score')[0];
    this.parseSourceList();
    this.parseEditorList();
    this.parseALTs();
    this.initAltgroups();
    this.initSectionView();
  }
  /**
   * @method getRichScore
   */
  MeiLib.MeiDoc.prototype.getRichScore = function () {
    return this.rich_score;
  }
  /**
   * @method getPlainScore
   */
  MeiLib.MeiDoc.prototype.getPlainScore = function () {
    return this.plain_score;
  }
  /**
   * @method getALTs
   */
  MeiLib.MeiDoc.prototype.getALTs = function () {
    return this.ALTs;
  }
  /**
   * @method getSourceList
   */
  MeiLib.MeiDoc.prototype.getSourceList = function () {
    return this.sourceList;
  }
  /**
   * @method getEditorList
   */
  MeiLib.MeiDoc.prototype.getEditorList = function () {
    return this.editorList;
  }
  /**
   * @method parseSourceList
   * Extracts information about the sources as defined in the MEI header.
   *
   * @return {Object} is a container indexed by the xml:id attribute value of the
   *         <b>sourceDesc</b> element.
   */
  MeiLib.MeiDoc.prototype.parseSourceList = function () {
    // var srcs = $(this.rich_head).find('sourceDesc').children();
    // this.sourceList = {};
    // var i
    // for(i=0;i<srcs.length;++i) {
    // var src = srcs[i];
    // var xml_id = $(src).attr('xml:id');
    // var serializer = new XMLSerializer();
    // this.sourceList[xml_id] = serializer.serializeToString(src);
    // }
    // return this.sourceList;
    this.sources = $(this.rich_head.getElementsByTagName('sourceDesc')).children();
    return this.sources;
  }
  /**
   * @method parseEditorList
   */
  MeiLib.MeiDoc.prototype.parseEditorList = function () {
    // var edtrs = $(this.rich_head).find('titleStmt').children('editor');
    // this.editorList = {};
    // var i
    // for(i=0;i<edtrs.length;++i) {
    // var edtr = edtrs[i];
    // var xml_id = $(edtr).attr('xml:id');
    // this.editorList[xml_id] = edtr;
    // }
    this.editors = $(this.rich_head.getElementsByTagName('titleStmt')).children('editor');
    return this.editors;
  }
  /**
   * @method parseALTs
   * Extracts information about the elements encoding alternatives. The method
   * stores its result in the <code>ALTs</code> property.
   *
   * <code>ALTs</code> is a container of MeiLib.Alt obejcts indexed by the
   * xml:id attribute value of the <b>app</b> or <b>choice</b> elements.
   */
  MeiLib.MeiDoc.prototype.parseALTs = function () {
    var i, j;
    this.ALTs = {};
    // console.log(this.rich_score);
    var apps = this.rich_score.querySelectorAll('app, choice');
    for (i = 0; i < apps.length; i++) {
      var app = apps[i];
      var parent = app.parentNode;
      var altitems = app.querySelectorAll('rdg, lem, sic, corr');
      var AppsItem = new MeiLib.Alt(app, MeiLib.XMLID(app), MeiLib.XMLID(parent), app.localName);
      AppsItem.altitems = {};
      for (j = 0; j < altitems.length; j++) {
        var altitem = altitems[j];
        var source = $(altitem).attr('source');
        var resp = $(altitem).attr('resp');
        var n = $(altitem).attr('n');
        var tagname = $(altitem).prop('localName');
        var varXMLID = MeiLib.XMLID(altitem);
        AppsItem.altitems[varXMLID] = new MeiLib.Variant(altitem, varXMLID, tagname, source, resp, n);
      }
      this.ALTs[MeiLib.XMLID(app)] = AppsItem;
    }
  }
  /**
   * @method initAltgroups
   */
  MeiLib.MeiDoc.prototype.initAltgroups = function () {
    var i, j, altgroup, token_list;
    //var ALTs = this.ALTs;
    var annots = $(this.rich_score).find('annot[type="appGrp"], annot[type="choiceGrp"]');
    this.altgroups = {};
    for (i = 0; i < annots.length; i++) {
      altgroup = [];
      token_list = $(annots[i]).attr('plist').split(' ');
      for (j = 0; j < token_list.length; j++) {
        altgroup.push(token_list[j].replace('#', ''));
      }
      for (j in altgroup) {
        this.altgroups[altgroup[j]] = altgroup;
      }
    }
  };
  /**
   * @method initSectionView
   * The MeiLib.MeiDoc.initSectionView transforms the rich MEI (this.rich_score)
   * into a plain MEI (this.sectionview_score)
   *
   * An MEI is called 'plain' MEI if it contains no <b>app</b> or <b>choice</b>
   * elements.
   * Such an MEI can also be referred after the analogy of 2D section views of a
   * 3D object: the rich MEI is a higher-dimensional object, of which we would
   * like to display a 'flat' section view. The term 'section plane' refers to a
   * combination of alternatives at different locations in the score. The section
   * plane defines the actual view of the higher-dimensional object. For instance,
   * consider a score that has two different variants at measure #5 (let's call
   * them (variant A and variant B), and it contains three different variants at
   * measure #10 (let's call those ones variants C, D and E). In this case the
   * section plane would contain two elements the first one is either A or B, the
   * second one is C, D or E.
   *
   * The extracted information about all the <b>app</b> and <b>choice</b> elements
   * are stored in an array. Using this array the application can access information
   * such as what alternative encodings are present in the score, what source a
   * variant comes from, etc. This array is exposed by te <code>ALTs</code>
   * property.
   *
   */

  MeiLib.MeiDoc.prototype.selectDefaultAlternative = function (alt) {
    var result = {};

    // TODO check: is it OK to query all descendant corr/sic etc elements? (or would children be better?) --
    // (nested apps)

    if (alt.localName === 'choice') {
      // ...the default replacement is...
      var corr = alt.getElementsByTagName('corr')[0];
      if (corr) {
        // ...the first corr...
        result.alt_item_xml_id = MeiLib.XMLID(corr);
        result.alt_item = corr;
        //...or
      } else {
        // ...the first sic.
        var sic = alt.getElementsByTagName('sic')[0];
        if (sic) {
          result.alt_item_xml_id = MeiLib.XMLID(sic);
          result.alt_item = sic;
        } else {
          result = {};
        }
      }
    } else {
      var lem = alt.getElementsByTagName('lem')[0];
      if (lem) {
        // ...the first lem...
        result.alt_item_xml_id = MeiLib.XMLID(lem);
        result.alt_item = lem;
        //...or nothing:
      } else {
        var rdg = alt.getElementsByTagName('rdg')[0];
        if (rdg) {
          // ...the first rdg...
          result.alt_item_xml_id = MeiLib.XMLID(rdg);
          result.alt_item = rdg;
          //...or nothing:
        } else {
          result = {};
        }
      }
    }
    return result;
  }

  MeiLib.MeiDoc.prototype.initSectionView = function (altReplacements) {
    altReplacements = altReplacements || {};
    // Make a copy of the rich MEI. We don't want to remove nodes from the
    // original object.
    this.sectionview_score = this.rich_score.cloneNode(true);
    this.sectionplane = {};

    // Transform this.sectionview_score into a plain MEI:
    //
    // * itereate through all <app> and <choice> elements:
    // o chose the appropriate rdg or lem defined by sectionplane
    // (sectionplane[app.xmlID]).
    // If nothing is defined, leave it empty.
    // o chose the appropriate sic or corr defined by sectionplance
    // (sectionplane[choice.xmlID])
    // If nothing is defined, chose the first corr, if exists, otherwise chose
    // sic, if exists.
    // When replacing an item, mark the location of replacement with XML
    // processing instructions.

    var alts = this.sectionview_score.querySelectorAll('app, choice');

    var alt_item_xml_id;
    var this_sectionview_score = this.sectionview_score;
    var this_sectionplane = this.sectionplane;
    var this_ALTs = this.ALTs;
    var xmlDoc = this.xmlDoc;
    var me = this;
    $(alts).each(function (i, alt) {
      var alt_xml_id = MeiLib.XMLID(alt);
      var replacement = altReplacements[alt_xml_id];
      if (replacement) {
        // apply replacement, or...
        alt_item_xml_id = replacement.xmlID;
        var alt_item2insert = $(this_sectionview_score).find(replacement.tagname + '[xml\\:id="' + alt_item_xml_id +
                                                             '"]')[0];
        if (!alt_item2insert) {
          throw new MeiLib.RuntimeError('MeiLib.MeiDoc.prototype.initSectionView():E01', "Cannot find <lem>, <rdg>, <sic>, or <corr> with @xml:id '" +
                                                                                         alt_item_xml_id + "'.");
        }
      } else {
        var defaultAlt = me.ALTs[alt_xml_id].getDefaultItem();
        if (defaultAlt) {
          alt_item_xml_id = defaultAlt.xmlID;
          alt_item2insert = defaultAlt.elem;
        }
      }
      var parent = alt.parentNode;
      var PIStart = xmlDoc.createProcessingInstruction('MEI2VF', 'rdgStart="' + alt_xml_id + '"');
      parent.insertBefore(PIStart, alt);
      if (alt_item2insert) {
        var childNodes = alt_item2insert.childNodes;
        var j;
        for (j = 0; j < childNodes.length; ++j) {
          parent.insertBefore(childNodes.item(j).cloneNode(true), alt);
        }
      }
      var PIEnd = xmlDoc.createProcessingInstruction('MEI2VF', 'rdgEnd="' + alt_xml_id + '"');
      parent.insertBefore(PIEnd, alt);
      parent.removeChild(alt);

      this_sectionplane[alt_xml_id] = [];
      if (this_ALTs[alt_xml_id].altitems[alt_item_xml_id]) {
        this_sectionplane[alt_xml_id].push(this_ALTs[alt_xml_id].altitems[alt_item_xml_id]);
      }
    });

    return this.sectionview_score;

  }
  /**
   * @method updateSectionView
   * Updates the sectionview score (plain MEI) by replacing one or more
   * alternative instance with other alternatives.
   *
   * @param sectionplaneUpdate
   *            {object} the list of changes. It is an container of xml:id
   *            attribute values of <b>rdg</b>, <b>lem</b>, <b>sic</b> or
   * <b>corr</b> elements,
   *            indexed by the xml:id attribute values of the corresponding
   * <b>app</b>
   *            or <b>choice</b> elements. sectionplaneUpdate[altXmlID] =
   * altInstXmlID
   *            is the xml:id attribute value of the <b>rdg</b>, <b>lem</b>,
   * <b>sic</b> or <b>corr</b>
   *            element, which is to be inserted in place of the original <app
   *            xml:id=altXmlID> or <b>choice xml:id=altXmlID</b> When replacing an
   *            <b>app</b> or <b>choice</b> that is part of a group of such
   * elements
   *            (defined by this.altgroups), then those other elements needs to be
   *            replaced as well.
   */
  MeiLib.MeiDoc.prototype.updateSectionView = function (sectionplaneUpdate) {

    var altID, altID__;

    var corresponding_alt_item = function (altitems, altitem) {
      var vars_match = function (v1, v2) {
        var res = 0;
        for (var field in v1) {
          if (v1[field] !== undefined && v1[field] === v2[field]) {
            res++;
          }
        }
        //      console.log('vars_match: ' + res);
        return res;
      }
      var max = 0;
      var corresponding_item, M;
      for (var alt_item_id in altitems) {
        M = vars_match(altitems[alt_item_id], altitem);
        if (max < M) {
          max = M;
          corresponding_item = altitems[alt_item_id];
        }
      }
      return corresponding_item;
    };

    for (altID in sectionplaneUpdate) {
      var this_ALTs = this.ALTs;
      var altitems2insert = [];
      // preserving backward compatibility:
      if (typeof sectionplaneUpdate[altID] === 'string') {
        sectionplaneUpdate[altID] = [sectionplaneUpdate[altID]];
      }
      if (sectionplaneUpdate[altID].length > 0) {
        $(sectionplaneUpdate[altID]).each(function () {
          altitems2insert.push(this_ALTs[altID].altitems[this]);
        });
      } else {
        var defaultAltItem = this.ALTs[altID].getDefaultItem();
        if (defaultAltItem) {
          altitems2insert.push(defaultAltItem);
        }
      }
      var altgroup = this.altgroups[altID];
      if (altgroup) {
        // if altID is present in altgroups, then replace all corresponding alts
        // with the
        // altitems that correspons to the any of the alt item that are being
        // inserted.
        var i;
        for (i = 0; i < altgroup.length; i++) {
          altID__ = altgroup[i];
          var altitems2insert__ = [];
          $(altitems2insert).each(function () {
            altitems2insert__.push(corresponding_alt_item(this_ALTs[altID__].altitems, this))
          });
          this.replaceAltInstance({
            appXmlID : altID__,
            replaceWith : altitems2insert__
          });
        }
      } else {
        // otherwise just replace alt[xml:id=altID] with the list of items
        this.replaceAltInstance({
          appXmlID : altID,
          replaceWith : altitems2insert
        });
      }
    }
  };
  /**
   * @method replaceAltInstance
   * Replace an alternative instance in the sectionview score and in the
   * sectionplane
   *
   * @param {Object} alt_inst_update
   * @return the updated score
   */
  MeiLib.MeiDoc.prototype.replaceAltInstance = function (alt_inst_update) {

    var extendWithNodeList = function (nodeArray, nodeList) {
      var res = nodeArray;
      var i;
      for (i = 0; i < nodeList.length; ++i) {
        res.push(nodeList.item(i));
      }
      return res;
    };
    var app_xml_id = alt_inst_update.appXmlID;
    var parent = $(this.sectionview_score).find('[xml\\:id=' + this.ALTs[app_xml_id].parentID + ']')[0];
    if (typeof parent === 'undefined') {
      return;
    }
    var children = parent.childNodes;

    var replaceWith = alt_inst_update.replaceWith;
    var nodes2insert = [];
    var this_rich_score = this.rich_score;
    if (replaceWith) {
      var i;
      for (i = 0; i < replaceWith.length; ++i) {
        var replaceWith_item = replaceWith[i];
        var replaceWith_xmlID = replaceWith_item.xmlID;
        var var_inst_elem = $(this_rich_score).find(replaceWith_item.tagname + '[xml\\:id="' + replaceWith_xmlID +
                                                    '"]')[0];
        nodes2insert = extendWithNodeList(nodes2insert, var_inst_elem.childNodes);
      }
    }
    //  console.log(nodes2insert)

    var match_pseudo_attrValues = function (data1, data2) {
      data1 = data1.replace("'", '"');
      data2 = data2.replace("'", '"');
      return data1 === data2;
    }
    var inside_inst = false;
    var found = false;
    var insert_before_this = null;
    $(children).each(function () {
      var child = this;
      if (child.nodeType === 7) {
        if (child.nodeName === 'MEI2VF' && match_pseudo_attrValues(child.nodeValue, 'rdgStart="' + app_xml_id + '"')) {
          inside_inst = true;
          found = true;
        } else if (child.nodeName === 'MEI2VF' &&
                   match_pseudo_attrValues(child.nodeValue, 'rdgEnd="' + app_xml_id + '"')) {
          inside_inst = false;
          insert_before_this = child;
        }
      } else if (inside_inst) {
        parent.removeChild(child);
      }
    });

    if (!found) {
      throw "processing instruction not found";
    }
    if (inside_inst) {
      throw "Unmatched <?MEI2VF rdgStart?>";
    }

    var insert_method;
    if (insert_before_this) {
      insert_method = function (elem) {
        parent.insertBefore(elem, insert_before_this)
      };
    } else {
      insert_method = function (elem) {
        parent.appendChild(elem)
      };
    }

    $.each(nodes2insert, function () {
      insert_method(this.cloneNode(true));
    });

    this.sectionplane[app_xml_id] = alt_inst_update.replaceWith;

    return this.sectionview_score;
  }
  /**
   * @method getSectionViewSlice
   * Get a slice of the sectionview_score.
   *
   * @param params
   *            {Obejct} contains the parameters for slicing. For more info see at
   *            documentation of MeiLib.SliceMEI
   * @return an XML DOM object containing the slice of the plain MEI
   */
  MeiLib.MeiDoc.prototype.getSectionViewSlice = function (params) {
    return MeiLib.SliceMEI(this.sectionview_score, params);
  };
  /**
   * @method getRichSlice
   * Get a slice of the whole rich MEI document.
   *
   * @param params
   *            {Obejct} contains the parameters for slicing. For more info see at
   *            documentation of MeiLib.SliceMEI
   * @return {MeiLib.MeiDoc} a MeiDoc object
   */
  MeiLib.MeiDoc.prototype.getRichSlice = function (params) {
    var slice = new MeiLib.MeiDoc();
    slice.xmlDoc = this.xmlDoc;
    slice.rich_head = this.rich_head.cloneNode(true);
    slice.rich_music = this.rich_music.cloneNode(true);
    slice.rich_score = MeiLib.SliceMEI(this.rich_score, params);
    slice.sourceList = this.sourceList;
    slice.editorList = this.editorList;
    slice.ALTs = this.ALTs;
    slice.altgroups = this.altgroups;
    return slice;
  };


  return MeiLib;

});