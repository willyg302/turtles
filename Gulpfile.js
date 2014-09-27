var gulp       = require('gulp');
var clean      = require('gulp-clean');
var handlebars = require('gulp-compile-handlebars');
var concat     = require('gulp-concat');
var foreach    = require('gulp-foreach');
var less       = require('gulp-less');
var markdown   = require('gulp-markdown');
var minifycss  = require('gulp-minify-css');
var rename     = require('gulp-rename');
var replace    = require('gulp-replace');
var uglify     = require('gulp-uglify');

var fs = require('fs');
var request = require('request');

var chapters = [
	{
		url: 'index.html',
		name: 'Cover'
	},
	{
		url: '01-what-is-data.html',
		name: '1: What is Data?'
	},
	{
		url: '02-the-smart-conjecture.html',
		name: '2: The SMART Conjecture'
	},
	{
		url: '03-the-everywhere-problem.html',
		name: '3: The Everywhere Problem'
	}
];

var paths = {
	assets: [
		'./app/img/**/*.*',
		'./app/.nojekyll'
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

var replaceSmart = function(s) {
	return '<span class="' + s.toLowerCase() + '">' + s + '</span>';
};

gulp.task('convert', function() {
	return gulp.src(paths.app + "/chapters/*.md")
		.pipe(replace(/(stream|maintain|analyze|represent|transform)/gi, replaceSmart))
		.pipe(markdown({
			gfm: true,
			smartypants: true,
			highlight: function(code) {
				return require('highlight.js').highlightAuto(code).value;
			}
		}))
		.pipe(gulp.dest(paths.dist));
});

gulp.task('download-highlight', ['copy-assets'], function() {
	request('http://yandex.st/highlightjs/8.0/styles/tomorrow.min.css')
		.pipe(fs.createWriteStream(paths.dist + "/css/tomorrow.min.css"));
	request('http://yandex.st/highlightjs/8.0/highlight.min.js')
		.pipe(fs.createWriteStream(paths.dist + "/js/highlight.min.js"));
});

var getChapter = function(url, offset) {
	for (var i = 0; i < chapters.length; i++) {
		if (chapters[i].url === url) {
			var index = i + offset;
			if (index >= 0 && index < chapters.length) {
				return chapters[index];
			}
			break;
		}
	}
	return null;
};

gulp.task('generate-book', ['convert'], function() {
	return gulp.src(paths.dist + "/*.html")
		.pipe(foreach(function(stream, file) {
			var templateData = {
				cover: file.relative.indexOf('index') !== -1,
				shim: file.contents.toString(),
				chapters: chapters,
				previous: getChapter(file.relative, -1),
				next: getChapter(file.relative, 1)
			};
			var options = {
				batch: [paths.app + "/partials"],
				helpers: {}
			};
			return gulp.src(paths.app + "/partials/base.hbs")
				.pipe(handlebars(templateData, options))
				.pipe(rename(file.relative));
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['clean'], function() {
	gulp.start('copy-assets', 'compile-js', 'compile-css', 'convert', 'download-highlight', 'generate-book');
});
