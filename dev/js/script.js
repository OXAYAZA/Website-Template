'use strict';

// Global variables
var plugins = {
	pageLoader: document.querySelector( '.page-loader' ),
	copyrightYear: document.querySelectorAll( '.copyright-year' ),
};


// Initialize scripts that require a loaded window
window.addEventListener( 'load', function () {
	// Page loader transition
	if ( plugins.pageLoader ) {
		plugins.pageLoader.classList.add( 'loaded' );
	}
});


// Initialize scripts that require a finished document
document.addEventListener( 'DOMContentLoaded', function () {
	// Copyright Year (Evaluates correct copyright year)
	if ( plugins.copyrightYear ) {
		plugins.copyrightYear.forEach( function ( item ) {
			item.innerText = ( new Date() ).getFullYear();
		});
	}
});
