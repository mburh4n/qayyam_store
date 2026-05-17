/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				gold: {
					50: '#fdf8e8',
					100: '#faefc4',
					200: '#f5de88',
					300: '#efca4e',
					400: '#e8b928',
					500: '#c8a84c',
					600: '#a8881c',
					700: '#876910',
					800: '#6b5010',
					900: '#533c0d'
				},
				forest: {
					DEFAULT: '#0d2b24',
					light: '#1a4a3e',
					mid: '#0f3329'
				},
				cream: {
					DEFAULT: '#faf7f2',
					dark: '#f0ebe2'
				}
			},
			fontFamily: {
				serif: ['Cormorant Garamond', 'Georgia', 'serif'],
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			letterSpacing: {
				widest2: '0.25em'
			}
		}
	},
	plugins: []
};
