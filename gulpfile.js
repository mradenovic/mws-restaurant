/* eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
// var babel = require('gulp-babel');
// var babelify = require('babelify');
// var browserify = require("browserify");
// var connect = require("gulp-connect");
// var source = require("vinyl-source-stream");
// var buffer = require("vinyl-buffer");
// var uglify = require("gulp-uglify");
// var sourcemaps = require("gulp-sourcemaps");

gulp.task('default', ['copy'], function () {
  gulp.watch('src/**/*.*', ['reload']);

  browserSync.init({
    browser: ['google-chrome'],
    server: 'dist',
    port: '8000'
  });
});

gulp.task('lint', function () {
  return gulp.src(['src/js/**/*.js'])
  // eslint() attaches the lint output to the eslint property
  // of the file object so it can be used by other modules.
    .pipe(eslint())
  // eslint.format() outputs the lint results to the console.
  // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format());
  // To have the process exit with an error code (1) on
  // lint error, return the stream and pipe to failOnError last.
  // .pipe(eslint.failOnError());
});

gulp.task('img', () => {
  gulp.src('src/img/**/*.jpg')
    .pipe(gulp.dest('dist/img'));
});

gulp.task('html', () => {
  gulp.src('src/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('sass', () => {
  gulp.src('src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('dist/css'))
});

gulp.task('js', ['lint'], () => {
  gulp.src('src/**/*.js')
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', ['img', 'html', 'sass', 'js']);

gulp.task('reload', ['copy'], function (done) {
  browserSync.reload();
  done();
});
