define([
  'mei2vf/Interface',
  'tests/TestAppender'
], function (Interface, TestAppender, undefined) {

  describe("Rendering", function () {

    var i;
    var test_cases = [];
    var testItemHtmlTemplate;

    var backend = window.vexBackend;


    function runTest(input, i) {

      var title = (i + 1) + '. Rendering "' + input.title + '"';

      it(title, function () {

        MEI2VF.setLoggerAppender(TestAppender);
        MEI2VF.setLogging('debug');

        var render = function () {
          var canvas;

          if (backend === Vex.Flow.Renderer.Backends.RAPHAEL || backend === Vex.Flow.Renderer.Backends.SVG) {
            testItemHtmlTemplate = "<h2><span class='test-title' property='dc:title'>Title of Test Comes Here</span></h2><div class='a'><svg id='svg"+i+"'></svg></div>";
            $(document.body).append(testItemHtmlTemplate);
            canvas = $("svg").last().get(0);
          } else {
            testItemHtmlTemplate = "<h2><span class='test-title' property='dc:title'>Title of Test Comes Here</span></h2><div class='a'><canvas width='1031' height='450' style='border: none'></canvas></div>";
            $(document.body).append(testItemHtmlTemplate);
            canvas = $("canvas").last().get(0);
          }

          var titleElem = $("span.test-title").last().get(0);

          $(titleElem).html(input.title);
          var canvas_width = input.canvas_width || 1031;
          var canvas_height = input.canvas_height;

//          $(canvas).attr('width', canvas_width);
//          $(canvas).attr('height', canvas_height);

          var score_width = canvas_width; // - 50;
          var score_height = canvas_height; // - 50;

          var xmlDocPath = 'tests/xml/' + input.mei_xml;

          //load the xml file...
          window.console.log("Running Test Case Title: '" + input.title + "' MEI-XML: '" + xmlDocPath + "'");

          try {
            xmlDoc = loadXMLDoc(xmlDocPath);
            window.console.log('MEI-XML loaded.');
          } catch (e){
            throw { toString: function() { return 'XML document "' + xmlDocPath + '" not found.'}}
          }
          //... and render it onto the canvas
          var MEI = xmlDoc.getElementsByTagNameNS("http://www.music-encoding.org/ns/mei", 'score');
          window.console.log('Rendering... ');

          var callback = function (calculatedHeight, calculatedWidth) {
            console.info(calculatedHeight);
            console.info(canvas_height);

            if (calculatedHeight) {
              $(canvas).attr('height', calculatedHeight);
            } else {
              $(canvas).attr('height', canvas_height);
            }

            if (calculatedWidth) {
              $(canvas).attr('width', Math.ceil(calculatedWidth));
            } else {
              $(canvas).attr('width', canvas_width);
            }
          };

          MEI2VF.render_notation(MEI, canvas, score_width, score_height, backend, input.options, callback);

          window.console.log('Done (' + input.title + ')');
        };

        if (input.fail === true) {
          expect(function() {
            render();
          } ).toThrow("stopped flow for debugging");
        } else {
          render();
          expect(true).toBe(true);
        }
      });
    }

    var go = function() {
      for (i = 0; i < test_cases.length; i++) {
        runTest(test_cases[i], i);
      }
    }

    /**
     * add test cases
     */
    test_cases.push({ title : 'Prokofiev Op. 36', mei_xml : 'TC.Prokofiev.xml', canvas_height : 400});
    test_cases.push({ title : 'Prokofiev Op. 36 (with prefixes)', mei_xml : 'TC.Prokofiev.pref.xml', canvas_height : 400});
    test_cases.push({ title : 'Bartok Duo No.23', mei_xml : 'Bartok-WeddingSong-altered.xml', canvas_height : 500});
    test_cases.push({ title : 'One-measure piece (Isaac-Rogamus te piissima virgo Maria)', mei_xml : 'TC.One-measure.xml', canvas_width : 1100, canvas_height : 450});
    test_cases.push({ title : 'KeySpec.01 - default pitch and mode [C major]', mei_xml : 'TC.KeySpec.01.xml'});
    test_cases.push({ title : 'KeySpec.02 - supplied pitch, default accid and mode [G major]', mei_xml : 'TC.KeySpec.02.xml'});
    test_cases.push({ title : 'KeySpec.03 - supplied pitch and accid, default mode [G-flat major]', mei_xml : 'TC.KeySpec.03.xml'});
    test_cases.push({ title : 'KeySpec.04 - supplied pitch, accid and mode [D-sharp minor]', mei_xml : 'TC.KeySpec.04.xml'});
    test_cases.push({ title : 'KeySpec.05 - key signatures in different clefs', mei_xml : 'TC.KeySpec.05.xml', canvas_width : 1300, canvas_height : 350});
    test_cases.push({ title : "Directions.01 - 'pizz' above", mei_xml : 'TC.dir.01.xml'});
    test_cases.push({ title : "Directions.02 - 'espressivo' below", mei_xml : 'TC.dir.02.xml'});
    test_cases.push({ title : "Directions.03 - All execution paths", mei_xml : 'TC.dir.03.xml'});
    test_cases.push({ title : "Clef - Treble", mei_xml : 'TC.VexClef.01.xml'});
    test_cases.push({ title : "Clef - Treble with default clef.line", mei_xml : 'TC.VexClef.02.xml'});
    test_cases.push({ title : "Clef - Bass", mei_xml : 'TC.VexClef.03.xml'});
    test_cases.push({ title : "Clef - Bass with default clef.line", mei_xml : 'TC.VexClef.04.xml'});
    test_cases.push({ title : "Ties", mei_xml : 'TC.Ties.xml'});
    test_cases.push({ title : "Ties Multi-layer and Chords", mei_xml : 'TC.Ties.02.xml', canvas_height:700});
    test_cases.push({ title : "Ties with @tstamp", mei_xml : 'TC.Ties.TStamps.xml'});
    test_cases.push({ title : "Ties Multi-staff", mei_xml : 'TC.Ties.Staves.xml'});
    test_cases.push({ title : "Slurs", mei_xml : 'TC.Slurs.xml'});
    test_cases.push({ title : "Slurs with @tstamp", mei_xml : 'TC.Slurs.TStamps.xml'});
    test_cases.push({ title : "Slurs with @tstamp (no xml:ids)", mei_xml : 'TC.Slurs.TStamps.NoIDs.xml'});
    test_cases.push({ title : "Slurs with @bezier", mei_xml : 'TC.Slurs.Bezier.xml'});
    test_cases.push({ title : "Slur Positions", mei_xml : 'TC.Slurs.Position.xml', canvas_height : 450});
    test_cases.push({ title : "Slur Shapes", mei_xml : 'TC.Slurs.Shape.xml', canvas_height : 850});
    test_cases.push({ title : "Long slurs across staves", mei_xml : 'TC.Slurs.Long.xml', canvas_height : 350});
    test_cases.push({ title : "Hairpins (startid/endid tstamp/tstamp2)", mei_xml : 'TC.Hairpins.xml'});
    test_cases.push({ title : "System breaks: two systems", mei_xml : 'TC.SystemBreak.01.xml', canvas_height : 250});
    test_cases.push({ title : "System breaks: many systems", mei_xml : 'TC.SystemBreak.xml', canvas_height : 700});
    test_cases.push({ title : "System breaks: multi-staff", mei_xml : 'TC.SystemBreak.02.xml', canvas_width : 1300, canvas_height : 700});
    test_cases.push({ title : "System breaks: ties, slurs", mei_xml : 'TC.SystemBreak.03.xml', canvas_height : 450});
    test_cases.push({ title : "Changing StaffDef: Clef", mei_xml : 'TC.StaffChange.01.xml'});
    test_cases.push({ title : "Changing StaffDef: Celf+Key", mei_xml : 'TC.StaffChange.02.xml'});
    test_cases.push({ title : "Changing StaffDef: Meter", mei_xml : 'TC.StaffChange.03.xml'});
    test_cases.push({ title : "Changing StaffDef: Mixed", mei_xml : 'TC.StaffChange.04.xml'});
    test_cases.push({ title : "StaveConnector - line", mei_xml : 'TC.MultiStave.01.xml', canvas_height : 250});
    test_cases.push({ title : "StaveConnector - brace", mei_xml : 'TC.MultiStave.02.xml', canvas_height : 250});
    test_cases.push({ title : "StaveConnector - bracket", mei_xml : 'TC.MultiStave.03.xml', canvas_height : 250});
    test_cases.push({ title : "StaveConnector - none", mei_xml : 'TC.MultiStave.04.xml', canvas_height : 250});
    test_cases.push({ title : "StaveConnector - multiple", mei_xml : 'TC.MultiStave.05.xml', canvas_height : 600 });
    test_cases.push({ title : "StaveConnector - nested", mei_xml : 'TC.MultiStave.06.xml', canvas_height : 600 });
    test_cases.push({ title : "Demo: Stave Connectors", mei_xml : 'Demo.StaveConnectors.xml', canvas_width : 600, canvas_height : 550 });
    test_cases.push({ title : "Demo: Hairpins", mei_xml : 'Demo.Hairpins.Ravel.M2.xml', canvas_width : 600, canvas_height : 250 });
    test_cases.push({ title : "Demo: Hairpins", mei_xml : 'Demo.Hairpins.Ravel.M1-4.xml', canvas_width : 1000, canvas_height : 250 });
    test_cases.push({ title : "Demo: Changing time signature, meter and clef", mei_xml : 'Demo.StaffDefChanges.xml', canvas_width : 800, canvas_height : 250 });
    test_cases.push({ title : "Demo: System Breaks", mei_xml : 'Demo.BachCPrelude.xml', canvas_width : 1500, canvas_height : 800 });
    test_cases.push({ title : "Adjusting Voices 1", mei_xml : 'TC.StaveVoices.01.xml', canvas_height : 400});
    test_cases.push({ title : "Adjusting Voices 2", mei_xml : 'TC.StaveVoices.02.xml', canvas_height : 450});
    test_cases.push({ title : "Adjusting Voices 3", mei_xml : 'TC.StaveVoices.03.xml', canvas_height : 400, canvas_width : 1000});
    test_cases.push({ title : "Space element", mei_xml : 'TC.Space.xml', canvas_height : 400});
    //  test_cases.push({ title : "Rests", mei_xml : 'TC.Rests.xml', canvas_height : 400});


    /* the following xml file is missing: */
    //test_cases.push({ title: "Single Variant-Path with Processing Instructions", mei_xml: 'TC.SingleVariantPath.xml', canvas_height:400});
    test_cases.push({ title : "Clef - Tenor clef (with stem directions)", mei_xml : 'TC.VexClef.05.xml'});
    test_cases.push({ title : "Clef - Alto clef (with stem directions)", mei_xml : 'TC.VexClef.07.xml'});
    test_cases.push({ title : "Clef - Transposed treble clef (with stem directions)", mei_xml : 'TC.VexClef.06.xml'});
    test_cases.push({ title : "Clef - Clef changes in measure I", mei_xml : 'TC.VexClef.08.xml', canvas_height : 300});
    test_cases.push({ title : "Clef - Clef changes in measure II: Multiple staves", mei_xml : 'TC.VexClef.09.xml', canvas_height : 300});
    test_cases.push({ title : "Plain Staff", mei_xml : 'TC.PlainStaff.xml'});
    test_cases.push({ title : "Bar lines", mei_xml : 'TC.BarLines.xml'});
    test_cases.push({
      title : "Page Layout, measure widths in the MEI code",
      mei_xml : 'TC.PageLayout.xml',
      canvas_width : 1600,
      canvas_height : 2700,
      options : {
        labelMode : 'full'
      }
    });
    test_cases.push({
      title : "Page Layout, automatic measure width calculation",
      mei_xml : 'TC.PageLayoutAutoWidths.xml',
      canvas_width : 1600,
      canvas_height : 2700,
      options : {
        labelMode : 'full'
      }
    });
    test_cases.push({
      title : "Page Layout: plain staff with no margins",
      mei_xml : 'TC.PlainStaff.xml',
      options : {
        pageLeftMar : 0,
        pageRightMar : 0,
        pageTopMar : 0
      }
    });
    test_cases.push({title : "Hyphenation", mei_xml : 'TC.Hyphens.xml', canvas_width : 1200, canvas_height : 300 });
    test_cases.push({title : "Verses", mei_xml : 'TC.Hyphens.Verses.xml', canvas_width : 1200, canvas_height : 300 });
    test_cases.push({title : "Verses, multiple staves", mei_xml : 'TC.Hyphens.Verses.MultiStave.xml', canvas_width : 1200, canvas_height : 400 });
    test_cases.push({title : "Verses, multiple layers", mei_xml : 'TC.Hyphens.Verses.MultiLayer.xml', canvas_width : 1200, canvas_height : 400 });
    test_cases.push({ title : "Dynamics", mei_xml : 'TC.Dynamics.xml'});
    test_cases.push({ title : "Fermatas", mei_xml : 'TC.Fermatas.xml'});
    test_cases.push({ title : "Tuplets", mei_xml : 'TC.Tuplets.xml', canvas_width : 1200, canvas_height : 400});

    test_cases.push({ title : "Beams", mei_xml : 'TC.Beams.xml', canvas_width : 800, canvas_height : 500});
    test_cases.push({ title : "Auto stem and tie directions with multiple layers", mei_xml : 'Demo.BachGMinorPrelude-WKII.xml', canvas_width : 1100, canvas_height : null});
    test_cases.push({ title : "Grace Notes", mei_xml : 'TC.GraceNotes.xml', canvas_height : 400});
    test_cases.push({ title : "Ornaments and Trills", mei_xml : 'TC.Ornaments.xml', canvas_height : 400, options: {pageTopMar:80}});
    test_cases.push({ title : 'Throw an exception on missing attribute', mei_xml : 'TC.MissingAttribute.xml', fail: true});
    test_cases.push({ title : "Dots", mei_xml : 'TC.Dots.xml', options : {labelMode : 'full'}});
    test_cases.push({ title : "Measure widths (with pick-up beat)", mei_xml : 'TC.MeasureWidths.xml', options : {labelMode : 'full'}});
    test_cases.push({ title : "Stem modifiers", mei_xml : 'TC.StemModifiers.xml', options : {labelMode : 'full'}});

    test_cases.push({ title : "Hairpins across systems", mei_xml : 'TC.Hairpins.CrossStave.xml', canvas_height: 500});

    test_cases.push({ title : "Beam span", mei_xml : 'TC.BeamSpan.xml', canvas_width : 800, canvas_height : 500});
    test_cases.push({ title : "Tuplet span", mei_xml : 'TC.TupletSpan.xml', canvas_width : 1100});

    test_cases.push({ title : "Note modifiers - Spacing", mei_xml : 'TC.NoteModifier.Spacing.xml', canvas_height : 2200});
    test_cases.push({ title : "Articulations", mei_xml : 'TC.Articulations.xml', canvas_height : 400, options: {pageTopMar:80}});

    go();

  });


});
