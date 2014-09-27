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
var merge = require('merge-stream');
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
	tmp: './tmp',
	js: {
		'main.js': [
			'./tmp/highlight.min.js',
			'./app/bower_components/snapjs/snap.js',
			'./app/js/app.js'
		],
		'cover.js': [
			'./tmp/TweenLite.min.js',
			'./tmp/EasePack.min.js',
			'./tmp/rAF.js',
			'./app/js/cover.js'
		]
	},
	less: './app/less/main.less',
	downloads: [
		'http://yandex.st/highlightjs/8.0/styles/tomorrow.min.css',
		'http://yandex.st/highlightjs/8.0/highlight.min.js',
		'http://cdnjs.cloudflare.com/ajax/libs/gsap/latest/TweenLite.min.js',
		'http://cdnjs.cloudflare.com/ajax/libs/gsap/latest/easing/EasePack.min.js',
		'https://gist.githubusercontent.com/paulirish/1579671/raw/3d42a3a76ed09890434a07be2212f376959e616f/rAF.js'
	]
};

gulp.task('clean', function() {
	return gulp.src([paths.dist, paths.tmp], {read: false})
		.pipe(clean());
});

gulp.task('download-assets', ['clean'], function(cb) {
	var complete = [];
	fs.mkdirSync(paths.tmp);
	for (var i = 0; i < paths.downloads.length; i++) {
		var asset = paths.downloads[i];
		var dest = paths.tmp + "/" + asset.split('/').pop();
		request(asset).pipe(fs.createWriteStream(dest)).on('finish', function() {
			complete.push(1);
			if (complete.length === paths.downloads.length) {
				cb();
			}
		});
	}
});

gulp.task('copy-assets', function() {
	return gulp.src(paths.assets, {base: paths.app})
		.pipe(gulp.dest(paths.dist));
});

gulp.task('compile-js', function() {
	var streams = [];
	for (var k in paths.js) {
		if (paths.js.hasOwnProperty(k)) {
			streams.push(gulp.src(paths.js[k])
				.pipe(concat(k))
				.pipe(uglify())
				.pipe(gulp.dest(paths.dist + "/js")));
		}
	}
	return merge(streams);
});

gulp.task('compile-css', function() {
	var lessStream = gulp.src(paths.less)
		.pipe(less())
		.pipe(minifycss())
		.pipe(gulp.dest(paths.dist + "/css"));
	var tomorrowStream = gulp.src(paths.tmp + "/tomorrow.min.css", {base: paths.tmp})
		.pipe(gulp.dest(paths.dist + "/css"));
	return merge(lessStream, tomorrowStream);
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

gulp.task('default', ['download-assets'], function() {
	gulp.start('copy-assets', 'compile-js', 'compile-css', 'generate-book');
});
