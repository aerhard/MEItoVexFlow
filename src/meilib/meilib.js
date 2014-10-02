define([
  'jquery',
  'meilib/RuntimeError',
  'meilib/EventEnumerator',
  'meilib/SliceMEI',
  'meilib/Alt',
  'meilib/Variant',
  'meilib/MeiDoc',
  'common/Util',
], function ($, RuntimeError, EventEnumerator, SliceMEI, Alt, Variant, MeiDoc, Util, undefined) {
  /*
   * meilib.js
   *
   * Author: Zoltan Komives Created: 05.07.2013
   *
   * Copyright © 2012, 2013 Richard Lewis, Raffaele Viglianti, Zoltan Komives,
   * University of Maryland
   *
   * Licensed under the Apache License, Version 2.0 (the "License"); you may not
   * use this file except in compliance with the License. You may obtain a copy of
   * the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
   * License for the specific language governing permissions and limitations under
   * the License.
   */
  /**
   * Contributor: Alexander Erhard
   */
  /**
   * @class MeiLib
   * MeiLib - General purpose JavaScript functions for processing MEI documents.
   * @singleton
   */

  if (!window.MeiLib) window.MeiLib = {};

  /**
   * @method createPseudoUUID
   */
  MeiLib.createPseudoUUID = function () {
    return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).substr(-4)
  };

  /**
   * @method durationOf
   * Calculate the duration of an event (number of beats) according to the given
   * meter.
   *
   * Event refers to musical event such as notes, rests, chords. The MEI element
   * <b>space</b> is also considered an event.
   *
   * @param evnt an XML DOM object
   * @param meter the time signature object { count, unit }
   * @param {Boolean} zeroGraceNotes Specifies if all grace notes should return the duration 0
   */
  MeiLib.durationOf = function (evnt, meter, zeroGraceNotes) {

    var IsZeroDurEvent = zeroGraceNotes ? function (evnt, tagName) {
      return evnt.hasAttribute('grace') || tagName === 'clef';
    } : function (evnt, tagName) {
      return tagName === 'clef';
    };

    var IsSimpleEvent = function (tagName) {
      return (tagName === 'note' || tagName === 'rest' || tagName === 'space');
    };

    var durationOf_SimpleEvent = function (simple_evnt, meter) {
      var dur = simple_evnt.getAttribute('dur');
      if (!dur) {
        console.warn('@dur of <b>note</b>, <b>rest</b> or <b>space</b> must be specified. Proceeding with default @dur="4". Element:');
        console.log(simple_evnt);
        dur = "4";
        //      throw new MeiLib.RuntimeError('MeiLib.durationOf:E04', '@dur of <b>note</b>, <b>rest</b> or <b>space</b> must be specified.');
      }
      //    console.log(MeiLib.dotsMult(simple_evnt) * MeiLib.dur2beats(Number(dur), meter));
      return MeiLib.dotsMult(simple_evnt) * MeiLib.dur2beats(Number(dur), meter);
    };

    var durationOf_Chord = function (chord, meter, layer_no) {
      var i, j, childNodes, note;
      if (!layer_no) {
        layer_no = "1";
      }
      var dur = chord.getAttribute('dur');
      var dotsMult = MeiLib.dotsMult(chord);
      if (dur) {
        return dotsMult * MeiLib.dur2beats(Number(dur), meter);
      }
      childNodes = chord.childNodes;
      for (i = 0, j = childNodes.length; i < j; i++) {
        if (childNodes[i].localName === 'note') {
          note = childNodes[i];
          var lyr_n = note.getAttribute('layer');
          if (!lyr_n || lyr_n === layer_no) {
            var dur_note = note.getAttribute('dur');
            var dotsMult_note = MeiLib.dotsMult(chord);
            if (!dur && dur_note) {
              dur = dur_note;
              dotsMult = dotsMult_note;
            } else if (dur && dur != dur_note) {
              throw new MeiLib.RuntimeError('MeiLib.durationOf:E05', 'duration of <chord> is ambiguous. Element: ' +
                                                                     Util.serializeElement(chord));
            }
          }
        }
      }

      if (!dur) {
        throw new MeiLib.RuntimeError('MeiLib.durationOf:E06', '@dur of chord must be specified either in <chord> or in at least one of its <note> elements. Proceeding with default @dur="4". Element:' +
                                                               Util.serializeElement(chord));
      }
      return dotsMult * MeiLib.dur2beats(Number(dur), meter);
    }

    var durationOf_Beam = function (beam, meter) {
      var acc = 0, i, j, childNodes, childNode;
      childNodes = beam.childNodes;
      for (i = 0, j = childNodes.length; i < j; i++) {
        childNode = childNodes[i];
        var dur_b;
        var tagName = childNode.localName;
        if (IsZeroDurEvent(childNode, tagName)) {
          dur_b = 0;
        } else if (IsSimpleEvent(tagName)) {
          dur_b = durationOf_SimpleEvent(childNode, meter);
        } else if (tagName === 'chord') {
          dur_b = durationOf_Chord(childNode, meter);
        } else if (tagName === 'beam') {
          dur_b = durationOf_Beam(childNode, meter);
        } else if (tagName === 'tuplet') {
          dur_b = durationOf_Tuplet(childNode, meter);
        } else {
          dur_b = 0;
          //throw new MeiLib.RuntimeError('MeiLib.durationOf:E03', "Not supported element '" + tagName + "'");
        }
        acc += dur_b;
      }
      return acc;
    };

    var durationOf_Tuplet = function (tuplet, meter) {
      // change the meter unit according to the ratio in the tuplet, the get the duration as if the tuplet were a beam
      var num = +tuplet.getAttribute('num') || 3;
      var numbase = +tuplet.getAttribute('numbase') || 2;
      var acc = durationOf_Beam(tuplet, {
        count : meter.count,
        unit : meter.unit * numbase / num
      });
      return acc;
    };

    var evnt_name = evnt.localName;
    if (IsZeroDurEvent(evnt, evnt_name)) {
      return 0;
    }
    if (IsSimpleEvent(evnt_name)) {
      return durationOf_SimpleEvent(evnt, meter);
    }
    if (evnt_name === 'mRest') {
      return meter.count;
    }
    if (evnt_name === 'chord') {
      return durationOf_Chord(evnt, meter);
    }
    if (evnt_name === 'beam') {
      return durationOf_Beam(evnt, meter);
    }
    if (evnt_name === 'tuplet') {
      return durationOf_Tuplet(evnt, meter);
    }
    return 0;
    //throw new MeiLib.RuntimeError('MeiLib.durationOf:E05', "Not supported element: '" + evnt_name + "'");

  }
  /**
   * @method tstamp2id
   * Find the event with the minimum distance from of the given timestamp.
   *
   * @param {String} tstamp the timestamp to match against events in the given
   * context. Local timestamp only (without measure part).
   * @param {Object} layer an XML DOM object, contains all events in the given
   * measure.
   * @param {Object} meter the effective time signature object { count, unit } in
   * the measure containing layer.
   * @return {String} the xml:id of the closest element, or
   * undefined if <b>layer</b> contains no events.
   */
  MeiLib.tstamp2id = function (tstamp, layer, meter) {
    var ts = Number(tstamp);
    var ts_acc = 0;
    // total duration of events before current event
    var c_ts = function () {
      return ts_acc + 1;
    };// tstamp of current event
    var distF = function () {
      return ts - c_ts();
    };// signed distance between tstamp and tstamp of current event;
    var eventList = new MeiLib.EventEnumerator(layer);
    var evnt;
    var dist;
    var prev_evnt;
    // previous event
    var prev_dist;
    // previous distance
    while (!eventList.EoI && (dist === undefined || dist > 0)) {
      prev_evnt = evnt;
      prev_dist = dist;
      evnt = eventList.nextEvent();
      dist = distF();
      if (!evnt.hasAttribute('grace') && evnt.localName !== 'clef') {
        ts_acc +=
        MeiLib.durationOf(evnt, meter, true) * eventList.outputProportion.numbase / eventList.outputProportion.num;
      }
      //    m = meter;
      //    e = evnt;
    }

    if (dist === undefined) {
      return undefined;
    }
    var winner;
    if (dist < 0) {
      if (prev_evnt && prev_dist < Math.abs(dist)) {
        winner = prev_evnt;
      } else {
        winner = evnt;
      }
    } else {
      winner = evnt;
    }

    var getFullNote = function (evnt) {
      if (evnt.hasAttribute('grace') || evnt.localName === 'clef') {
        return getFullNote(eventList.nextEvent()) || evnt;
      }
      return evnt;
    };

    winner = getFullNote(winner);

    var xml_id;
    xml_id = winner.getAttribute('xml:id');
    if (!xml_id) {
      xml_id = MeiLib.createPseudoUUID();
      winner.setAttribute('xml:id', xml_id);
    }
    return xml_id;
  }
  /**
   * @method XMLID
   * returns the xml:id attribute of an element; if there is none, the function
   * created a pseudo id, adds it to the element and returns that id.
   * @param {Element} elem the element to process
   * @return {String} the xml:id of the element
   */
  MeiLib.XMLID = function (elem) {
    var xml_id = elem.getAttribute('xml:id');
    if (!xml_id) {
      xml_id = MeiLib.createPseudoUUID();
      elem.setAttribute('xml:id', xml_id);
    }
    return xml_id;
  }
  /**
   * @method id2tstamp
   * Calculates a timestamp value for an event in a given context. (Event refers
   * to musical events such as notes, rests and chords).
   *
   * @param eventid {String} the xml:id of the event
   * @param context {Array} of contextual objects {layer, meter}. Time signature
   * is mandatory for the first one, but optional for the rest. All layers belong
   * to a single logical layer. They are the layer elements from some consequtive
   * measures.
   * @return {String} the MEI timestamp value (expressed in beats relative to the
   * meter of the measure containing the event) of all events that happened before
   * the given event in the given context. If the event is not in the first
   * measure (layer) the timestamp value contains a 'measure part', that is for
   * example 2m+2 if the event is at the second beat in the 3rd measure.
   */
  MeiLib.id2tstamp = function (eventid, context) {
    var meter;
    var found = false;
    for (var i = 0; i < context.length && !found; ++i) {
      if (context[i].meter) {
        meter = context[i].meter;
      }
      if (i === 0 && !meter) {
        throw new MeiLib.RuntimeError('MeiLib.id2tstamp:E001', 'No time signature specified');
      }

      var result = MeiLib.sumUpUntil(eventid, context[i].layer, meter);
      if (result.found) {
        found = true;
        return i.toString() + 'm' + '+' + (result.beats + 1).toString();
      }
    }
    throw new MeiLib.RuntimeError('MeiLib.id2tstamp:E002', 'No event with xml:id="' + eventid +
                                                           '" was found in the given MEI context.');
  };

  /**
   * @method dur2beats
   * Convert absolute duration into relative duration (nuber of beats) according
   * to time signature.
   *
   * @param dur {Number} reciprocal value of absolute duration (e.g. 4->quarter
   * note, 8->eighth note, etc.)
   * @param {Object} meter the time signature object { count, unit }
   * @return {Number}
   */
  MeiLib.dur2beats = function (dur, meter) {
    return (meter.unit / dur);
  }
  /**
   * @method beats2dur
   * Convert relative duration (nuber of beats) into absolute duration (e.g.
   * quarter note, eighth note, etc) according to time signature.
   *
   * @param beats {Number} duration in beats @param meter time signature object {
 * count, unit } @return {Number} reciprocal value of absolute duration (e.g. 4
   * -> quarter note, 8 -> eighth note, etc.)
   * @param {Object} meter
   */
  MeiLib.beats2dur = function (beats, meter) {
    return (meter.unit / beats);
  }
  /**
   * @method dotsMult
   * Converts the <b>dots</b> attribute value into a duration multiplier.
   *
   * @param node XML DOM object containing a node which may have <code>dots</code>
   * attribute
   * @return {Number} The result is 1 if no <code>dots</code> attribute is present.
   * For <code>dots="1"</code> the result is 1.5, for <code>dots="2"</code> the
   * result is 1.75, etc.
   */
  MeiLib.dotsMult = function (node) {
    var dots = node.getAttribute('dots');
    dots = Number(dots || "0");
    var mult = 1;
    for (; dots > 0; --dots) {
      mult += (1 / Math.pow(2, dots))
    }
    return mult;
  };
  /**
   * @method sumUpUntil
   * For a given event (such as note, rest chord or space) calculates the combined
   * length of preceding events, or the combined length of all events if the given
   * event isn't present.
   *
   * @param {String} eventid the value of the xml:id attribute of the event
   * @param {Object} layer an XML DOM object containing the MEI <b>Layer</b>
   * element
   * @param {Object} meter the time signature object { count, unit }
   * @return {Object} an object { beats:number, found:boolean }. 1. 'found' is true
   * and 'beats' is the total duration of the events that happened before the event
   * 'eventid' within 'layer', or 2. 'found' is false and 'beats is the total
   * duration of the events in 'layer'.
   */
  MeiLib.sumUpUntil = function (eventid, layer, meter) {

    var sumUpUntil_inNode = function (node) {
      var beats, children, found = null, dur, dots, subtotal, chord_dur, i;
      var node_name = node.localName;
      if (node.hasAttribute('grace') || node_name === 'clef') {
        return {
          beats : 0,
          found : (node.getAttribute('xml:id') === eventid)
        };
      }
      if (node_name === 'note' || node_name === 'rest') {
        if (node.getAttribute('xml:id') === eventid) {
          return {
            beats : 0,
            found : true
          };
        } else {
          dur = Number(node.getAttribute('dur'));
          if (!dur) {
            throw new MeiLib.RuntimeError('MeiLib.sumUpUntil:E001', "Duration is not a number ('breve' and 'long' are not supported).");
          }
          dots = node.getAttribute('dots');
          dots = Number(dots || "0");
          beats = MeiLib.dotsMult(node) * MeiLib.dur2beats(dur, meter);

          return {
            beats : beats,
            found : false
          };
        }
      } else if (node_name === 'mRest') {
        if (node.getAttribute('xml:id') === eventid) {
          return {
            beats : 0,
            found : true
          };
        } else {
          return {
            beats : meter.count,
            found : false
          };
          // the duration of a whole bar expressed in number of beats.
        }
      } else if (node_name === 'layer' || node_name === 'beam' || node_name === 'tuplet') {

        // sum up childrens' duration
        beats = 0;
        children = node.childNodes;
        found = false;
        for (i = 0; i < children.length && !found; ++i) {
          if (children[i].nodeType === 1) {
            subtotal = sumUpUntil_inNode(children[i]);
            beats += subtotal.beats;
            found = subtotal.found;
          }
        }
        return {
          beats : beats,
          found : found
        };
      } else if (node_name === 'chord') {
        chord_dur = node.getAttribute('dur');
        if (node.getAttribute('xml:id') === eventid) {
          return {
            beats : 0,
            found : true
          };
        } else {
          // ... or find the longest note in the chord ????
          chord_dur = node.getAttribute('dur');
          if (chord_dur) {
            //            if (node.querySelector("[*|id='" + eventid + "']")) {
            if ($(node).find("[xml\\:id='" + eventid + "']").length) {
              return {
                beats : 0,
                found : true
              };
            } else {
              return {
                beats : MeiLib.dur2beats(chord_dur, meter),
                found : found
              };
            }
          } else {
            children = node.childNodes;
            found = false;
            for (i = 0; i < children.length && !found; ++i) {
              if (children[i].nodeType === 1) {
                subtotal = sumUpUntil_inNode(children[i]);
                beats = subtotal.beats;
                found = subtotal.found;
              }
            }
            return {
              beats : beats,
              found : found
            };
          }
        }
      }
      return {
        beats : 0,
        found : false
      };
    };

    return sumUpUntil_inNode(layer);
  };

  return MeiLib;

});

