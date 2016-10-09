var gulp        = require('gulp');
var util        = require('gulp-util');
var sass        = require('gulp-sass') ;
var order       = require("gulp-order");
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var minifycss   = require('gulp-clean-css');
var prefix      = require('gulp-autoprefixer');

var config = {
    production: !!util.env.production
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


gulp.task('js', function() {
    return gulp.src('src/js/**/*.js')
        .pipe(config.production ? uglify() : util.noop())
        // .pipe(concat('main.js'))
        .on('error', swallowError)
        .pipe(gulp.dest('static/js'));
});


gulp.task('fonts', function() {
    return gulp.src(['src/fonts/**/*'])
        .pipe(gulp.dest('static/fonts'));
})


gulp.task('watch', function() {
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/fonts/**/*', ['fonts']);
});


gulp.task('dev', ['sass', 'watch', 'js', 'fonts']);
gulp.task('prod', ['sass', 'js', 'fonts']);