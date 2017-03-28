const gulp = require('gulp');
const babel = require('gulp-babel');
const browserify = require('browserify');
const rename = require('gulp-rename');
const source = require("vinyl-source-stream");

function reactCompile(filename, opts) {
  return browserify(filename, opts)
      .transform("babelify", {presets: ["es2015", "react"]})
      .bundle();
}

gulp.task('js', function() {
  process.env.NODE_ENV = "production";
  return reactCompile("./src/js/index.js",
      {standalone: "WP"}
    ).pipe(source("index.js"))
    .pipe(gulp.dest("./js"));
})
