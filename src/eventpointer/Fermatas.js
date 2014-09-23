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
  'm2v/core/Logger',
  'm2v/core/Util',
  'm2v/core/Tables',
  'm2v/eventpointer/EventPointerCollection',
  'm2v/event/EventUtil'
], function (VF, Logger, Util, Tables, EventPointerCollection, EventUtil, undefined) {


  /**
   * @class MEI2VF.Fermatas
   * @extend MEI2VF.EventPointerCollection
   * @private
   *
   * @constructor
   */
  var Fermatas = function (systemInfo, font) {
    this.init(systemInfo, font);
  };

  Vex.Inherit(Fermatas, EventPointerCollection, {

    init : function (systemInfo, font) {
      Fermatas.superclass.init.call(this, systemInfo, font);
    },

    createVexFromInfos : function (notes_by_id) {
      var me = this, i, model, note, annot;
      i = me.allModels.length;
      while (i--) {
        model = me.allModels[i];
        note = notes_by_id[model.startid];
        if (note) {
          EventUtil.addFermata(note.vexNote, model.element, model.atts.place);
        } else {
          console.log(model);
          Logger.warn('Input error', Util.serializeElement(model.element) +
                                            ' could not be rendered because the reference "' + model.startid +
                                            '" could not be resolved.');
        }
      }

    }

  });

  return Fermatas;

});
