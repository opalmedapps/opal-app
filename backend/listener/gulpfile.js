var gulp = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');

gulp.task('test', function() {
    return gulp.src(['test/testUtility.js'], {
            read: false
        })
        .pipe(mocha({
            reporter: 'list'
        }))
        .on('error', gutil.log);
});
gulp.task('lint', function() {
    return gulp.src(['./*.js', './test/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch-lint', function() {
    gulp.watch(['lib/**', '*.js', 'test/**'], ['lint']);
});

gulp.task('default', ['mocha'], function(done) {
    // place code for your default task here
    console.log(done);
    gulp.watch(['*.js', 'test/*.js'], ['mocha','lint']);
});
