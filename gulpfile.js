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
	stylelint  = require( 'gulp-stylelint' ),
	puglint    = require( 'gulp-pug-linter' ),
	eslint     = require( 'gulp-eslint' ),
	lintConfig = require( './package.json' );

function styleLintFormatter ( report ) {
	report.forEach( function( file ) {
		file.warnings.forEach( function( warning ) {
			console.log( gutil.colors.red( '⨂' ), warning.text.replace( /\s*\(.*\)/, '' ), gutil.colors.gray( `[${warning.rule}]` ) );
			console.log( `${file.source}:${warning.line}:${warning.column}\n` );
		});
	});
}

function pugLintForamtter ( errors ) {
	errors.forEach( function ( error ) {
		let tmp = error.toJSON();
		console.log( gutil.colors.red( '⨂' ), tmp.msg, gutil.colors.gray( `[${tmp.code}]` ) );
		console.log( `${tmp.filename}:${tmp.line}:${tmp.column}\n` );
	});
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

	console.log( 'errors:', gutil.colors.red( report.errorCount ) );
	console.log( 'warnings:', gutil.colors.yellow( report.warningCount ) );
}

function lintCss () {
	return gulp.src( 'dev/css/**/*.css' )
		.pipe( stylelint({
			config: lintConfig.cssLintConfig,
			failAfterError: false,
			reporters: [{ formatter: styleLintFormatter }]
		}));
}

function lintScss () {
	return gulp.src( 'dev/scss/**/*.scss' )
	.pipe( stylelint({
		config: lintConfig.scssLintConfig,
		failAfterError: false,
		reporters: [{ formatter: styleLintFormatter }]
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

lintCss.displayName = 'Lint CSS';
lintScss.displayName = 'Lint SCSS';
lintPug.displayName = 'Lint PUG';
lintJs.displayName = 'Lint JS';

gulp.task( 'Lint Code', gulp.series( lintJs, lintScss, lintCss, lintPug ) );
