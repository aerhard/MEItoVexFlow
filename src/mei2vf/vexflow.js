define('vexflow', [
    'vex',
    'mei2vf/overrides/Annotation',
    'mei2vf/overrides/Articulation',
    'mei2vf/overrides/Beam',
    'mei2vf/overrides/ClefNote',
    'mei2vf/overrides/Curve',
    'mei2vf/overrides/Glyphs',
    'mei2vf/overrides/GraceNoteGroup',
    'mei2vf/overrides/Hyphen',
    'mei2vf/overrides/KeySignature',
    'mei2vf/overrides/ModifierContext',
    'mei2vf/overrides/Ornament',
    'mei2vf/overrides/Stave',
    'mei2vf/overrides/StaveNote',
    'mei2vf/overrides/StaveHairpin',
    'mei2vf/overrides/StaveTie',
    'mei2vf/overrides/StaveVolta',
    'mei2vf/overrides/Stroke',
    'mei2vf/overrides/Tremolo'], function (Vex) {
    return Vex.Flow;
});