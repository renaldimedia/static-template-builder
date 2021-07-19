module.exports = {
	mode: 'jit',
	purge: {
		enabled: true,
		// We want to look at SRC not DIST as some components might not be used yet but could be in a CMS style environment
		content: ['./src/**/*.html', './src/assets/js/**/*.js'],
	},
	darkMode: false, // or 'media' or 'class'
	theme: {
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [
		require('@tailwindcss/forms'),
		require('tailwindcss-elevation')(['responsive', 'hover', 'focus'])
	],
};
