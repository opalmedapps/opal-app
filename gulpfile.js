var gulp = require('gulp');
var jshint = require('gulp-jshint');
//var karma = require('gulp-karma');
gulp.task('lint', function() {
    return gulp.src(['www/js/**/*.js', './test/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch-lint', function() {
    gulp.watch(['www/**/*'], ['lint']);
});


// gulp.task('test', function() {
//   // Be sure to return the stream
//   // NOTE: Using the fake './foobar' so as to run the files
//   // listed in karma.conf.js INSTEAD of what was passed to
//   // gulp.src !
// return gulp.src('./foobar')
//     .pipe(karma({
//     configFile: 'karma.conf.js',
//     action: 'run'
//     }))
//     .on('error', function(err) {
//     // Make sure failed tests cause gulp to exit non-zero
//     console.log(err);
//     this.emit('end'); //instead of erroring the stream, end it
//     });
// });

gulp.task('autotest', function() {
return gulp.watch(['www/js/**/*.js', 'test/spec/*.js'], ['test']);
});
//Task listens changes in www folder and when it happens copies file contents to cordova folder
gulp.task('copyToCordovaFolder',function()
{
    gulp.src('./www/**/*').pipe(gulp.dest('/Users/davidherrera/Documents/Projects/muhc/www'));
});


gulp.task('watch',function()
{
    gulp.watch(['www/**/*'],['copyToCordovaFolder']);
});
gulp.task('default',['watch']);