
require.config({
    baseUrl: "../src"
});


require(['../src/Interface'], function() {

  var testItem_html = "<h2><span class='test-title' property='dc:title'>Title of Test Comes Here</span></h2><div class='a'><canvas width='1031' height='450' style='border: none'></canvas></div>"
  			MEI2VF.setLogging(true);
  			$(document).ready(function() {
          var test_cases = new Array();

          // add test cases
          test_cases.push({ title: 'Prokofiev Op. 36', mei_xml: 'TC.Prokofiev.xml', canvas_height: 400});
          test_cases.push({ title: 'Prokofiev Op. 36 (with prefixes)', mei_xml: 'TC.Prokofiev.pref.xml', canvas_height: 400});
          test_cases.push({ title: 'Bartok Duo No.23', mei_xml: 'Bartok-WeddingSong-altered.xml', canvas_height: 500});
          test_cases.push({ title: 'One-measure piece (Isaac-Rogamus te piissima virgo Maria)', mei_xml: 'TC.One-measure.xml', canvas_width: 1100, canvas_height: 450});
          test_cases.push({ title: 'KeySpec.01 - default pitch and mode [C major]', mei_xml: 'TC.KeySpec.01.xml'});
          test_cases.push({ title: 'KeySpec.02 - supplied pitch, default accid and mode [G major]', mei_xml: 'TC.KeySpec.02.xml'});
          test_cases.push({ title: 'KeySpec.03 - supplied pitch and accid, default mode [G-flat major]', mei_xml: 'TC.KeySpec.03.xml'});
          test_cases.push({ title: 'KeySpec.04 - supplied pitch, accid and mode [D-sharp minor]', mei_xml: 'TC.KeySpec.04.xml'});
          test_cases.push({ title: "Directions.01 - 'pizz' above", mei_xml: 'TC.dir.01.xml'});
          test_cases.push({ title: "Directions.02 - 'espressivo' below", mei_xml: 'TC.dir.02.xml'});
          test_cases.push({ title: "Directions.03 - All execution paths", mei_xml: 'TC.dir.03.xml'});
          test_cases.push({ title: "Clef - Treble", mei_xml: 'TC.VexClef.01.xml'});
          test_cases.push({ title: "Clef - Treble with default clef.line", mei_xml: 'TC.VexClef.02.xml'});
          test_cases.push({ title: "Clef - Bass", mei_xml: 'TC.VexClef.03.xml'});
          test_cases.push({ title: "Clef - Bass with default clef.line", mei_xml: 'TC.VexClef.04.xml'});
          test_cases.push({ title: "Ties", mei_xml: 'TC.Ties.xml'});
          test_cases.push({ title: "Ties Multi-layer and Chords", mei_xml: 'TC.Ties.02.xml'});
          test_cases.push({ title: "Ties with @tstamp", mei_xml: 'TC.Ties.TStamps.xml'});
          test_cases.push({ title: "Slurs", mei_xml: 'TC.Slurs.xml'});
          test_cases.push({ title: "Slurs with @tstamp", mei_xml: 'TC.Slurs.TStamps.xml'});
          test_cases.push({ title: "Slurs with @tstamp (no xml:ids)", mei_xml: 'TC.Slurs.TStamps.NoIDs.xml'});
          test_cases.push({ title: "Slurs with @bezier", mei_xml: 'TC.Slurs.Bezier.xml'});
          test_cases.push({ title: "Hairpins (startid/endid tstamp/tstamp2)", mei_xml: 'TC.Hairpins.xml'});
          test_cases.push({ title: "System breaks: two systems", mei_xml: 'TC.SystemBreak.01.xml', canvas_height: 250});
          test_cases.push({ title: "System breaks: many systems", mei_xml: 'TC.SystemBreak.xml', canvas_height: 700});
          test_cases.push({ title: "System breaks: multi-staff", mei_xml: 'TC.SystemBreak.02.xml', canvas_width: 1300, canvas_height: 700});
          test_cases.push({ title: "System breaks: ties, slurs", mei_xml: 'TC.SystemBreak.03.xml', canvas_height: 450});
          test_cases.push({ title: "Changing StaffDef: Clef", mei_xml: 'TC.StaffChange.01.xml'});
          test_cases.push({ title: "Changing StaffDef: Celf+Key", mei_xml: 'TC.StaffChange.02.xml'});
          test_cases.push({ title: "Changing StaffDef: Meter", mei_xml: 'TC.StaffChange.03.xml'});
          test_cases.push({ title: "StaveConnector - line", mei_xml: 'TC.MultiStave.01.xml', canvas_height: 250});
          test_cases.push({ title: "StaveConnector - brace", mei_xml: 'TC.MultiStave.02.xml', canvas_height: 250});
          test_cases.push({ title: "StaveConnector - bracket", mei_xml: 'TC.MultiStave.03.xml', canvas_height: 250});
          test_cases.push({ title: "StaveConnector - none", mei_xml: 'TC.MultiStave.04.xml', canvas_height: 250});
          test_cases.push({ title: "StaveConnector - multiple", mei_xml: 'TC.MultiStave.05.xml', canvas_height: 600 });
          test_cases.push({ title: "Demo: Stave Connectors", mei_xml: 'Demo.StaveConnectors.xml', canvas_width: 600, canvas_height: 550 });
          test_cases.push({ title: "Demo: Hairpins", mei_xml: 'Demo.Hairpins.Ravel.M2.xml', canvas_width: 600, canvas_height: 250 });
          test_cases.push({ title: "Demo: Hairpins", mei_xml: 'Demo.Hairpins.Ravel.M1-4.xml', canvas_width: 1000, canvas_height: 250 });
          test_cases.push({ title: "Demo: Changing time signature, meter and clef", mei_xml: 'Demo.StaffDefChanges.xml', canvas_width: 800, canvas_height: 250 });
          test_cases.push({ title: "Demo: System Breaks", mei_xml: 'Demo.BachCPrelude.xml', canvas_width: 1500, canvas_height: 800 });
          test_cases.push({ title: "Adjusting Voices 1", mei_xml: 'TC.StaveVoices.01.xml', canvas_height: 400});
          test_cases.push({ title: "Adjusting Voices 2", mei_xml: 'TC.StaveVoices.02.xml', canvas_height: 450});
          test_cases.push({ title: "Adjusting Voices 3", mei_xml: 'TC.StaveVoices.03.xml', canvas_height: 400, canvas_width: 1000});
          test_cases.push({ title: "Space element", mei_xml: 'TC.Space.xml', canvas_height: 400});
          // //the following xml file is missing:
          //test_cases.push({ title: "Single Variant-Path with Processing Instructions", mei_xml: 'TC.SingleVariantPath.xml', canvas_height:400});
          test_cases.push({ title: "Clef - Tenor clef (with stem directions)", mei_xml: 'TC.VexClef.05.xml'});
          test_cases.push({ title: "Clef - Alto clef (with stem directions)", mei_xml: 'TC.VexClef.07.xml'});
          test_cases.push({ title: "Clef - Transposed treble clef (with stem directions)", mei_xml: 'TC.VexClef.06.xml'});
          test_cases.push({ title: "Plain Staff", mei_xml: 'TC.PlainStaff.xml'});
          // test_cases.push({ title: "Bar lines", mei_xml: 'TC.BarLines.xml'});
          // test_cases.push({
          // title: "Page Layout, measure widths in the MEI code",
          // mei_xml: 'TC.PageLayout.xml',
          // canvas_width: 1600,
          // canvas_height:2700,
          // options: {
          // labelMode: 'full'
          // }
          // });
          test_cases.push({
            title        : "Page Layout, automatic measure width calculation",
            mei_xml      : 'TC.PageLayoutAutoWidths.xml',
            canvas_width : 1600,
            canvas_height: 2700,
            options      : {
              labelMode: 'full',
            }
          });
          test_cases.push({
            title  : "Page Layout: plain staff with no margins",
            mei_xml: 'TC.PlainStaff.xml',
            options: {
              page_margin_left : 0,
              page_margin_right: 0,
              page_margin_top  : 0,
            }
          });
          test_cases.push({title: "Hyphenation", mei_xml: 'TC.Hyphens.xml', canvas_width: 1200, canvas_height: 300 });
          test_cases.push({ title: "Dynamics", mei_xml: 'TC.Dynamics.xml'});
          test_cases.push({ title: "Fermatas", mei_xml: 'TC.Fermatas.xml'});
          test_cases.push({ title: "Tuplets", mei_xml: 'TC.Tuplets.xml', canvas_width: 1200, canvas_height: 400});
          test_cases.push({ title: "Beam with Rest", mei_xml: 'TC.Beams.xml', canvas_width: 300});
          // Test cases that are supposed to generate error messages on the console:
          test_cases.push({ title: 'Missing_Attribute_Test_Case', mei_xml: 'TC.MissingAttribute.xml'});

          var canvas_elements = new Array();
          var title_elements = new Array();
          //create as many canvases and title elements as test cases...
          $(test_cases).each(function (index) {
            $('div.test-page').append(testItem_html);

            //...and load them into canvas_elements and title_elements arrays
            canvas_elements[index] = $("div.a canvas")[index]
            title_elements[index] = $("span.test-title")[index];
          })

          //render test cases
          var i;
          for (i = 0; i < test_cases.length; i++) {
            window.console.log('Starting Test Case #' + i);
            // try {
            Test.RunTest(test_cases[i], canvas_elements[i], title_elements[i]);
            // } catch(e) {
            // window.console.log('Error during rendering test case #' + i.toString() + " title: " + test_cases[i].title + ". Error Message: " +  e.toString());
            // }
          }
        });
});