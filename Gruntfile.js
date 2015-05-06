module.exports = function(grunt) {

  'use strict';

  // Load plugins. 
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-requirejs');
  grunt.loadNpmTasks('grunt-closurecompiler');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      compile: {
        options: {
          name: 'mei2vf/Interface',
          baseUrl: "src",
          mainConfigFile: "src/config.js",
          out: 'dist/<%= pkg.name %>.js',
          wrap: {
            start: "(function($, VF, undefined) {",
            end: "})(jQuery, Vex.Flow);"
          },
          exclude: [
            'jquery',
            'vex'
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
          "max_processes": 5
        }
      }
    },

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

    jasmine: {
        testdev: {
            src: 'src/*/*.js',
            options: {
                specs: 'tests/spec/*/*.js',
                helpers: ['tests/loadXMLDoc.js', 'tests/phantomPolyFill.js'],
                host: 'http://127.0.0.1:8000/',
                template: require('grunt-template-jasmine-requirejs'),
                options : {
                    keepRunner :true
                },
                templateOptions: {
                    requireConfig: {
                        baseUrl: 'src/',
                        paths : {
                            'tests' : '../tests',
                                'jquery' : '../bower_components/jquery/dist/jquery.min',
                                'vex' : '../bower_components/vexflow/releases/vexflow-min',
                            'vexflow':'../src/mei2vf/vexflow',
                                'common' : '../src/common',
                                'mei2vf' : '../src/mei2vf',
                                'meilib' : '../src/meilib'
                        },
                        shim : {
                            'vex' : {
                                exports : 'Vex'
                            }
                        }
                    }
                }
            }
        }
    }

  });


  // Tasks.
  grunt.registerTask('run', ['connect', 'watch']);

  // unit and rendering tests of requirejs code in phantomJS
  grunt.registerTask('test', ['connect', 'jasmine:testdev']);

  grunt.registerTask('compile', ['requirejs:compile']);
  grunt.registerTask('minify', ['closurecompiler:minify']);

  grunt.registerTask('build', ['compile', 'minify']);

  grunt.registerTask('dist', ['test', 'compile', 'minify']);

  grunt.registerTask('default', ['dist']);

}