//////////////////////////////////////////////////////////////////////
// Handlebars                                                       //
//////////////////////////////////////////////////////////////////////

// Setup
var gulp = require('gulp');
var fs = require('fs');
var Handlebars = require('handlebars');
var handlebars = require('gulp-compile-handlebars');
var ltx = require('ltx');
var resolve = require('resolve');
var jsonminify = require('gulp-jsonminify');
var config = require('../build/build.config.js');

/**
 * @param  {String} `icon` The path to the SVG file to inline
 * @param  {Object} `options`
 * @return {String}
 */

const nameToModule = {};
const cache = {};
function parse (xml) {
    const svg = ltx.parse(xml);
    if (svg.name !== 'svg') {
        throw new TypeError('{{icon}} helper: File specified must be an SVG');
    }
    //delete svg.attrs.xmlns;
    //delete svg.attrs['xmlns:xlink'];
    return svg;
}
const helpers = {
	icon(icon, options = {}){
		var icon = config.iconPath + icon + '.svg';
		if (typeof icon !== 'string') {
			throw new Error('{{icon}} helper: invalid path. Path must be formatted as a string.');
		}
		let modulePath;
		try {
			modulePath = nameToModule[icon] || (nameToModule[icon] = resolve.sync(icon, {
				extensions: ['.svg']
			}));
		} catch (err) {
			throw new Error(`{{icon}} helper: . ${err}`);
		}
		const content = cache[icon] || (cache[icon] = fs.readFileSync(modulePath, 'utf-8'));
		const svg = parse(content);
		Object.assign(svg.attrs, options.hash);
		return new Handlebars.SafeString(svg.root());
	},
	iconBackground(icon, options = {}){
		var icon = config.iconPath + icon + '.svg';
		if (typeof icon !== 'string') {
			throw new Error('{{icon}} helper: invalid path. Path must be formatted as a string.');
		}
		let modulePath;
		try {
			modulePath = nameToModule[icon] || (nameToModule[icon] = resolve.sync(icon, {
				extensions: ['.svg']
			}));
		} catch (err) {
			throw new Error(`{{icon}} helper: . ${err}`);
		}
		const content = cache[icon] || (cache[icon] = fs.readFileSync(modulePath, 'utf-8'));
		const svg = parse(content);
		Object.assign(svg.attrs, options.hash);
		const svgencoded = Buffer.from(String(svg)).toString('base64');
		const output = "<div class='icon icon-background " + options.hash.class + "' style='background-image: url(data:image/svg+xml;base64," + svgencoded + ")'></div>";
		return new Handlebars.SafeString(output);
	}
}

// We have the ability to insert an icon and it compile to inline SVG using:
// {{icon
// 	"activity.svg"
// 	class="icon icon-128 icon-primary" width="24"
// 	height="24"
// 	fill="black"
// 	stroke="red"
// 	stroke-width="4"
// 	stroke-linecap="round"
// 	stroke-linejoin="round"
// }}

var hbOptions = {
	ignorePartials: true,
	batch: [config.base + config.partials],
	helpers: helpers
};
var hbOptionsDist = {
	ignorePartials: true,
	batch: [config.dist + config.partials],
	helpers: helpers
};

// Tasks
gulp.task('minifyjson', function() {
	return gulp
		.src(['./variables.js'])
		.pipe(jsonminify())
		.pipe(gulp.dest('json'));
});

//// Inject Handlebar varibles for development
gulp.task('inject:dev', ['minifyjson'], function(cb) {
	return gulp
		.src(config.html)
		.pipe(
			handlebars(
				JSON.parse(fs.readFileSync('./json/variables.js')),
				hbOptions
			)
		)
		.pipe(gulp.dest(config.dev));
});

//// Inject Handlebar varibles for production
gulp.task('inject:dist', ['minifyjson'], function(cb) {
	return gulp
		.src(config.dist + '/**/*.html')
		.pipe(
			handlebars(
				JSON.parse(fs.readFileSync('./json/variables.js')),
				hbOptionsDist
			)
		)
		.pipe(gulp.dest(config.dist));
});
