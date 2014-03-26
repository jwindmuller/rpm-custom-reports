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
    watch: {
      md: {
        files: "*.md",
        tasks: ['md']
      },
      jison: {
        files: ["docs/grammar.jison"],
        tasks: ['jison:parser']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-jison');

  // Tasks
  grunt.registerTask('parser', ['jison:parser', 'watch:jison']);
  grunt.registerTask('md', ['markdown', 'watch:md']);

  // Default Task is all
  grunt.registerTask('default', ['md', 'parser']);
  

};