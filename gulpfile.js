var gulp        = require('gulp');
var path        = require('path');
var util        = require('gulp-util');
var sass        = require('gulp-sass');
var order       = require("gulp-order");
var rename      = require("gulp-rename");
var uglify      = require('gulp-uglify');
var closureCompiler = require('google-closure-compiler').gulp();
var concat      = require('gulp-concat');
var include     = require('gulp-include');
var minifycss   = require('gulp-clean-css');
var prefix      = require('gulp-autoprefixer');

var config = {
    production: !!util.env.production
};

var compilerOptions = {
  compilation_level: 'ADVANCED',
  warning_level: 'QUIET',
  externs: [
      './src/js/externs/jquery.js',
      './src/js/externs/socket.io.js'
  ],
  language_in: 'ECMASCRIPT5',
  language_out: 'ECMASCRIPT5',
  output_wrapper: '(function(){\n%output%\n}).call(this)',
  process_common_js_modules: true
};

function swallowError (error) {
  console.log(error.toString())
  this.emit('end')
}


gulp.task('sass', function() {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass())
        // .pipe(concat('main.css'))
        .pipe(prefix({
            browsers: ['> 2%'],
            cascade: false
        }))
        .pipe(config.production ? minifycss() : util.noop())
        .on('error', swallowError)
        .pipe(gulp.dest('static/css'));
});


gulp.task('js:desktop', function() {
    return gulp.src('src/js/Desktop.js')
      .pipe(include())
      .on('error', swallowError)
      .pipe(closureCompiler(compilerOptions))
      .on('error', swallowError)
      .pipe(rename('Desktop.js'))
      .pipe(gulp.dest('static/js'));
});

gulp.task('js:mobile', function() {
    return gulp.src('src/js/Mobile.js')
      .pipe(include())
      .on('error', swallowError)
      // .pipe(closureCompiler(compilerOptions))
      .on('error', swallowError)
      .pipe(rename('Mobile.js'))
      .pipe(gulp.dest('static/js'));
});

gulp.task('js:vendor', function() {
    return gulp.src('src/js/vendor/*.js')
      .pipe(gulp.dest('static/js/vendor'));
});

gulp.task('fonts', function() {
    return gulp.src(['src/fonts/**/*'])
        .pipe(gulp.dest('static/fonts'));
})


gulp.task('images', function() {
    return gulp.src(['src/images/**/*'])
        .pipe(gulp.dest('static/images'));
})

gulp.task('watch', function() {
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/js/**/*.js', ['js:desktop','js:mobile']);
    gulp.watch('src/fonts/**/*', ['fonts']);
    gulp.watch('src/images/**/*', ['images']);
});


gulp.task('dev', ['sass', 'watch', 'js:desktop', 'js:mobile', 'js:vendor', 'fonts', 'images']);
gulp.task('prod', ['sass', 'js:desktop', 'js:mobile', 'js:vendor', 'fonts']);