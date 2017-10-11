// Karma configuration
// Generated on Mon Sep 25 2017 10:14:18 GMT-0400 (EDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'test/**.js',
      'lib/bower_components/angular/angular.js',
      'lib/bower_components/jquery/dist/jquery.js',
      'lib/bower_components/angular-animate/angular-animate.js',
      'lib/bower_components/angular-sanitize/angular-sanitize.js',
      'lib/bower_components/angular-translate/angular-translate.js',
      'lib/bower_components/angular-translate-handler-log/angular-translate-handler-log.js',
      'lib/bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
      'lib/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
      'lib/bower_components/progressbar.js/dist/progressbar.js',
      'lib/bower_components/angular-ui-router/release/angular-ui-router.js',
      'lib/bower_components/angular-touch/angular-touch.js',
      'lib/bower_components/firebase/firebase.js',
      'lib/bower_components/angularfire/dist/angularfire.js',
      'lib/bower_components/ngCordova/dist/ng-cordova.js',
      'lib/bower_components/crypto-js/crypto-js.js',
      'lib/bower_components/angular-elastic/elastic.js',
      'lib/bower_components/angular-scroll-glue/src/scrollglue.js',
      'lib/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'lib/bower_components/angular-tek-progress-bar/dist/tek.progress-bar.js',
      'lib/bower_components/onsenui/js/onsenui.js',
      'lib/bower_components/angular-mocks/angular-mocks.js',
      'js/*.js',
      'js/**/*.js',
      'js/*spec.js',
      'js/**/*spec.js',
      'views/**/*.html'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
