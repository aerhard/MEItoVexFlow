define([
  'vexflow',
  'meilib/MeiLib',
  'core/Logger',
  'core/Converter',
  'vexflow-overrides'
], function(VF, MeiLib, Logger, Converter, undefined) {

  window.MeiLib = MeiLib;


  window.MEI2VF = {
    setLogging : Logger.setEnabled,
    Converter : {
      initConfig : function(c) {
        return Converter.prototype.initConfig(c);
      },
      process : function(c) {
        return Converter.prototype.process(c);
      },
      draw : function(c) {
        return Converter.prototype.draw(c);
      },
      getAllVexMeasureStaffs : function() {
        return Converter.prototype.getAllVexMeasureStaffs();
      },
      getStaffArea : function() {
        return Converter.prototype.getStaffArea();
      }
    },
    /**
     * @property
     */
    rendered_measures : null,
    /**
     * Main rendering function. Uses the Converter's prototype as a
     * singleton. No scaling; page layout information in the MEI code is ignored.
     * @param {XMLDocument} xmlDoc The MEI XML Document
     * @param {XMLElement} target An svg or canvas element
     * @param {Number} width The width of the print space in pixels
     * @param {Number} height The height of the print space in pixels
     * @param {Number} backend Set to Vex.Flow.Renderer.Backends.RAPHAEL to
     * render to a Raphael context; if falsy, Vex.Flow.Renderer.Backends.CANVAS
     * is set
     * @param {Object} options The options passed to the converter. For a list, see
     * {@link MEI2VF.Converter MEI2VF.Converter}
     */
    render_notation : function(xmlDoc, target, width, height, backend, options) {
      var ctx;
      var cfg = options || {};

      ctx = new VF.Renderer(target, backend || VF.Renderer.Backends.CANVAS).getContext();

      width = width || 800;
      height = height || 350;

      if (+backend === VF.Renderer.Backends.RAPHAEL) {
        ctx.paper.setSize(width, height);
      }

      cfg.page_width = width;

      this.Converter.initConfig(cfg);
      this.Converter.process(xmlDoc[0] || xmlDoc);
      this.Converter.draw(ctx);
      this.rendered_measures = this.Converter.getAllVexMeasureStaffs();

    }
  };

});