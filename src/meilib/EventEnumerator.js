define([
  'jquery',
  'meilib/RuntimeError',
], function ($, RuntimeError, undefined) {

  if (!window.MeiLib) window.MeiLib = {};

  /**
   * @class EventEnumerator
   * Enumerate over the children events of node (node is a layer, beam or tuplet).
   * @constructor
   * @param {Object} node an XML DOM object
   * @param {} proportion
   */
  MeiLib.EventEnumerator = function (node, proportion) {
    this.init(node, proportion);
  };
  /**
   * @method init
   * @param {} node
   * @param {} proportion
   */
  MeiLib.EventEnumerator.prototype.init = function (node, proportion) {
    if (!node) {
      throw new MeiLib.RuntimeError('MeiLib.EventEnumerator.init():E01', 'node is null or undefined');
    }
    this.node = node;
    this.next_evnt = null;
    this.EoI = true;
    // false if and only if next_evnt is valid.
    this.children = $(this.node).children();
    this.i_next = -1;
    this.proportion = proportion || {
      num : 1,
      numbase : 1
    };
    this.outputProportion = proportion || {
      num : 1,
      numbase : 1
    };
    this.read_ahead();
  };
  /**
   * @method nextEvent
   * @public
   * @return
   */
  MeiLib.EventEnumerator.prototype.nextEvent = function () {
    if (!this.EoI) {
      var result = this.next_evnt;
      this.read_ahead();
      return result;
    }
    throw new MeiLib.RuntimeError('MeiLib.LayerEnum:E01', 'End of Input.')
  };

  /**
   * @method read_ahead
   * @private
   * @return
   */
  MeiLib.EventEnumerator.prototype.read_ahead = function () {
    if (this.beam_enumerator) {
      if (!this.beam_enumerator.EoI) {
        this.next_evnt = this.beam_enumerator.nextEvent();
        this.EoI = false;
      } else {
        this.EoI = true;
        this.beam_enumerator = null;
        this.step_ahead()
      }
    } else {
      this.step_ahead()
    }
  };

  /**
   * @method step_ahead
   * @private
   */
  MeiLib.EventEnumerator.prototype.step_ahead = function () {
    ++this.i_next;
    if (this.i_next < this.children.length) {
      this.next_evnt = this.children[this.i_next];
      var node_name = $(this.next_evnt).prop('localName');
      if (node_name === 'note' || node_name === 'rest' || node_name === 'mRest' || node_name === 'chord') {
        this.EoI = false
      } else if (node_name === 'beam') {
        this.beam_enumerator = new MeiLib.EventEnumerator(this.next_evnt);
        if (!this.beam_enumerator.EoI) {
          this.next_evnt = this.beam_enumerator.nextEvent();
          this.EoI = false;
        } else {
          this.EoI = true;
        }
      } else if (node_name === 'tuplet') {

        var proportion = {
          num : this.proportion.num * +this.next_evnt.getAttribute('num') || 3,
          numbase : this.proportion.numbase * +this.next_evnt.getAttribute('numbase') || 2
        };

        this.beam_enumerator = new MeiLib.EventEnumerator(this.next_evnt, proportion);
        if (!this.beam_enumerator.EoI) {
          this.outputProportion = this.beam_enumerator.outputProportion;
          this.next_evnt = this.beam_enumerator.nextEvent();
          this.EoI = false;
        } else {
          this.outputProportion = this.proportion;
          this.EoI = true;
        }
      }
    } else {
      this.EoI = true;
    }
  };


  return MeiLib;


});