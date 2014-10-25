/*
 * (C) Copyright 2014 Alexander Erhard (http://alexandererhard.com/).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
define([
  'vexflow',
  'common/Logger',
  'common/Util'
], function (VF, Logger, Util) {


  var SpanCollection = function() {

  };


  SpanCollection.prototype = {

    init: function () {
      var me = this;
      me.spanElements = [];
      me.vexObjects = [];
    },

    addSpanElements: function (elements) {
      this.spanElements.push(elements);
    },

    addVexObject : function (obj) {
      this.vexObjects.push(obj);
    },

    resolveSpans : function (elements, spanObjectCreator, fragmentPostProcessor, notes_by_id) {
      var me = this, i, j, element, pList, pListArray, startIdAtt, endIdAtt;

      for (i = 0, j = elements.length; i < j; i++) {
        element = elements[i];
        pList = element.getAttribute('plist');
        pListArray = Util.pListToArray(pList);

        startIdAtt = element.getAttribute('startid');
        endIdAtt = element.getAttribute('endid');
        if (startIdAtt !== null || endIdAtt !== null) {
          // insert startid and endid to the plist if they're not already there
          if (pListArray[0] !== startIdAtt) {
            pListArray.unshift(startIdAtt);
          }
          if (pListArray[pListArray.length - 1] !== endIdAtt) {
            pListArray.push(endIdAtt);
          }
          var voices = [];
          var firstMeasure;
          var noteObjects = pListArray.map(function (item, index) {
            var obj = notes_by_id[item.substring(1)];
            if (!obj) {
              throw new RuntimeError('Reference "' + item + '" given in ' + Util.serializeElement(element) +
                                     ' not found.')
            }
            var voice = obj.vexNote.voice;
            if (index === 0) {
              firstMeasure = $(obj.meiNote).closest('measure').get(0);
            }
            var voiceIndex = voices.indexOf(voice);
            if (voiceIndex === -1) {
              // voice index remains -1 if the note is not in the start measure; it will not get
              // included then when adding spaces
              if (!firstMeasure || $(obj.meiNote).closest('measure').get(0) === firstMeasure) {
                //noinspection JSReferencingMutableVariableFromClosure
                voiceIndex = voices.push(voice) - 1;
              }
            }
            return {
              obj : obj, voiceIndex : voiceIndex, vexNote : obj.vexNote
            };
          });

          var newSpace;

          var createSpaceFrom = function (vexNote, stave) {
            var gn = new VF.GhostNote(vexNote.getDuration());

            // TODO handle dots
            gn.setStave(stave);
            return gn;
          };

          var notes = noteObjects.map(function (item) {
            return item.vexNote;
          });

          var newVoiceSegment;
          var indicesInVoice;

          if (voices.length > 1) {
            // create spaces in voices

            for (var m = 0, n = voices.length; m < n; m++) {
              newVoiceSegment = [];
              indicesInVoice = [];
              for (var o = 0, p = noteObjects.length; o < p; o++) {
                if (noteObjects[o].voiceIndex === m) {
                  newVoiceSegment[o] = noteObjects[o].vexNote;
                  indicesInVoice.push(voices[m].tickables.indexOf(noteObjects[o].vexNote));
                } else if (noteObjects[o].voiceIndex !== -1) {

                  // TODO handle this later for each measure!!!
                  newSpace = createSpaceFrom(noteObjects[o].vexNote, voices[m].tickables[0].stave);
                  newVoiceSegment[o] = newSpace;
                }
              }

              var t = voices[m].tickables;
              if (m !== 0 && typeof fragmentPostProcessor === 'function') {
                fragmentPostProcessor(element, newVoiceSegment);
              }
              voices[m].tickables =
              t.slice(0, indicesInVoice[0]).concat(newVoiceSegment).concat(t.slice(indicesInVoice[indicesInVoice.length -
                                                                                                  1] + 1));
            }
          }

          spanObjectCreator(notes, voices, element);

        } else {
          Logger.warn('Missing attributes', 'Could not process ' + Util.serializeElement(element) +
                                            ', because @startid or @endid is missing.')
        }
      }
    },

    postFormat : function () {
      var i, j, items = this.vexObjects;
      for (i = 0, j = items.length; i < j; i++) {
        items[i].postFormat();
      }
    },

    setContextAndDraw : function (ctx) {
      var i, j, items = this.vexObjects;
      for (i = 0, j = items.length; i < j; i++) {
        items[i].setContext(ctx).draw();
      }
    }


  };

  return SpanCollection;

});
