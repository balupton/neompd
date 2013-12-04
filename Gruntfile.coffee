# Export Grunt configruation
module.exports = (grunt) ->

  grunt.initConfig
    # Minify CSS
    cssmin:
      index:
        files:
          # Replace the CSS with a minified copy of it.
          'out/styles/main.css': [
            'out/styles/main.css'
          ]

    # Use Webpack to bundle all the JavaScript together correctly.
    webpack:
      development:
        context: "out/scripts"
        entry: "./entry.js"
        output:
          path: "out/scripts/"
          filename: "main.js"
        stats:
          colors: true
          reasons: true
        failOnError: true
      production:
        context: "out/scripts"
        entry: "./entry.js"
        output:
          path: "out/scripts/"
          filename: "main.js"
        optimize:
          minimize: true
    
    jshint:
      options:
        jshintrc: true
      scan: [
        "src/files/scripts/*.js"
      ]

  # Load all available tasks.
  grunt.loadNpmTasks "grunt-contrib-cssmin"
  grunt.loadNpmTasks "grunt-webpack"
  grunt.loadNpmTasks "grunt-contrib-jshint"

  # On the production environment, run Webpack and the CSS minifier.
  grunt.registerTask "production", ["webpack:production", "cssmin"]

  # On the development environment, just run Webpack.
  grunt.registerTask "development", ["webpack:development"]

  # By default, run the Development tasks.
  grunt.registerTask "default", ["development"]
