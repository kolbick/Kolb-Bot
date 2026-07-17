/**
 * Kolb-Bot brand configuration.
 *
 * Single source of truth for user-visible product identity on the frontend.
 * Components must consume these values (directly or via `APP_NAME` in
 * `$lib/constants`) instead of hardcoding brand strings, so an upstream sync
 * only has to re-apply this layer. See docs/BRANDING.md and
 * docs/UPSTREAM_SYNC.md.
 *
 * The backend counterpart is `backend/open_webui/brand.py`; keep the two in
 * sync when values change.
 */

export const BRAND = {
	productName: 'Kolb-Bot',
	productShortName: 'Kolb-Bot',
	productSlug: 'kolb-bot',
	primaryDomain: 'kolb-bot.com',

	/** Placeholder until the owner supplies a real support/contact channel. */
	supportUrl: 'https://kolb-bot.com',
	defaultDescription: 'Kolb-Bot is a private, self-hosted AI workspace.',

	logoLight: '/static/logo.png',
	logoDark: '/static/logo.png',
	squareIcon: '/static/favicon.png',
	favicon: '/static/favicon.ico',
	pwaIcons: {
		icon192: '/static/web-app-manifest-192x192.png',
		icon512: '/static/web-app-manifest-512x512.png',
		appleTouchIcon: '/static/apple-touch-icon.png'
	},

	/**
	 * Restrained color system derived from the supplied logo
	 * (branding/original/): flag purple as accent, gold as secondary accent,
	 * neutral light/dark surfaces carried over from upstream so the whole UI
	 * doesn't shift.
	 */
	theme: {
		lightBackground: '#ffffff',
		darkBackground: '#171717',
		accent: '#8f11b1',
		accentContrast: '#ffffff',
		secondaryAccent: '#f0b429'
	},

	terminalDisplayName: 'Kolb Terminal',
	computerDisplayName: 'Kolb Computer'
} as const;

export type Brand = typeof BRAND;
