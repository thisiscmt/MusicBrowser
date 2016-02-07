var pkgJson = require('./package.json');

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // Concat the specified files into mb-core.js
        concat: {
            mb_core : {
                src: [
                    'scripts/lib/thenBy.js',
                    'scripts/app.js',
                    'scripts/services/mb-common.js',
                    'scripts/services/mb-data.js',
                    'scripts/directives/bindonce.js',
                    'scripts/directives/focusMe.js',
                    'scripts/controllers/modal.js',
                    'scripts/controllers/search.js',
                    'scripts/controllers/artistSearch.js',
                    'scripts/controllers/artistLookup.js',
                    'scripts/controllers/albumSearch.js',
                    'scripts/controllers/albumLookup.js',
                    'scripts/controllers/songSearch.js',
                    'scripts/controllers/styleLookup.js',
                    'scripts/controllers/genreLookup.js',
                    'scripts/controllers/options.js'
                ],
                dest: 'scripts/mb-core.js'
            }
        },
        // Minify the combined JS file
        uglify: {
            options: {
                // Banner for inserting at the top of the result
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy hh:") %> */\n',
                sourceMap: true,
                sourceMapName: 'scripts/sourceMap.map'
            },
            mb_core: {
                src: [
                    'Scripts/mb-core.js'
                ],
                dest: 'Scripts/mb-core.min.js'
            }
        },
        cachebreaker: {
            mb_core: {
                options: {
                    match: ['scripts/mb-core.min.js'],
                    replacement: function (){
                        return pkgJson.version;
                    }
                },
                files: {
                    src: ['index.html']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-cache-breaker');

    grunt.registerTask('default', ['concat:mb_core', 'uglify:mb_core', 'cachebreaker:mb_core']);
}
