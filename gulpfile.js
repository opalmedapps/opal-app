/**
 * Author:David Herrera, August 2016
 * Github: dherre3
 * E-mail: davidfherrerar@gmail.com
 *
 */

var gulp = require('gulp');
var jshint = require('gulp-jshint');
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
gulp.task('build',['minify-js','minify-css','minify-vendor-js','minify-html','minify-images','copy-non-minifiable-content','copy-vendor-css','size-prebuild','size-postbuild']);

//Minifying images task
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
        'www/lib/bower_components/onsenui/build/js/onsenui.js',
        'www/lib/js/angular-bootstrap/ui-bootstrap-tpls-1.1.2.js',
        'www/lib/js/cryptojs/*.js',
        'www/lib/bower_components/angular-tek-progress-bar/dist/tek.progress-bar.js',
        'www/lib/js/scrollglue/scrollglue.js',
        'www/lib/bower_components/angularfire/dist/angularfire.js',
        'www/lib/bower_components/angular-mocks/angular-mocks.js',
        'www/lib/bower_components/tweetnacl/nacl-fast.min.js',
        'www/lib/bower_components/highcharts/highstock.js',
        'www/lib/bower_components/moment/moment.js',
        'www/lib/bower_components/pdfjs-dist/build/pdf.js',
        'www/lib/bower_components/pdfjs-dist/build/pdf.worker.min.js',
        'www/lib/bower_components/pdfjs-dist/web/pdf_viewer.js'
    ]).pipe(concat('vendorjs.min.js')).pipe(uglify()).pipe(gulp.dest('dest/lib'));
});

//Copy css files
gulp.task('copy-vendor-css',function()
{
    return gulp.src(['www/lib/bower_components/angular/*.css','www/lib/bower_components/font-awesome/css/**/*','www/lib/bower_components/bootstrap/dist/css/*', 'www/lib/js/onsenui/css/**/*'],{base:'www'}).pipe(gulp.dest(cordovaFolderPath));
});

//Minify html
gulp.task('minify-html', function() {
    return gulp.src('www/views/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(cordovaFolderPath+'/views'));
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
    return gulp.src(cordovaFolderPath+'/**/*')
        .pipe(s)
        .pipe(notify({
            onLast: true,
            message:function(){ console.log("Total size post-built: " + s.prettySize);}
        }));
});

/**
 * OPAL TEMPLATES 
 */


//TASKS FOR TEMPLATES

var inject = require('gulp-inject');
var replace = require('gulp-replace');
var gulpif = require('gulp-if');
var rename = require("gulp-rename");
var mainTabsUrls = {
    "personal":'./www/views/personal/personal.html',
    "general":'./www/views/general/general.html'
};
var fs = require('fs');
var templateJson = JSON.parse(fs.readFileSync('./templates/patterns.json'));
//Templates for opal
gulp.task('opal', function(){
    var argv = require('yargs').usage('Usage: $0 -t [string] -n [string] -v [string]')
    .option('v',{
        alias:'view',
        choices:['personal','general']
    })
    .option('n',{
        alias:'name'
    })
    .option('t',{
        alias:'template',
        choices:['module']
    })
    .demandOption(['t','n','v'])
    .argv;
    var template =templateJson[argv.t];
    var view =mainTabsUrls[argv.v];
    var name = argv.n.toLowerCase();
    var upName = name.charAt(0).toUpperCase() + name.slice(1);
    gulpif(template.includeController,gulp.src('./templates/'+argv.t+'/'+argv.t+'Controller.js')
    .pipe(replace("<controller-name>", upName+'Controller'))
    .pipe(rename(name+'Controller.js'))
    .pipe(gulp.dest("./www/js/controllers/",{overwrite:'false'})));

     gulpif(template.includeService,gulp.src('./templates/'+argv.t+'/'+argv.t+'Service.js')
    .pipe(replace("<service-name>", upName))
    .pipe(rename(name+'Service.js'))
    .pipe(gulp.dest("./www/js/services",{overwrite:'false'})));

    gulpif(template.includeView,gulp.src('./templates/'+argv.t+'/'+argv.t+'.html')
    .pipe(replace("<controller-name>",  upName+'Controller'))
    .pipe(replace("<view-name>", upName))
    .pipe(rename(name+'.html'))
    .pipe(gulp.dest("./www/views/"+argv.v+"/"+name,{overwrite:'false'})));
    
    gulpif(template.includeController,
    gulp.src('./www/index.html')
    .pipe(inject(gulp.src('./www/js/controllers/'+name+'Controller.js',{read: false}), {
    starttag: '<!-- inject:controller:{{ext}} -->'
    , relative: true}))
    .pipe(gulp.dest('./www')))

    gulpif(template.includeService,
    gulp.src('./www/index.html')
    .pipe(inject(gulp.src('./www/js/services/'+name+'Service.js',{read: false}), {
    starttag: '<!-- inject:service:{{ext}} -->'
    , relative: true}))
    .pipe(gulp.dest('./www/')))

    gulpif(template.addTab,
    gulp.src("./www/views/"+argv.v+"/"+argv.v+".html")
    .pipe(inject(gulp.src(["./www/views/"+argv.v+"/"+name+"/"+name+".html"],{read: false}), {
     starttag: '<!-- inject:tab-->',
     transform:function()
    {
        var str = "<ons-list-item modifier=\"chevron\" class=\"item\" ng-click=\""+argv.v+ "Navigator.pushPage('./views/"+argv.v+"/"+name+"/"+name+".html')\">"+
                      `<ons-row align=\"center\">
                      <ons-col width=\"60px\" align=\"center\">
                            <div>
                                <i class=\"fa fa-question-circle iconHomeView\" style=\"color:DarkSlateGray\"></i><span class=\"notification\" ng-show=\"questionnairesUnreadNumber>0\">{{questionnairesUnreadNumber}}</span>
                            </div>
                        </ons-col>
                        <ons-col>
                            <header>
                                <span class=\"item-title\" ng-class=\"fontSizeTitle\">`+name+`</span>
                            </header>
                            <p class=\"item-desc\" ng-class=\"fontSizeDesc\"></p>
                        </ons-col>
                    </ons-row>
                    </ons-list-item>`;

            return str;
    }}))
    .pipe(gulp.dest("./www/views/"+argv.v)));

    
});

gulp.task('create',function()
{
    var argv = require('yargs').usage('Usage: $0  -n [string] -v [path-relative-www] -c -s -f -d')
    .option('v',{
        alias: 'view',
        default: null,
        describe: 'Provide path for view',
        type: 'string'
    })
    .option('n',{
        alias:'name',
        default: null,
        describe: 'Provide a name to give all the created elements',
        type: 'string'
    })
    .option('c',{
        alias:'controller',
        default: null,
        describe: 'Flag use to create a controller with name given by -n flag',
        type: 'Boolean'
    })
    .option('s',{
        alias:'service',
        default: null,
        describe: 'Flag use to create a service with name given by -n flag',
        type: 'Boolean'
    })
    .option('f',{
        alias:'filter',
        default: null,
        describe: 'Flag use to create a filter with name given by -n flag',
        type: 'Boolean'
    })
    .option('d',{
        alias:'directive',
        default: null,
        describe: 'Flag use to create a directive with name given by -n flag',
        type: 'Boolean'
    })
    .demandOption(['n']).argv;
});