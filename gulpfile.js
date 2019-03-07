const
	gulp         = require( 'gulp' ),
	browserSync  = require( 'browser-sync' ),
	gutil        = require( 'gulp-util' ),
	util         = require( 'tempaw-functions' ).util,
	task         = require( 'tempaw-functions' ).task,
	ROOT         = process.cwd().replace( /\\/g, '/' ),
	configFile   = `${ROOT}/project.config.js`;

util.configLoad( configFile );

// Default task
gulp.task( 'default', function() {
	global.watch = true;

	gulp.watch( configFile, function config( end ) {
		util.configLoad( configFile );
		end();
	});

	if( global.config.livedemo && global.config.livedemo.enable ) browserSync.init( global.config.livedemo );
	else gutil.log( gutil.colors.yellow( 'LiveDemo disabled!' ) );

	if( global.config.watcher && global.config.watcher.enable ) {
		var watcher = gulp.watch( global.config.watcher.watch );

		watcher.on ( 'change', function( path, stats ) {
			browserSync.reload( path );
		});
	}

	if( global.config.sass && global.config.sass.enable ) gulp.watch( [ configFile, global.config.sass.watch ],  task.sass );
	if( global.config.less && global.config.less.enable ) gulp.watch( [ configFile, global.config.less.watch ],  task.less );
	if( global.config.jade && global.config.jade.enable ) gulp.watch( [ configFile, global.config.jade.watch ],  task.jade );
	if( global.config.babel && global.config.babel.enable ) gulp.watch( [ configFile, global.config.babel.watch ], task.babel );
	if( global.config.pug && global.config.pug.enable ) gulp.watch( [ configFile, global.config.pug.watch ],   task.pug ).on('all', ( event, filepath ) => {
		global.emittyChangedFile = filepath;
	});
});

// Show Extra Tasks
if( global.config.cache && global.config.cache.showTask ) gulp.task( task.cache );
if( global.config.sass && global.config.sass.showTask ) gulp.task( task.sass );
if( global.config.less && global.config.less.showTask ) gulp.task( task.less );
if( global.config.pug && global.config.pug.showTask ) gulp.task( task.pug );
if( global.config.jade && global.config.jade.showTask ) gulp.task( task.jade );
if( global.config.htmlValidate && global.config.htmlValidate.showTask ) gulp.task( task.htmlValidate );
if( global.config.jadeToPug && global.config.jadeToPug.showTask ) gulp.task( task.jadeToPug );
if( global.config.lessToScss && global.config.lessToScss.showTask ) gulp.task( task.lessToScss );

// Generating tasks from build rules
if ( global.config.buildRules ) util.genBuildTasks();


// Code Lint
const
	stylelint    = require( 'gulp-stylelint' ),
	puglint      = require( 'gulp-pug-linter' ),
	eslint       = require( 'gulp-eslint' ),
	htmlValidator = require( 'gulp-html-validator' ),
	lintConfig   = require( './package.json' );

global.globalLintReport = {};

function scssLintFormatter ( report ) {
	report.forEach( function( file ) {
		file.warnings.forEach( function( warning ) {
			console.log( gutil.colors.red( '⨂' ), warning.text.replace( /\s*\(.*\)/, '' ), gutil.colors.gray( `[${warning.rule}]` ) );
			console.log( `${file.source}:${warning.line}:${warning.column}\n` );
		});

		if ( !global.globalLintReport.scssErrors ) global.globalLintReport.scssErrors = 0;
		global.globalLintReport.scssErrors += file.warnings.length;
	});
}

function pugLintForamtter ( errors ) {
	errors.forEach( function ( error ) {
		let tmp = error.toJSON();
		console.log( gutil.colors.red( '⨂' ), tmp.msg, gutil.colors.gray( `[${tmp.code}]` ) );
		console.log( `${tmp.filename}${tmp.line?`:${tmp.line}`:''}${tmp.column?`:${tmp.column}`:''}\n` );
	});

	if ( !global.globalLintReport.pugErrors ) global.globalLintReport.pugErrors = 0;
	global.globalLintReport.pugErrors += errors.length;
}

function esLintForamtter ( report ) {
	report.forEach( function( file ) {
		file.messages.forEach( function( message ) {
			switch( message.severity ) {
				case 0:
					console.log( gutil.colors.green( '☑' ), message.message, gutil.colors.gray( `[${message.ruleId}]` ) );
					break;
				case 1:
					console.log( gutil.colors.yellow( '⚠' ), message.message, gutil.colors.gray( `[${message.ruleId}]` ) );
					break;
				case 2:
					console.log( gutil.colors.red( '⨂' ), message.message, gutil.colors.gray( `[${message.ruleId}]` ) );
					break;
			}
			console.log( `${file.filePath}:${message.line}:${message.column}\n` );
		});
	});

	if ( !global.globalLintReport.jsErrors ) global.globalLintReport.jsErrors = 0;
	if ( !global.globalLintReport.jsWarnings ) global.globalLintReport.jsWarnings = 0;

	global.globalLintReport.jsErrors += report.errorCount;
	global.globalLintReport.jsWarnings += report.warningCount;
}

function htmlValidateFormatter ( report ) {
	report.messages.forEach( function ( message ) {
		switch( message.type ) {
			case 'error':
				console.log( gutil.colors.red( '⨂' ), message.message );
				if ( !global.globalLintReport.htmlErrors ) global.globalLintReport.htmlErrors = 0;
				global.globalLintReport.htmlErrors += 1;
				break;
			case 'info':
				console.log( gutil.colors.yellow( '⚠' ), message.message );
				if ( !global.globalLintReport.htmlWarnings ) global.globalLintReport.htmlWarnings = 0;
				global.globalLintReport.htmlWarnings += 1;
				break;
		}

		console.log( `${report.fileName}:${message.lastLine}:${message.firstColumn}\n` );
	});
}

function lintScss () {
	return gulp.src([ 'dev/scss/*.scss', 'dev/scss/!(bootstrap)/**/*.scss' ])
	.pipe( stylelint({
		config: lintConfig.scssLintConfig,
		failAfterError: false,
		reporters: [{ formatter: scssLintFormatter }]
	}));
}

function lintPug () {
	return gulp.src( 'dev/pug/**/*.pug' )
		.pipe( puglint({ reporter: pugLintForamtter }));
}

function lintJs () {
	return gulp.src( 'dev/js/**/!(*.min).js' )
		.pipe( eslint( lintConfig.jsLintConfig ) )
		.pipe( eslint.format( esLintForamtter ) );
}

function validateHtml() {
	return gulp.src( 'dev/**/*.html' )
		.pipe( htmlValidator({ format: 'json' }) )
		.on( 'data', function ( vinyl ) {
			var report = JSON.parse( vinyl['_contents'].toString( 'utf8' ) );
			report.fileName = vinyl.history[ vinyl.history.length - 1 ];
			htmlValidateFormatter( report );
		});
}

function finalReport ( end ) {
	console.log( global.globalLintReport );
	end();
}

lintScss.displayName = 'Lint SCSS';
lintPug.displayName = 'Lint PUG';
lintJs.displayName = 'Lint JS';
validateHtml.displayName = 'Validate HTML';
finalReport.displayName = 'Final lint report';

gulp.task( 'Validate Code', gulp.series( lintJs, lintScss, lintPug, validateHtml, finalReport ) );
