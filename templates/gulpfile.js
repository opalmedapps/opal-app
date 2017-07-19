//TASKS FOR TEMPLATES
var argv = require('yargs').usage('Usage: $0 -t [string] -n [string] -v [string]')
    .option('v',{
        alias:'view',
        choices:['personal','general','education']
    })
    .option('n',{
        alias:'name'
    })
    .option('t',{
        alias:'template',
        choices:['module']
    })
    .demandOption(['t','n'])
    .argv;
var inject = require('gulp-inject');
var replace = require('gulp-replace');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var rename = require("gulp-rename");
var mainTabsUrls = {
    "personal":'./www/views/personal/personal.html',
    "general":'./www/views/general/general.html',
    "education":'./www/views/education/education.html'
};
var fs = require('fs');
var templateJson = JSON.parse(fs.readFileSync('./templates/patterns.json'));
//Templates for opal
gulp.task('default', function(){
    var template =templateJson[argv.t];
    var view =mainTabsUrls[argv.v];
    var name = argv.n.toLowerCase();
    var upName = name.charAt(0).toUpperCase() + name.slice(1);
    gulpif(template.includeController,gulp.src('./'+argv.t+'/'+argv.t+'Controller.js')
    .pipe(replace("<controller-name>", upName+'Controller'))
    .pipe(rename(name+'Controller.js'))
    .pipe(gulp.dest("./www/js/controllers/",{overwrite:'false'})));

     gulpif(template.includeService,gulp.src('./'+argv.t+'/'+argv.t+'Service.js')
    .pipe(replace("<service-name>", upName))
    .pipe(rename(name+'Service.js'))
    .pipe(gulp.dest("./www/js/services",{overwrite:'false'})));

    gulpif(template.includeView,gulp.src('./'+argv.t+'/'+argv.t+'.html')
    .pipe(replace("<view-name>", upName))
    .pipe(rename(name+'.html'))
    .pipe(gulp.dest("./www/views/"+argv.v+"/"+name,{overwrite:'false'})));
    
    gulpif(template.includeController,
    gulp.src('./www/index.html')
    .pipe(inject(gulp.src('./www/js/controllers/'+name+'Controller.js',{read: false}), {
    starttag: '<!-- inject:controller:{{ext}} -->'
    , relative: true,addPrefix:'./js/controllers'}))
    .pipe(gulp.dest('./www/')))

    gulpif(template.includeService,
    gulp.src('./www/index.html')
    .pipe(inject(gulp.src('./www/js/services/'+name+'Service.js',{read: false}), {
    starttag: '<!-- inject:service:{{ext}} -->'
    , relative: true,addPrefix:'./js/services'}))
    .pipe(gulp.dest('./www/')))
    
    gulpif(template.addTab,
    gulp.src("./www/views/"+argv.v+"/"+argv.v+".html")
    .pipe(inject(gulp.src(['./www/index.html'],{read: false}), {
     starttag: '<!-- inject:tab-->',
     transform:function()
    {
        var str = "<ons-list-item ng-click=\""+view+ "Navigator.push('./views/"+view+"/"+name+"/"+name+".html\">"+name+"</ons-list-item>";
        return str;
    }}))
    .pipe(gulp.dest("./www/views/"+argv.v+"/")));

    
});

