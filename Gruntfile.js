module.exports = function(grunt) {

  'use strict';

  // Load plugins. 
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-closurecompiler');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

//    uglify: {
//      dist: {
//        options: {
//          mangle: true,
//          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//        },
//        files: { 'dist/<%= pkg.name %>.min.js': [ 'dist/<%= pkg.name %>.js' ] }
//      }
//    },

    requirejs: {
      compile: {
        options: {
          name: 'Interface',
          baseUrl: "src",
          paths: {
            'm2v' : '../src'
          },
//          mainConfigFile: "src/config.js",
          out: 'dist/<%= pkg.name %>.js',

          wrap: {
            start: "(function($, VF, undefined) {",
            end: "})(jQuery, Vex.Flow);"
          },

          exclude: [
            'jquery',
            'vexflow'
          ],

          optimize: "none",

          done: function(done, output) {
            var duplicates = require('rjs-build-analysis').duplicates(output);
            if (duplicates.length > 0) {
              grunt.log.subhead('Duplicates found in requirejs build:');
              grunt.log.warn(duplicates);
              done(new Error('r.js built duplicate modules, please check the excludes option.'));
            }
            done();
          },

          // based on jQuery's convert function, see [https://github.com/jquery/jquery/blob/master/build/tasks/build.js]
          onBuildWrite: function( name, path, contents ) {
            var rdefineEnd = /\}\);[^}\w]*$/;
            var amdName;
            // Convert var modules
            if ( /.\/var\//.test( path ) ) {
              contents = contents
                .replace( /define\([\w\W]*?return/, "var " + (/var\/([\w-]+)/.exec(name)[1]) + " =" )
                .replace( rdefineEnd, "" );

            } else {

              // Ignore jQuery's exports (the only necessary one)
              if ( name !== "jquery" ) {
                contents = contents
                  .replace( /\s*return\s+[^\}]+(\}\);[^\w\}]*)$/, "$1" )
                  // Multiple exports
                  .replace( /\s*exports\.\w+\s*=\s*\w+;/g, "" );
              }

              // Remove define wrappers, closure ends, and empty declarations
              contents = contents
                .replace( /define\([^{]*?{/, "" )
                .replace( rdefineEnd, "" );

              // Remove anything wrapped with
              // /* ExcludeStart */ /* ExcludeEnd */
              // or a single line directly after a // BuildExclude comment
              contents = contents
                .replace( /\/\*\s*ExcludeStart\s*\*\/[\w\W]*?\/\*\s*ExcludeEnd\s*\*\//ig, "" )
                .replace( /\/\/\s*BuildExclude\n\r?[\w\W]*?\n\r?/ig, "" );

              // Remove empty definitions
              contents = contents
                .replace( /define\(\[[^\]]+\]\)[\W\n]+$/, "" );
            }
            return contents;
          }
        }
      }
    },

    closurecompiler: {
      minify: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
        },
        options: {
          "compilation_level": "SIMPLE_OPTIMIZATIONS",
          "max_processes": 5,
          "banner": "/* hello world! */"
        }
      }
    },

//    concat: {
//      bower_js: {
//        options: {
//          separator: ';'
//        },
//        src: ['src/vexflow-overrides.js',
//          'src/meilib/MeiLib.js',
//          'src/core/Logger.js',
//          'src/core/RuntimeError.js',
//          'src/core/tables.js',
//          'src/core/Util.js',
//          'src/event/Chord.js',
//          'src/event/Note.js',
//          'src/event/Rest.js',
//          'src/eventlink/EventLink.js',
//          'src/eventlink/EventLinkCollection.js',
//          'src/eventlink/EventReference.js',
//          'src/eventlink/Hairpins.js',
//          'src/eventlink/Slurs.js',
//          'src/eventlink/Ties.js',
//          'src/eventpointer/EventPointerCollection.js',
//          'src/eventpointer/Directives.js',
//          'src/eventpointer/Dynamics.js',
//          'src/eventpointer/Fermatas.js',
//          'src/eventpointer/Ornaments.js',
//          'src/lyrics/Hyphenation.js',
//          'src/lyrics/Verses.js',
//          'src/measure/Measure.js',
//          'src/measure/StaveConnectors.js',
//          'src/stave/Stave.js',
//          'src/stave/StaveInfo.js',
//          'src/system/System.js',
//          'src/system/SystemInfo.js',
//          'src/voice/StaveVoice.js',
//          'src/voice/StaveVoices.js',
//          'src/core/Converter.js',
//          'src/Interface.js'],
//        dest: 'dist/meitovexflow.js'
//      }
//    },

    connect: {
      server: {
        options: {
          port: 8000
        }
      }
    },

    watch: {
      scripts: {
        files: ['src/*.js'],
        tasks: ['compile'],
        options: {
          livereload: true
        }
      }
    },

  });


  // Tasks.
//  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('default', ['requirejs:compile', 'closurecompiler:minify']);

  grunt.registerTask('run', ['connect', 'watch']);

  grunt.registerTask('compile', ['requirejs:compile']);
  grunt.registerTask('minify', ['closurecompiler:minify']);

}