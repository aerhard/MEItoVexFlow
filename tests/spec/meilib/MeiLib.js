define([
  'meilib/MeiLib',
  'mei2vf/Interface',
  'tests/TestAppender'
], function (MeiLib, Interface, TestAppender, jasmine, undefined) {

  // TODO elaborate descriptions!

  describe('MeiLib', function () {

    beforeEach(function () {

      MEI2VF.setLoggerAppender(TestAppender);
      MEI2VF.setLogging('debug');


      window.jasmine.addMatchers({

        toEq : function (util, customEqualityTesters) {
          customEqualityTesters = customEqualityTesters || [];
          return {
            compare : function (actual, expected, equal, test_output) {
              var result = {
                pass : false
              };
              if (equal === undefined) equal = true;
              if (equal) {
                result.pass = util.equals(actual, expected, customEqualityTesters);
                result.message = "Expected '" + actual + "' to equal '" + expected + "'";
              } else {
                result.pass = !util.equals(actual, expected, customEqualityTesters);
                result.message = "Expected '" + actual + "' to not equal '" + expected + "'";
              }

              if (!result.pass) {
                var fail_info = 'Failed assertion ' + actual + (equal ? '===' : '!==') + expected;

                console.log(fail_info);
                if (test_output) {
                  $(document.body).append('<div class="test-output">' + fail_info + ':<br/>' +
                                          serialize_xml(test_output) + '</div>')
                  console.log(test_output);
                }

              }
              return result;
            }
          };
        }

      });
    });


    var asserts_passed = 0;
    var asserts_failed = 0;

    var serialize_xml = function (xml) {
      var serializer = new XMLSerializer();
      var strXML = serializer.serializeToString($(xml).get(0));
      var strMEI_rplc1 = strXML.replace(/</g, '&lt;');
      var strMEI_rplc2 = strMEI_rplc1.replace(/>/g, '&gt;');
      var code = '<pre><code>' + strMEI_rplc2 + '</code></pre>';
      return code;
    };

    var current_test_id = "";
    var start_test = function (test_id) {
      current_test_id = test_id;
      $('#results').append('<div class="test" id="' + test_id + '"></div');
      $('#' + test_id).append('<div class="test-title">' + test_id + '</div>');
      last_asserts_failed = asserts_failed;
    };
    var end_test = function () {
      if (last_asserts_failed === asserts_failed) {
        $('#' + current_test_id).append('<div class="test-pass">Pass</div>');
      } else {
        $('#' + current_test_id).append('<div class="test-fail">Fail</div>');
      }
    };

    var summary = function () {
      $('#results').append('<div id="summary"></div>');
      $('div#summary').append('<div class="total-test">Total # of asserts: ' + (asserts_passed + asserts_failed) +
                              '</div>');
      $('div#summary').append('<div class="total-pass">Pass: ' + asserts_passed + '</div>');
      $('div#summary').append('<div class="total-fail">Fail: ' + asserts_failed + '</div>');
    };

    var print_xml = function (xml) {
      document.write(serialize_xml(xml));
    };

    var score, mei_xml, xmlDoc;

    var loadTstampXML = function() {
      mei_xml = 'xml/TC.tstamp2id.xml';
      //load the xml file...
      xmlDoc = loadXMLDoc(mei_xml);
      console.log('MEI-XML loaded.');
      score = xmlDoc.getElementsByTagNameNS("http://www.music-encoding.org/ns/mei", 'score');
      console.log('Start');
    };

    var meter = { count : 4, unit : 4};


    describe('IDtoTStamp', function () {

      it('converts IDs to the expected time stamps', function () {
        console.log('********* TEST: id2tstamp() **************************************');

        var tstamp;

        var id2ts_xmlDoc = loadXMLDoc('xml/TC.id2tstamp.xml');
        console.log('MEI-XML loaded.');
        var id2ts_score = id2ts_xmlDoc.getElementsByTagNameNS("http://www.music-encoding.org/ns/mei", 'score');

        var context = [];
        $(id2ts_score).find('layer').each(function (i, layer) {
          context.push({layer : layer, meter : meter});
        });

        var tstamp_assert_table = [
          '0m+1',
          '0m+1.5',
          '0m+2.5',
          '0m+3.5',
          '0m+4.5',
          '1m+1',
          '1m+1.5',
          '1m+2.5',
          '1m+3.5',
          '1m+4.5',
          '2m+1',
          '3m+1',
          '3m+1.5',
          '3m+1.75',
          '3m+2',
          '3m+2.25',
          '3m+2.375',
          '3m+2.5',
          '3m+2.75',
          '3m+3',
          '3m+3.5',
          '3m+3.5',
          '3m+3.5',
          '3m+4',
          '4m+1',
          '4m+1.5',
          '4m+1.5',
          '4m+1.5',
          '4m+2',
          '4m+3',
          '4m+3',
          '4m+3',
          '5m+1',
          '5m+1.75',
          '5m+1.75',
          '5m+1.75',
          '5m+2',
          '5m+3.75',
          '5m+3.75',
          '5m+3.75',
          '5m+4',
          '6m+1',
          '6m+1',
          '6m+3',
          '6m+3',
          '6m+3',
          '6m+3',
          '6m+3'
        ];

        for (var i = 1; i <= 48; ++i) {
          var id = 'v1e' + ((i < 10) ? '0' : '') + i.toString();
          tstamp = MeiLib.id2tstamp(id, context);
          expect(tstamp).toEq(tstamp_assert_table[i - 1]);
        }
      });
    });


    describe('EventEnumerator and durationOf() 1', function () {

      it('count grace notes', function () {
        console.log('********* TEST: EventEnumerator and durationOf() 1: count grace notes  ****************');
        loadTstampXML();
        var context = [];

        var duration_asserts = [
          [
            1,
            1,
            1,
            1
          ],
          [
            0.5,
            0.5,
            1,
            1,
            0.5,
            0.5
          ],
          [
            4
          ],
          [
            0.5,
            0.25,
            0.25,
            0.25,
            0.125,
            0.125,
            0.25,
            0.25,
            0.5,
            0.5,
            1
          ],
          [
            0.5,
            0.5,
            1,
            1,
            0.5
          ],
          [
            0.75,
            0.25,
            1.75,
            0.25,
            1
          ],
          [
            0,
            2,
            0,
            0,
            0,
            0,
            2
          ]
        ];

        $(score).find('layer').each(function (i, layer) {
          // console.log('<<<<measure ' + (i+1).toString());
          context.push({layer : layer, meter : meter});
          var layerEnum = new MeiLib.EventEnumerator(layer);
          var evnt;
          var j = 0;
          while (!layerEnum.EoI) {
            evnt = layerEnum.nextEvent();
            var dur = MeiLib.durationOf(evnt, meter, true);
            expect(dur).toEq(duration_asserts[i][j]);
            j++;
          }
        });

      });

    });


    describe('EventEnumerator and durationOf() 2', function () {


      it('count grace notes', function () {
        loadTstampXML();
        console.log('********* TEST: EventEnumerator and durationOf() 2: count grace notes ****************');
        var context = [];


        var duration_asserts = [
          [
            1,
            1,
            1,
            1
          ],
          [
            0.5,
            0.5,
            1,
            1,
            0.5,
            0.5
          ],
          [
            4
          ],
          [
            0.5,
            0.25,
            0.25,
            0.25,
            0.125,
            0.125,
            0.25,
            0.25,
            0.5,
            0.5,
            1
          ],
          [
            0.5,
            0.5,
            1,
            1,
            0.5
          ],
          [
            0.75,
            0.25,
            1.75,
            0.25,
            1
          ],
          [
            2,
            2,
            0.5,
            0.5,
            0.5,
            0.5,
            2
          ]
        ];

        $(score).find('layer').each(function (i, layer) {
          // console.log('<<<<measure ' + (i+1).toString());
          context.push({layer : layer, meter : meter});
          var layerEnum = new MeiLib.EventEnumerator(layer);
          var evnt;
          var j = 0;
          while (!layerEnum.EoI) {
            evnt = layerEnum.nextEvent();
            var dur = MeiLib.durationOf(evnt, meter);
            expect(dur).toEq(duration_asserts[i][j]);
            j++;
          }
        });

      });
    });


    describe('additional durationOf TEST: tuplets', function () {


      it('tuplets', function () {
        console.log('********* additional durationOf TEST: tuplets **************************************');

        var fragment = $.parseXML('<x><tuplet>' + '<note xml:id="n02a" pname="g" oct="4" dur="8"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' +
                                  '<note pname="b" oct="4" dur="8" stem.dir="up"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' +
                                  '<note pname="b" oct="4" dur="8" stem.dir="up"/>' +
                                  '<note pname="b" oct="4" dur="8" stem.dir="up"/>' + '</tuplet>' +
                                  '<tuplet num="15" numbase="6" dur="2"><beam>' + '<note pname="g" oct="4" dur="8"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' + '<note pname="a" oct="4" dur="8"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' + '<note pname="a" oct="4" dur="8"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' + '<note pname="a" oct="4" dur="8"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' + '<note pname="a" oct="4" dur="8"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' + '<note pname="a" oct="4" dur="8"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' + '<note pname="a" oct="4" dur="8"/>' +
                                  '<note pname="a" oct="4" dur="8"/>' + '<note pname="a" oct="4" dur="8"/>' +
                                  '</beam></tuplet></x>');

        var within_range = function (x, target, epsilon) {
          return (x > target - epsilon && x < target + epsilon) ? target : x;
        };

        var tuplet0 = $(fragment).find('tuplet')[0];
        var len = MeiLib.durationOf(tuplet0, { count : 4, unit : 4});
        expect(within_range(len, 2, 0.000001)).toEq(2);

        var tuplet1 = $(fragment).find('tuplet')[1];
        len = MeiLib.durationOf(tuplet1, {count : 3, unit : 4});
        expect(within_range(len, 3, 0.000001)).toEq(3);
      });
    });

    describe('tstamp2id()', function () {


      it('tstamp2id', function () {
        loadTstampXML();
        console.log('********* TEST: tstamp2id() **************************************');

        var context = [];
        $(score).find('layer').each(function (i, layer) {
          context.push({layer : layer, meter : meter});
        });


        var TCs = {
          tstamp2id : [
            { name : 'TEST: simple', measure : 1 },
            { name : 'TEST: with beams', measure : 2 },
            { name : 'TEST: mRest', measure : 3 },
            { name : 'TEST: beams and chord', measure : 4 },
            { name : 'TEST: chords', measure : 5 },
            { name : 'TEST: dots', measure : 6 },
            { name : 'TEST: grace notes', measure : 7 }
          ]
        };

        for (var k = 0; k < TCs.tstamp2id.length; ++k) {
          console.log('=================== ' + TCs.tstamp2id[k].name + mei_xml + ':measure #' +
                      TCs.tstamp2id[k].measure.toString());
          var index = TCs.tstamp2id[k].measure - 1;
          var tstamps = [
            '1',
            '1.1',
            '1.25',
            '1.5',
            '1.75',
            '2',
            '2.1',
            '2.25',
            '2.5',
            '2.9',
            '3',
            '3.1',
            '3.5',
            '3.9',
            '4',
            '4.25',
            '4.5',
            '4.75',
            '5'
          ];
          for (var i = 0; i < tstamps.length; ++i) {
            console.log('tstamp=' + tstamps[i] + '--> xmlid=' +
                        MeiLib.tstamp2id(tstamps[i], context[index].layer, meter));
            //TO ASSERT: TODO: each tstamp to what's expected (19x6=114 assertions)
          }
        }

      });
    });


    // console.log('********* getSlice() *******************');
    //
    // start_test('getSlice');
    // var sliceXML = single_path_score.getSlice({start_n:2, end_n:4, noClef:true, noKey:true, noMeter:true} );
    // // print_xml(sliceXML);
    // //TO ASSERT:
    // // 1. the result has three measures,
    // // 2. the first measure is @n=2
    // // 3. the last measure is @n=4
    // // 4. in staffDef @clef.visible = false
    // // 5. in staffDef @key.sig.show = false
    // // 6. in staffDef @meter.rend = false
    // measures = $(sliceXML).find('measure');
    // staffDef = $(sliceXML).find('staffDef')[0];
    // staves = $(measures[0]).find('staff');
    // assert(measures.length, 3);
    // assert($(measures[0]).attr('n'), "2");
    // assert($(measures[2]).attr('n'), "4");
    // assert($(staffDef).attr('clef.visible'), "false");
    // assert($(staffDef).attr('key.sig.show'), "false");
    // assert($(staffDef).attr('meter.rend'), "false");
    // end_test();


    describe('MeiLib.SliceMEI()', function () {


      it('SliceMEI', function () {
        console.log('********* TEST: MeiLib.SliceMEI() ********************************');

        start_test('SliceMEI');
        var xmlDoc_slice = loadXMLDoc('xml/TC.Slice.xml');
        var score2slice = xmlDoc_slice.getElementsByTagNameNS("http://www.music-encoding.org/ns/mei", 'score')[0];
        var slice = MeiLib.SliceMEI(score2slice, {start_n : 1, end_n : 8, noClef : true, noKey : true, noMeter : true, staves : [
          1,
          3
        ], noConnectors : true});
        // print_xml(slice);
        //TO ASSERT:
        // 1. the result has 8 measures,
        // 2. in staffDef @clef.visible = false
        // 3. in staffDef @key.sig.show = false
        // 4. in staffDef @meter.rend = false
        // 5. there are two staves
        // 6. first staff is @n=1
        // 7. second staff is @n=3
        var measures = $(slice).find('measure');
        var staffDef = $(slice).find('staffDef')[0];
        var staves = $(measures[0]).find('staff');
        expect(measures.length).toEq(8, true, slice);
        expect($(staffDef).attr('clef.visible')).toEq("false");
        expect($(staffDef).attr('key.sig.show')).toEq("false");
        expect($(staffDef).attr('meter.rend')).toEq("false");
        var scoreDefChange = $(slice).find('scoreDef')[1];
        var staffDefChange = $(scoreDefChange).find('staffDef')[0];
        expect($(staffDefChange).attr('clef.visible')).toEq("false", false);
        expect($(staffDefChange).attr('key.sig.show')).toEq("false", false);
        expect($(staffDefChange).attr('meter.rend')).toEq("false", false);
        expect(staves.length).toEq(2);
        expect($(staves[0]).attr('n')).toEq("1");
        expect($(staves[1]).attr('n')).toEq("3");

        var sliceAllStaves = MeiLib.SliceMEI(score2slice, {start_n : 4, end_n : 7, noClef : false, noKey : false, noMeter : false});
        // print_xml(sliceAllStaves);
        //TO ASSERT:
        // 1. the result has 4 measures,
        // 2. the first measure has @n=4
        // 2. in staffDef @clef.visible isn't false false
        // 3. in staffDef @key.sig.show = false
        // 4. in staffDef @meter.rend = false
        // 5. there are four staves
        measures = $(sliceAllStaves).find('measure');
        staffDef = $(sliceAllStaves).find('staffDef')[0];
        staves = $(measures[0]).find('staff');
        expect(measures.length).toEq(4);
        expect($(measures[0]).attr('n')).toEq("4", true, sliceAllStaves);
        expect($(staffDef).attr('clef.visible')).toEq("false", false);
        expect($(staffDef).attr('key.sig.show')).toEq("false", false);
        expect($(staffDef).attr('meter.rend')).toEq("false", false);
        expect(staves.length).toEq(4);

        var sliceEndings1 = MeiLib.SliceMEI(score2slice, {start_n : 12, end_n : 13});
        //TO ASSERT:
        // 1. There are two measures
        // 2. There is one ending, and
        // 3. the ending contains measure 12
        measures = $(sliceEndings1).find('measure');
        var endings = $(sliceEndings1).find('ending');
        expect(measures.length).toEq(2, true, sliceEndings1);
        expect(endings.length).toEq(1, true, sliceEndings1);
        expect($(endings[0]).find('measure[n="12"]').length).toEq(1, true, sliceEndings1);

        var sliceEndings2 = MeiLib.SliceMEI(score2slice, {start_n : 8, end_n : 11});
        //TO ASSERT:
        // 1. There are four measures
        // 2. There are two endings
        // 3. First ending contains measure 10
        // 4. Second ending contains one measure
        // 5. The measure contained by the second ending is measure 11
        measures = $(sliceEndings2).find('measure');
        endings = $(sliceEndings2).find('ending');
        expect(measures.length).toEq(4, true, sliceEndings2);
        expect(endings.length).toEq(2, true, sliceEndings2);
        expect($(endings[0]).find('measure[n="10"]').length).toEq(1, true, sliceEndings2);
        expect($(endings[1]).find('measure').length).toEq(1, true, sliceEndings2);
        expect($(endings[1]).find('measure[n="11"]').length).toEq(1, true, sliceEndings2);


        end_test();

      });
    });

    // console.log('********* TEST: MeiLib.VariantMei.prototype.getSlice() ***********');
    //
    // start_test('VariantMei-prototype-getSlice');
    // var sliceMEI = variantMEI.getSlice({start_n:2, end_n:2, noClef:true, noKey:true, noMeter:true});
    // var lem = new MeiLib.SingleVariantPathScore(sliceMEI);
    // var rdg1 = new MeiLib.SingleVariantPathScore(sliceMEI, {
    //   'app01.l1s1m2': new MeiLib.AppReplacement('rdg', 'A_abcd'),
    // });
    // var rdg2 = new MeiLib.SingleVariantPathScore(sliceMEI, {
    //   'app01.l1s1m2': new MeiLib.AppReplacement('rdg', 'B_xyz'),
    // });
    // //TO ASSERT:
    // //  1. sliceMEI has one measure
    // //  2. that measure has @n=2
    // measures = $(sliceMEI.score).find('measure');
    // assert(measures.length, 1, true, sliceMEI.score);
    // assert($(measures[0]).attr('n'), "2", true, sliceMEI.score);
    //
    // end_test();

    describe('MeiLib.MeiDoc', function () {

      describe('MeiLib.MeiDoc - Simple', function () {


        it('MeiDoc-Simple', function () {
          console.log('********* TEST: MeiLib.MeiDoc - Simple ***********');

          var xmlid_asserts = {
            'app-recon' : {},
            'choice01' : {},
            'app-var' : {}
          };
          var xmlDoc_rich_mei = loadXMLDoc('xml/TC.CanonicalMEI.01.xml');
          var meiDoc = new MeiLib.MeiDoc(xmlDoc_rich_mei);

          console.log(meiDoc.APPs);
          for (var appID in meiDoc.ALTs) {
            expect(xmlid_asserts.hasOwnProperty(appID)).toEq(true);
          }
          meiDoc.initSectionView();
          // TO ASSERT:
          //  1. It is a plain MEI, that is:
          //    * there isn't any app or choice
          //    * sectionplane is...
          console.log(meiDoc.sectionplane);
          var apps = $(meiDoc.sectionview_score).find('app');
          var choices = $(meiDoc.sectionview_score).find('choice');
          expect(apps.length).toEq(0);
          expect(choices.length).toEq(0);
          console.log(meiDoc.sectionview_score.innerHTML);
          //TODO: Assert that default reading/choice is inserted:
          // 1. Find processing Instruction <?MEI2VF rdgStart="choice01"?>
          // 2. Get next sibling and
          // 3. Assert it's a <note> with @dur="2"
          expect(meiDoc.sectionplane["app-recon"][0]).toEq(undefined);
          expect(meiDoc.sectionplane["choice01"].length).toEq(1);
          expect(meiDoc.sectionplane["app-var"].length).toEq(1);
          expect(meiDoc.sectionplane["choice01"][0].tagname).toEq("corr");
          expect(meiDoc.sectionplane["app-var"][0].tagname).toEq("lem");
        });
      });

      describe('MeiLib.MeiDoc - Altgroups', function () {


        it('MeiDoc-Altgroups', function () {
          console.log('********* TEST: MeiLib.MeiDoc - Altgroups ***********');
          var xmlid_asserts = {
            'app-recon-01' : {},
            'app-recon-02' : {},
            'choice01' : {},
            'app-var-01' : {},
            'app-var-02' : {}
          };
          var xmlDoc_rich_mei = loadXMLDoc('xml/TC.CanonicalMEI.02.xml');
          var meiDoc = new MeiLib.MeiDoc(xmlDoc_rich_mei);

          for (var appID in meiDoc.ALTs) {
            expect(xmlid_asserts.hasOwnProperty(appID)).toEq(true);
          }
          meiDoc.initSectionView();
          console.log(meiDoc.sectionplane);
          console.log(meiDoc.altgroups);

          var apps = $(meiDoc.sectionview_score).find('app');
          var choices = $(meiDoc.sectionview_score).find('app');
          expect(apps.length).toEq(0);
          expect(choices.length).toEq(0);
          expect(meiDoc.sectionplane["app-recon-01"].length).toEq(0);
          expect(meiDoc.sectionplane["app-recon-02"].length).toEq(0);
          expect(meiDoc.sectionplane["choice01"][0].tagname).toEq("corr");
          expect(meiDoc.sectionplane["app-var-01"][0].tagname).toEq("lem");
          expect(meiDoc.sectionplane["app-var-02"][0].tagname).toEq("lem");

          expect(meiDoc.altgroups["app-recon-01"][0]).toEq("app-recon-01");
          expect(meiDoc.altgroups["app-recon-01"][1]).toEq("app-recon-02");
          expect(meiDoc.altgroups["app-recon-02"][0]).toEq("app-recon-01");
          expect(meiDoc.altgroups["app-recon-02"][1]).toEq("app-recon-02");
          expect(meiDoc.altgroups["app-var-01"][0]).toEq("app-var-01");
          expect(meiDoc.altgroups["app-var-01"][1]).toEq("app-var-02");
          expect(meiDoc.altgroups["app-var-02"][0]).toEq("app-var-01");
          expect(meiDoc.altgroups["app-var-02"][1]).toEq("app-var-02");
        });
      });

      describe('MeiLib.MeiDoc - Modify Section View', function () {


        it('MeiDoc-SectionView', function () {
          console.log('********* TEST: MeiLib.MeiDoc - Modify Section View ***********');
          var xmlDoc_rich_mei = loadXMLDoc('xml/TC.CanonicalMEI.02.xml');
          var meiDoc = new MeiLib.MeiDoc(xmlDoc_rich_mei);
          meiDoc.initSectionView();

          console.log('sectionplane after init: ');
          console.log(meiDoc.sectionplane);
          expect(meiDoc.sectionplane["app-recon-01"].length).toEq(0);
          expect(meiDoc.sectionplane["app-recon-02"].length).toEq(0);
          expect(meiDoc.sectionplane["choice01"][0].tagname).toEq("corr");
          expect(meiDoc.sectionplane["app-var-01"][0].tagname).toEq("lem");
          expect(meiDoc.sectionplane["app-var-02"][0].tagname).toEq("lem");

          var sectionplaneUpdate = {};
          // single replacements can be defined as a string instead of
          // a one item long list (backward compatibility)
          sectionplaneUpdate["app-recon-01"] = "rdgA.app-recon-01";
          sectionplaneUpdate["choice01"] = "sic-choice01";
          sectionplaneUpdate["app-var-01"] = "rdg.app-var-01";
          meiDoc.updateSectionView(sectionplaneUpdate);

          console.log('sectionplane after modifySectionview: ');
          console.log(meiDoc.sectionplane);
          // print_xml(meiDoc.sectionview_score);
          expect(meiDoc.sectionplane["app-recon-01"][0].xmlID).toEq("rdgA.app-recon-01");
          expect(meiDoc.sectionplane["app-recon-02"][0].xmlID).toEq("rdgA.app-recon-02");
          expect(meiDoc.sectionplane["choice01"][0].xmlID).toEq("sic-choice01");
          expect(meiDoc.sectionplane["app-var-01"][0].xmlID).toEq("rdg.app-var-01");
          expect(meiDoc.sectionplane["app-var-02"][0].xmlID).toEq("rdg.app-var-02");


          sectionplaneUpdate["choice01"] = []; // Replace with initial choice: corr
          sectionplaneUpdate["app-var-01"] = []; // Replace with initial reading: lem
          meiDoc.updateSectionView(sectionplaneUpdate);
          expect(meiDoc.sectionplane["choice01"].length).toEq(1);
          expect(meiDoc.sectionplane["app-var-01"].length).toEq(1);
          expect(meiDoc.sectionplane["choice01"][0].tagname).toEq("corr");
          expect(meiDoc.sectionplane["app-var-01"][0].tagname).toEq("lem");

        });
      });

      describe('MeiLib.MeiDoc - Modify Section View (Multiple Choice)', function () {


        it('MeiDoc-SectionView-MultipleChoice', function () {
          console.log('********* TEST: MeiLib.MeiDoc - Modify Section View (Multiple Choice) ***********');

          var xmlDoc_rich_mei = loadXMLDoc('xml/TC.CanonicalMEI.02.xml');
          var meiDoc = new MeiLib.MeiDoc(xmlDoc_rich_mei);
          meiDoc.initSectionView();

          var sectionplaneUpdate = {};
          sectionplaneUpdate["app-recon-01"] = [
            "rdgA.app-recon-01",
            "rdgB.app-recon-01"
          ];
          meiDoc.updateSectionView(sectionplaneUpdate);
          console.log('sectionplane after modifySectionview: ');
          console.log(meiDoc.sectionplane);
          expect(meiDoc.sectionplane["app-recon-01"].length).toEq(2);
          expect(meiDoc.sectionplane["app-recon-02"].length).toEq(2);
          expect(meiDoc.sectionplane["app-recon-01"][0].xmlID).toEq("rdgA.app-recon-01");
          expect(meiDoc.sectionplane["app-recon-01"][1].xmlID).toEq("rdgB.app-recon-01");
          expect(meiDoc.sectionplane["app-recon-02"][0].xmlID).toEq("rdgA.app-recon-02");
          expect(meiDoc.sectionplane["app-recon-02"][1].xmlID).toEq("rdgB.app-recon-02");
          expect($(meiDoc.sectionview_score).find('staff[n="3"]').length).toEq(2);
          expect($(meiDoc.sectionview_score).find('staff[n="4"]').length).toEq(2);


          sectionplaneUpdate["app-recon-01"] = ["rdgB.app-recon-01"];
          meiDoc.updateSectionView(sectionplaneUpdate);
          expect(meiDoc.sectionplane["app-recon-01"].length).toEq(1);
          expect(meiDoc.sectionplane["app-recon-02"].length).toEq(1);
          expect(meiDoc.sectionplane["app-recon-01"][0].xmlID).toEq("rdgB.app-recon-01");
          expect(meiDoc.sectionplane["app-recon-02"][0].xmlID).toEq("rdgB.app-recon-02");
          expect($(meiDoc.sectionview_score).find('staff[n="3"]').length).toEq(0);
          expect($(meiDoc.sectionview_score).find('staff[n="4"]').length).toEq(2);

          sectionplaneUpdate["app-recon-01"] = ["rdgA.app-recon-01"];
          meiDoc.updateSectionView(sectionplaneUpdate);
          expect(meiDoc.sectionplane["app-recon-01"].length).toEq(1);
          expect(meiDoc.sectionplane["app-recon-02"].length).toEq(1);
          expect(meiDoc.sectionplane["app-recon-01"][0].xmlID).toEq("rdgA.app-recon-01");
          expect(meiDoc.sectionplane["app-recon-02"][0].xmlID).toEq("rdgA.app-recon-02");
          expect($(meiDoc.sectionview_score).find('staff[n="3"]').length).toEq(2);
          expect($(meiDoc.sectionview_score).find('staff[n="4"]').length).toEq(0);

          delete sectionplaneUpdate["app-recon-01"];
          sectionplaneUpdate["app-recon-02"] = []; // Replace with initial reading: none
          meiDoc.updateSectionView(sectionplaneUpdate);
          expect(meiDoc.sectionplane["app-recon-01"].length).toEq(0);
          expect(meiDoc.sectionplane["app-recon-02"].length).toEq(0);
          expect($(meiDoc.sectionview_score).find('staff[n="3"]').length).toEq(0);
          expect($(meiDoc.sectionview_score).find('staff[n="4"]').length).toEq(0);

          sectionplaneUpdate["app-recon-02"] = [
            "rdgA.app-recon-02",
            "rdgB.app-recon-02"
          ];
          meiDoc.updateSectionView(sectionplaneUpdate);
          expect(meiDoc.sectionplane["app-recon-01"].length).toEq(2);
          expect(meiDoc.sectionplane["app-recon-02"].length).toEq(2);
          expect(meiDoc.sectionplane["app-recon-01"][0].xmlID).toEq("rdgA.app-recon-01");
          expect(meiDoc.sectionplane["app-recon-01"][1].xmlID).toEq("rdgB.app-recon-01");
          expect(meiDoc.sectionplane["app-recon-02"][0].xmlID).toEq("rdgA.app-recon-02");
          expect(meiDoc.sectionplane["app-recon-02"][1].xmlID).toEq("rdgB.app-recon-02");
          expect($(meiDoc.sectionview_score).find('staff[n="3"]').length).toEq(2);
          expect($(meiDoc.sectionview_score).find('staff[n="4"]').length).toEq(2);

        });
      });
    });
  });

});