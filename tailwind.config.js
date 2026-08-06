import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						pre: false,
						code: false,
						'pre code': false,
						'code::before': false,
						'code::after': false
					}
				}
			},
			padding: {
				'safe-top': 'max(0px, env(safe-area-inset-top))',
				'safe-bottom': 'max(0px, env(safe-area-inset-bottom))',
				'safe-left': 'max(0px, env(safe-area-inset-left))',
				'safe-right': 'max(0px, env(safe-area-inset-right))'
			},
			transitionProperty: {
				width: 'width'
			}
		}
	},
	plugins: [typography, containerQueries]
};
