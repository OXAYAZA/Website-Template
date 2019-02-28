const
	action = require( 'tempaw-functions' ).action,
	build  = require( './build' );

module.exports = {
	livedemo: {
		enable: true,
		server: {
			baseDir: `dev/`,
			directory: false
		},
		port: 8000,
		open: false,
		notify: true,
		reloadDelay: 0,
		ghostMode: {
			clicks: false,
			forms: false,
			scroll: false
		}
	},
	pug: {
		enable: true,
		showTask: false,
		watch: `dev/pug/**/*.pug`,
		source: `dev/pug/pages/!(_)*.pug`,
		dest: `dev/`,
		options: {
			pretty: true,
			verbose: true,
			emitty: true
		}
	},
	sass: {
		enable: true,
		showTask: false,
		watch: `dev/scss/**/*.scss`,
		source: `dev/scss/style.scss`,
		dest: `dev/css/`,
		options: {
			outputStyle: 'expanded',
			indentType: 'tab',
			indentWidth: 1,
			linefeed: 'cr'
		}
	},
	autoprefixer: {
		enable: false,
		options: {
			cascade: true,
			browsers: ['Chrome >= 45', 'Firefox ESR', 'Edge >= 12', 'Explorer >= 10', 'iOS >= 9', 'Safari >= 9', 'Android >= 4.4', 'Opera >= 30']
		}
	},
	watcher: {
		enable: true,
		watch: `dev/js/**/*.js`
	},
	htmlValidate: {
		showTask: true,
		source: `dev/*.html`,
		report: `dev/`
	},
	cache: {
		showTask: false,
	},
	buildRules: {
		'Build': [
			build({
				clean: true,
				livedemo: true,
				userPackage: true,
				minifyimg: true,
				delPresets: false,
				placeholder: {
					exclusions: [
						'_blank',
						'gmap*',
						'logo*',
						'sprite*',
						'warning_bar_0000_us',
						'isotope-loader',
						'mCSB_buttons',
						'preloader',
						'video-play',
						'vimeo-play',
						'youtube-play'
					]
				}
			})
		],
		'Util Backup': [
			action.pack({
				src: [ 'dev/**/*', '*.*', '.gitignore' ], dest: 'versions/',
				name( dateTime ) { return `backup-${dateTime[0]}-${dateTime[1]}.zip`; }
			})
		]
	}
};
