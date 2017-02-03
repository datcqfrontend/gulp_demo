var gulp = require('gulp');
var gulputil = require('gulp-util');

// Tidy html
var htmltidy = require('gulp-htmltidy'); 

//Lint css
var autoprefixer = require('gulp-autoprefixer');
var csslint = require('gulp-csslint');
var cleancss = require('gulp-clean-css');

//JS hint
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var image = require('gulp-image');
var rename = require('gulp-rename');
var header = require('gulp-header');

var chmod = require('gulp-chmod');
var clean = require('gulp-clean');
var change = require('gulp-change');
var gulpif = require('gulp-if');
var deleteLines = require('gulp-delete-lines');
var removeHtml = require('gulp-remove-html');

var sourcemaps = require('gulp-sourcemaps');

function changeParams(content) {
    return content
        .replace(/<!--<CSS>-->/g, '<link rel="stylesheet" href="css/combined.min.css">')
        .replace(/<!--<JS>-->/g, '<script src="js/combined.min.js"></script>');
}

gulp.task('default',[
    'html','image','build-css','build-js'

    //'watch'
]);

gulp.task('html', function() {
    gulputil.log('---Html tidy');
    return gulp.src('src/index.html')
        .pipe(htmltidy())
        /*.pipe(deleteLines({
            'filters': [
                /<link\s+rel=["']stylesheet["']\s+href=/i
            ]
        }))*/    
        .pipe(removeHtml())
        .pipe(change(changeParams))
        .pipe(gulp.dest('build'));
})

gulp.task('image', function () {
  gulp.src('src/img/*')
    .pipe(image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      jpegRecompress: false,
      jpegoptim: true,
      mozjpeg: true,
      gifsicle: true,
      svgo: true,
      concurrent: 10
    }))
    .pipe(gulp.dest('build/img'));
});

gulp.task('build-css',function() {
    gulputil.log('---Build css')
    return gulp.src([
            'src/css/style.css',
            'src/css/content.css'
        ])
        .pipe(csslint())
        .pipe(csslint.formatter('compact'))
        .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(concat('combined.min.css'))
        
        .pipe(gulpif(gulputil.env.type==="production", cleancss({compatibility: 'ie8'})))
        
        .pipe(gulp.dest('build/css'));

});

gulp.task('build-js', function() {
    gulputil.log('---Build js');

    return gulp.src([
            'src/js/main.js',
            'src/js/second.js',
            'src/js/third.js',
        ])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        //.pipe(jshint.reporter('jshint-stylish'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('combined.min.js'))
        
        .pipe(gulpif(gulputil.env.type==="production", uglify()))
     
        .pipe(gulp.dest('build/js')) 
});

gulp.task('clean', function() {
    gulputil.log('---Clean tmp files');

    gulp.src('tmp', {read: false})
        .pipe(clean());
});

gulp.task('watch', function(){
  if(gulputil.env.type==="production"){
      gulp.watch('src/*.html', ['html']);
      gulp.watch('src/**/*.css', ['css']);
      gulp.watch('src/**/*.js', ['jshint']);
  }
    
});