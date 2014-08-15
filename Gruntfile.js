module.exports = function(grunt) {

  grunt.initConfig({
    markdown: {
      all: {
        files: {
          'docs/index.html': 'README.md'
        },
        options: {
          template: 'docs/tpl.jst'
        }
      }
    },
    jison: {
      parser: {
        files: {
          'lib/Parser.js': 'docs/grammar.jison'
        }
      }
    },
    copy: {
      development: {
        files: [
          {
            'lib/mustache/mustache.js': 'bower_components/mustache/mustache.js'
          }
        ]
      }
    },
    less : {
      development: {
        files: [
          {'example/style.css': 'example/less/example.less'}
        ]
      }
    },
    watch: {
      md: {
        files: "*.md",
        tasks: ['md']
      },
      jison: {
        files: ["docs/grammar.jison"],
        tasks: ['jison:parser']
      },
      all: {
        files: ["*.md", "docs/grammar.jison", "example/less/*.less"],
        tasks: ['all']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.loadNpmTasks('grunt-jison');

  // Tasks
  grunt.registerTask('parser', ['jison:parser', 'watch:jison']);
  grunt.registerTask('md', ['markdown', 'watch:md']);

  // Default Task is all
  grunt.registerTask('all', ['markdown', 'jison:parser', 'copy', 'less']);

  grunt.registerTask('default', ['all', 'watch:all']);
  

};