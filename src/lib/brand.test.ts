import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { BRAND, getUserPwaBranding } from './brand';
import { APP_NAME } from './constants';

const FORBIDDEN = [/open[\s_-]?web[\s_-]?ui/i, /tide[\s_-]?bot/i, /changing[\s_-]?tides/i];

const expectClean = (value: string, label: string) => {
	for (const pattern of FORBIDDEN) {
		expect(value, `${label} must not contain ${pattern}`).not.toMatch(pattern);
	}
};

describe('brand configuration', () => {
	it('defines the Kolb-Bot identity', () => {
		expect(BRAND.productName).toBe('Kolb-Bot');
		expect(BRAND.productShortName).toBe('Kolb-Bot');
		expect(BRAND.productSlug).toBe('kolb-bot');
		expect(BRAND.primaryDomain).toBe('kolb-bot.com');
		expect(BRAND.terminalDisplayName).toBe('Kolb Terminal');
		expect(BRAND.computerDisplayName).toBe('Kolb Computer');
	});

	it('drives APP_NAME', () => {
		expect(APP_NAME).toBe(BRAND.productName);
	});

	it('has a well-formed slug', () => {
		expect(BRAND.productSlug).toMatch(/^[a-z0-9][a-z0-9-]*$/);
	});

	it('points every asset path at local static assets', () => {
		const assets = [
			BRAND.logoLight,
			BRAND.logoDark,
			BRAND.squareIcon,
			BRAND.favicon,
			BRAND.pwaIcons.icon192,
			BRAND.pwaIcons.icon512,
			BRAND.pwaIcons.appleTouchIcon
		];
		for (const asset of assets) {
			expect(asset).toMatch(/^\/static\//);
			expectClean(asset, `asset path ${asset}`);
		}
	});

	it('contains no upstream or other-bot identity anywhere', () => {
		expectClean(JSON.stringify(BRAND), 'BRAND config');
	});

	it('uses valid hex theme tokens', () => {
		for (const [name, value] of Object.entries(BRAND.theme)) {
			expect(value, `theme token ${name}`).toMatch(/^#[0-9a-fA-F]{6}$/);
		}
	});

	it('defines Abby-Bot home-screen branding for kolbyunderwood@gmail.com', () => {
		const branding = getUserPwaBranding('kolbyunderwood@gmail.com');
		const root = path.resolve(__dirname, '../..');
		expect(branding?.shortName).toBe('ABBY-BOT');
		expect(branding?.appleTouchIcon).toBe('/static/user-icons/abby-bot/apple-touch-icon.png');
		expect(fs.existsSync(path.join(root, 'static/static/user-icons/abby-bot/apple-touch-icon.png'))).toBe(
			true
		);
	});

	it('keeps the default Kolb-Bot branding for other users', () => {
		expect(getUserPwaBranding('other@example.com')).toBeNull();
	});
});

describe('generated manifests and metadata', () => {
	const root = path.resolve(__dirname, '../..');

	it('site.webmanifest carries the product identity', () => {
		for (const rel of ['static/static/site.webmanifest', 'backend/open_webui/static/site.webmanifest']) {
			const manifest = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf-8'));
			expect(manifest.name, rel).toBe(BRAND.productName);
			expect(manifest.short_name, rel).toBe(BRAND.productShortName);
			expectClean(JSON.stringify(manifest), rel);
		}
	});

	it('opensearch.xml carries the product identity', () => {
		const xml = fs.readFileSync(path.join(root, 'static/opensearch.xml'), 'utf-8');
		expect(xml).toContain(`<ShortName>${BRAND.productName}</ShortName>`);
		expectClean(xml, 'opensearch.xml');
	});

	it('app.html title carries the product identity', () => {
		const html = fs.readFileSync(path.join(root, 'src/app.html'), 'utf-8');
		expect(html).toContain(`<title>${BRAND.productName}</title>`);
		expectClean(html, 'app.html');
	});

	it('locale files carry no upstream or other-bot identity', () => {
		const localesDir = path.join(root, 'src/lib/i18n/locales');
		for (const locale of fs.readdirSync(localesDir)) {
			const file = path.join(localesDir, locale, 'translation.json');
			if (!fs.existsSync(file)) continue;
			// i18next interpolation variables (e.g. {{OPEN_WEBUI_VERSION}}) are
			// internal identifiers matched by name from code; exclude them.
			const content = fs.readFileSync(file, 'utf-8').replace(/{{[^}]*}}/g, '');
			expectClean(content, `locale ${locale}`);
		}
	});
});
