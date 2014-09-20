var gulp       = require('gulp');
var clean      = require('gulp-clean');
var concat     = require('gulp-concat');
var less       = require('gulp-less');
var markdown   = require('gulp-markdown');
var minifycss  = require('gulp-minify-css');
var uglify     = require('gulp-uglify');

var fs = require('fs');
var request = require('request');

var paths = {
	assets: [
		'./app/img/**/*.*',
		'./app/.nojekyll',
		'./app/index.html'
	],
	app: './app',
	dist: './dist',
	js: ['./app/bower_components/snapjs/snap.js', './app/js/app.js'],
	less: './app/less/main.less'
};

gulp.task('clean', function() {
	return gulp.src(paths.dist, {read: false})
		.pipe(clean());
});

gulp.task('copy-assets', function() {
	return gulp.src(paths.assets, {base: paths.app})
		.pipe(gulp.dest(paths.dist));
});

gulp.task('compile-js', function() {
	return gulp.src(paths.js)
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest(paths.dist + "/js"));
});

gulp.task('compile-css', function() {
	return gulp.src(paths.less)
		.pipe(less())
		.pipe(minifycss())
		.pipe(gulp.dest(paths.dist + "/css"));
});

gulp.task('convert', function() {
	/*
	return gulp.src(paths.app + "/posts/*.md")
		.pipe(markdown({
			gfm: true,
			highlight: function(code) {
				return require('highlight.js').highlightAuto(code).value;
			}
		}))
		.pipe(gulp.dest(paths.dist + "/posts"))
	*/
});

gulp.task('download-highlight', ['copy-assets'], function() {
	request('http://yandex.st/highlightjs/8.0/styles/tomorrow.min.css')
		.pipe(fs.createWriteStream(paths.dist + "/css/tomorrow.min.css"));
	request('http://yandex.st/highlightjs/8.0/highlight.min.js')
		.pipe(fs.createWriteStream(paths.dist + "/js/highlight.min.js"));
});

gulp.task('default', ['clean'], function() {
	gulp.start('copy-assets', 'compile-js', 'compile-css', 'convert', 'download-highlight');
});
