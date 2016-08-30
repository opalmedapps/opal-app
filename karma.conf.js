// Karma configuration
// Generated on Wed Jun 11 2014 09:51:52 GMT-0500 (CDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files:[ 
  './www/lib/bower_components/angular/angular.js',
  './www/lib/bower_components/jquery/dist/jquery.js',
  './www/lib/bower_components/angular-animate/angular-animate.js',
  './www/lib/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
  './www/lib/bower_components/angular-elastic/elastic.js',
  './www/lib/bower_components/angular-sanitize/angular-sanitize.js',
  './www/lib/bower_components/angular-touch/angular-touch.js',
  './www/lib/bower_components/angular-translate/angular-translate.js',
  './www/lib/bower_components/angular-translate-handler-log/angular-translate-handler-log.js',
  './www/lib/bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
  './www/lib/bower_components/angular-translate-loader-url/angular-translate-loader-url.js',
  './www/lib/bower_components/angular-ui-router/release/angular-ui-router.js',
  './www/lib/bower_components/firebase/firebase.js',
  './www/lib/js/cryptojs/aes.js',
  './www/lib/js/cryptojs/mode-cfb-min.js',
  './www/lib/js/cryptojs/sha256.js', 
  './www/lib/bower_components/progressbar.js/dist/progressbar.js',
  './www/lib/bower_components/ngCordova/dist/ng-cordova.js',
  './www/lib/bower_components/bootstrap/dist/js/bootstrap.js',
  './www/lib/bower_components/onsenui/build/js/onsenui.js',
  './www/lib/js/angular-bootstrap/ui-bootstrap-tpls-1.1.2.js',
  './www/lib/js/cryptojs/*.js',
  './www/lib/bower_components/angular-tek-progress-bar/dist/tek.progress-bar.js',
   './www/lib/js/scrollglue/scrollglue.js',
  './www/lib/bower_components/angularfire/dist/angularfire.js',
  './www/lib/bower_components/angular-mocks/angular-mocks.js',
  './www/js/*.js','./www/js/controllers/*.js','./www/js/services/*.js','./www/js/directives/*.js','./www/js/filters/*.js', './test/spec/**/*.js'],

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
    reporters: ['spec'],


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
    browsers: [
        'PhantomJS'
        // , 'Chrome'
        // , 'Firefox'
        // , 'Safari'
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};