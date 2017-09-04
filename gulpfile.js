const gulp = require('gulp');
const babel = require('gulp-babel');
const browserify = require('browserify');
const connect = require('gulp-connect');
const rename = require('gulp-rename');
const source = require("vinyl-source-stream");

function reactCompile(filename, opts) {
  return browserify(filename, opts)
      .transform("babelify", {presets: ["es2015", "react"]})
      .bundle();
}

gulp.task('build', function() {
  process.env.NODE_ENV = "production";
  return reactCompile("./src/js/index.js",
      {standalone: "WP"}
    ).pipe(source("index.js"))
    .pipe(gulp.dest("./js"));
})

gulp.task('js', function() {
  return reactCompile("./src/js/index.js",
      {standalone: "WP"}
    ).pipe(source("index.js"))
    .pipe(gulp.dest("./js"))
    .pipe(connect.reload());
})

gulp.task('css', function() {
  return gulp.src('css/*.css')
    .pipe(connect.reload());
})

gulp.task('connect', function() {
  connect.server({
    root: '.',
    livereload: true,
    port: 3656
  })
})

gulp.task('watch', function() {
  gulp.watch(['./src/**/*.js'], ['js']);
  gulp.watch(['./css/**/*.css'], ['css']);
})

gulp.task('default', ['js', 'connect', 'watch'])

