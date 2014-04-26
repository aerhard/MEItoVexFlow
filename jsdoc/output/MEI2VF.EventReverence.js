Ext.data.JsonP.MEI2VF_EventReverence({"tagname":"class","name":"MEI2VF.EventReverence","autodetected":{},"files":[{"filename":"EventReference.js","href":"EventReference.html#MEI2VF-EventReverence"}],"private":true,"members":[{"name":"constructor","tagname":"method","owner":"MEI2VF.EventReverence","id":"method-constructor","meta":{}},{"name":"getId","tagname":"method","owner":"MEI2VF.EventReverence","id":"method-getId","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-MEI2VF.EventReverence","short_doc":"Represents and event with its xmlid, but if the xmlid is not defined, it\ncan also hold the timestamp that can be reso...","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/EventReference.html#MEI2VF-EventReverence' target='_blank'>EventReference.js</a></div></pre><div class='doc-contents'><div class='rounded-box private-box'><p><strong>NOTE:</strong> This is a private utility class for internal use by the framework. Don't rely on its existence.</p></div><p>Represents and event with its xmlid, but if the xmlid is not defined, it\ncan also hold the timestamp that can be resolved as soon as the context\nthat\nholds the event is established. When the tstamp reference is being\nresolved, the xml:id is calculated using the generic function tstamp2id(),\nthen the\nxml:id stored, thus marking that the reference is resolved.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-constructor' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MEI2VF.EventReverence'>MEI2VF.EventReverence</span><br/><a href='source/EventReference.html#MEI2VF-EventReverence-method-constructor' target='_blank' class='view-source'>view source</a></div><strong class='new-keyword'>new</strong><a href='#!/api/MEI2VF.EventReverence-method-constructor' class='name expandable'>MEI2VF.EventReverence</a>( <span class='pre'>xmlid</span> ) : <a href=\"#!/api/MEI2VF.EventReverence\" rel=\"MEI2VF.EventReverence\" class=\"docClass\">MEI2VF.EventReverence</a><span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>xmlid</span> : String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/MEI2VF.EventReverence\" rel=\"MEI2VF.EventReverence\" class=\"docClass\">MEI2VF.EventReverence</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getId' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='MEI2VF.EventReverence'>MEI2VF.EventReverence</span><br/><a href='source/EventReference.html#MEI2VF-EventReverence-method-getId' target='_blank' class='view-source'>view source</a></div><a href='#!/api/MEI2VF.EventReverence-method-getId' class='name expandable'>getId</a>( <span class='pre'>params</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'> ...</div><div class='long'>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>params</span> : Object<div class='sub-desc'><p>{\n           meicontext, strict }; both parameters are optional;\n           meicontext is an obejct { layer, meter }; strict is\n           boolean, false if not defined.</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{"private":true}});