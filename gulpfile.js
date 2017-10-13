/**
 * Author:David Herrera, August 2016
 * Github: dherre3
 * E-mail: davidfherrerar@gmail.com
 *
 */

var gulp = require('gulp');
var gulpDocs = require('gulp-ngdocs');
var connect = require('gulp-connect');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var size = require('gulp-size');
var notify = require('gulp-notify');
var open = require('gulp-open');

/**
 *
 * Documentation tasks
 */
gulp.task('ngdocs', [], function () {
    var options = {
        html5Mode: true,
        scripts: [
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.1/angular.min.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.5.1/angular-animate.min.js'
        ],
        startPage: '/api/MUHCApp',
        title: "Opal Mobile App",
        titleLink: "/api/MUHCApp"
    };
    return gulp.src(['www/js/services/*.js', 'www/js/app.js','www/js/bootstrap.js'])
        .pipe(gulpDocs.process(options))
        .pipe(gulp.dest('./docs'));
});

//Watch changes to files in order to write up documentation
gulp.task('watch-docs',function(){
    gulp.watch(['www/js/**/*.js'],['ngdocs']);
});

//Create a server to show ngdocs
gulp.task('connect_ngdocs', function() {
    connect.server({
        root: 'docs',
        livereload: false,
        fallback: 'docs/index.html',
        port: 8083
    });
});


/**
 *
 * SERVER CREATION FOR DISPLAYING PROJECT: Creating server for project to watch files and re-load (not necessary)
 *
 */
gulp.task('connect', function() {
    connect.server({
        root: 'www',
        //Change this flag if livereload annoys you
        livereload: true,
        port:9000
    });
});

//Open server
gulp.task('open',function()
{
    gulp.src('./www/index.html').pipe(open({uri: 'http://localhost:9000', app: 'Google Chrome'}));
});

//Reload all the files in www
gulp.task('reload-code', function () {
    gulp.src('./www/**/*')
        .pipe(connect.reload());
});

//Watch files and reload code if something happens
gulp.task('watch-files', function () {
    gulp.watch(['./www/js/**/*'], ['reload-code']);
});

//Make server connection and set to watch files for reload
gulp.task('serve', ['connect','open', 'watch-files']);

/**
 *
 * BUILDING TASKS: Minify Images, minify css, minify js and concatanate, minify third party js files, copying vendor css files.
 *
 */
//Main building task for production
gulp.task('build',['minify-css','minify-vendor-js', 'copy-vendor-css', 'minify-html','minify-images', 'size-prebuild','size-postbuild']);

//Minify images
gulp.task('minify-images', function(){
    return gulp.src('www/img/*.+(png|jpg|jpeg|gif|svg)')
        // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true
        })))
        .pipe(gulp.dest('dest/img'));
});

//Minifying app css task
gulp.task('minify-css', function() {
    return gulp.src('www/css/*.css')
        .pipe(concat('app.min.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dest/css'));
});

//Copy css files
gulp.task('copy-vendor-css',function()
{
    return gulp.src([
        'www/lib/bower_components/angular/angular-csp.css',
        'www/lib/bower_components/font-awesome/css/font-awesome.min.css',
        'www/lib/bower_components/bootstrap/dist/css/bootstrap.min.css',
        'www/lib/css/animate.css',
        'www/lib/bower_components/onsenui/css/onsen-css-components-blue-basic-theme.css',
        'www/lib/bower_components/onsenui/css/onsenui.css',
        'www/lib/bower_components/angular/*.css'
         ]).pipe(concat('vendor.min.css'))
        .pipe(gulp.dest('dest/vendor'));
});

//Minifies all the app code, concatanates and adds to dest folder
gulp.task('minify-js',function()
{
    gulp.src('./www/js/**/*').pipe(concat('app.min.js')).pipe(ngAnnotate()).pipe(uglify()).pipe(gulp.dest('dest/js'));
});

//Minifies all vendor files, could be improved by writing a proper bower.json file for the project
gulp.task('minify-vendor-js',function()
{
    return gulp.src([ 'www/lib/bower_components/angular/angular.js',
        'www/lib/bower_components/jquery/dist/jquery.js',
        'www/lib/bower_components/angular-animate/angular-animate.js',
        'www/lib/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
        'www/lib/bower_components/angular-elastic/elastic.js',
        'www/lib/bower_components/angular-sanitize/angular-sanitize.js',
        'www/lib/bower_components/angular-touch/angular-touch.js',
        'www/lib/bower_components/angular-translate/angular-translate.js',
        'www/lib/bower_components/angular-translate-handler-log/angular-translate-handler-log.js',
        'www/lib/bower_components/angular-translate-loader-partial/angular-translate-loader-partial.js',
        'www/lib/bower_components/angular-translate-loader-url/angular-translate-loader-url.js',
        'www/lib/bower_components/angular-ui-router/release/angular-ui-router.js',
        'www/lib/bower_components/firebase/firebase.js',
        'www/lib/js/cryptojs/aes.js',
        'www/lib/js/cryptojs/mode-cfb-min.js',
        'www/lib/js/cryptojs/sha256.js',
        'www/lib/bower_components/progressbar.js/dist/progressbar.js',
        'www/lib/bower_components/ngCordova/dist/ng-cordova.js',
        'www/lib/bower_components/bootstrap/dist/js/bootstrap.js',
        'www/lib/bower_components/onsenui/js/onsenui.js',
        'www/lib/js/angular-bootstrap/ui-bootstrap-tpls-1.1.2.js',
        'www/lib/js/cryptojs/*.js',
        'www/lib/bower_components/angular-tek-progress-bar/dist/tek.progress-bar.js',
        'www/lib/bower_components/angular-scroll-glue/src/scrollglue.js',
        'www/lib/bower_components/angularfire/dist/angularfire.js',
        'www/lib/bower_components/angular-mocks/angular-mocks.js',
        'www/lib/bower_components/tweetnacl/nacl-fast.min.js',
        'www/lib/bower_components/highcharts/highstock.js',
        'www/lib/bower_components/moment/moment.js',
        'www/lib/bower_components/pdfjs-dist/build/pdf.js',
        'www/lib/bower_components/pdfjs-dist/build/pdf.worker.min.js',
        'www/lib/bower_components/pdfjs-dist/web/pdf_viewer.js',
        'www/lib/js/materialize.min.js'
    ]).pipe(concat('vendor.min.js')).pipe(uglify()).pipe(gulp.dest('dest/vendor'));
});


//Minify html
gulp.task('minify-html', function() {
    return gulp.src('www/views/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dest/views'));
});

//Find out the size of the original folder
gulp.task('size-prebuild', function() {
    var s = size();
    return gulp.src('www/**/*')
        .pipe(s)
        .pipe(notify({
            onLast: true,
            message:function(){ console.log("Total size pre-built: " + s.prettySize);}
        }));
});

//Find out the size of the post build
gulp.task('size-postbuild', function() {
    var s = size();
    return gulp.src('dest/**/*')
        .pipe(s)
        .pipe(notify({
            onLast: true,
            message:function(){ console.log("Total size post-built: " + s.prettySize);}
        }));
});


