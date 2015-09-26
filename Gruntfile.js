module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        concat: {
            "options": { "separator": "\n" },
            "build": {
                "src": ["src/Utils.js", "src/*.js"],
                "dest": "dist/pixicharts.js"
            }
        },
        uglify: {
          options: {
            // the banner is inserted at the top of the output
            banner: '/*! pixicharts.min.js <%= grunt.template.today("dd-mm-yyyy") %> */\n',
            sourceMap: true,
            sourceMapIncludeSources: true
          },
          dist: {
            files: {
              'dist/pixicharts.min.js': ['src/Utils.js', 'src/*.js']
            }
          }
        }
    });

    // Load required modules
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Task definitions
    grunt.registerTask('default', ['concat', 'uglify']);
};