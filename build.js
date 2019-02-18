// TODO собирать подобно ТМ

module.exports = function( data ) {
	if ( !data ) data = {};

	const
		util   = require( 'tempaw-functions' ).util,
		action = require( 'tempaw-functions' ).action,
		preset = require( 'tempaw-functions' ).preset;

	data.execute = util.genBuildTask( function () {
		let ruleSet = [];

		// Генерация Table of contents
		ruleSet = ruleSet.concat([
			action.genTOC({ css: 'dev/css/style.css', scss: 'dev/scss/custom-styles/style.scss' })
		]);

		// Очистка дистрибутива
		if( data.clean ) {
			ruleSet = ruleSet.concat([
				action.clean({ src:`dist/!(.)*` })
			]);
		}

		// LiveDemo
		if( data.livedemo ) {
			ruleSet = ruleSet.concat([
				preset.buildLiveDemo({
					src: 'dev',
					dest: 'dist/livedemo',
					minifyimg: data.minifyimg,
					delPresets: data.delPresets
				})
			]);
		}

		// Theme Forest
		if( data.userPackage ) {
			ruleSet = ruleSet.concat([
				preset.buildUserPackage({
					src: 'dev',
					dest: 'dist/user-package/site',
					placeholder: data.placeholder,
					minifyimg: data.minifyimg,
					delPresets: data.delPresets
				}),
				action.copy({ src: `sources/documentation/*.*`,              dest: `dist/user-package/documentation/` }),
				action.copy({ src: `sources/documentation/!(scss|pug)/**/*`, dest: `dist/user-package/documentation/` })
			]);
		}

		if( ruleSet.length === 0 ) throw Error( 'At least something must be build!' );
		return ruleSet;
	}());

	return data;
};
