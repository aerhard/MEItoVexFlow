YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "MEI2VF",
        "MEI2VF.Connectors\nHandles stave connectors",
        "MEI2VF.Converter",
        "MEI2VF.Directives",
        "MEI2VF.Dynamics",
        "MEI2VF.EventLink",
        "MEI2VF.EventReverence\nRepresents and event with its xmlid, but if the xmlid is not defined, it\ncan also hold the timestamp that can be resolved as soon as the context\nthat\nholds the event is established. When the tstamp reference is being\nresolved, the xml:id is calculated using the generic function tstamp2id(),\nthen the\nxml:id stored, thus marking that the reference is resolved.",
        "MEI2VF.Hairpins",
        "MEI2VF.Hyphenation",
        "MEI2VF.LinkCollection",
        "MEI2VF.Measure",
        "MEI2VF.PointerCollection",
        "MEI2VF.RUNTIME_ERROR",
        "MEI2VF.StaffInfo\nContains the definition and the rendering information (i.e. what\nclef modifiers are to be rendered) of a single staff",
        "MEI2VF.StaffVoice",
        "MEI2VF.StaveVoices\nStores all voices in a given measure along with the respective staff id.\nPasses all voices to Vex.Flow.Formatter and calls joinVoices, then draws\nall voices.",
        "MEI2VF.System",
        "MEI2VF.SystemInfo\nDeals with MEI data provided by scoreDef, staffDef and staffGrp elements and its children",
        "MEI2VF.Ties",
        "MEI2VF.Util",
        "MeiLib",
        "MeiLib\nMeiLib - General purpose JavaScript functions for processing MEI documents.",
        "MeiLib.Alt\nRepresents an MEI <b>app</b> or <b>choice</b> element.",
        "MeiLib.EventEnumerator\nEnumerate over the children events of node (node is a layer or a beam).",
        "MeiLib.MeiDoc\nA Rich MEI is an MEI that contain ambiguity represented by Critical Apparatus\n(<b>app</b>, <b>rdg</b>, etc.), or Editorial Transformation (<b>choice</b>, <b>corr</b>, etc.)\nelements.",
        "MeiLib.RuntimeError",
        "MeiLib.Variant\nRepresents a <b>lem</b>, <b>rdg</b>, <b>sic</b> or <b>corr</b> element."
    ],
    "modules": [],
    "allModules": []
} };
});