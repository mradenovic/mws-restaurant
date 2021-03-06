/* eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
let cleanCSS = require('gulp-clean-css');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');

gulp.task('default', ['build'], function () {
  gulp.watch('src/**/*.*', ['build']);

  gulp.src('dist')
    .pipe(webserver());

  // browserSync.init({
  //   browser: ['google-chrome'],
  //   server: 'dist',
  //   port: '8000'
  // });
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
  gulp.src(['src/img/**/*.jpg', 'src/img/**/*.webp', 'src/img/**/*.png'])
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
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('js', ['lint'], () => {
  gulp.src('src/**/*.js', { read: false })
    .pipe(browserify({transform: ['babelify']}))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('manifest', () => {
  gulp.src('src/manifest.json')
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['manifest', 'img', 'html', 'sass', 'js']);

gulp.task('reload', ['build'], function (done) {
  browserSync.reload();
  done();
});

gulp.task('serve', ['build'], function() {
  gulp.src('dist')
    .pipe(webserver());
});