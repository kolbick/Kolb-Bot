"""Brand-configuration tests: fail if Kolb-Bot and upstream/other-bot
identities are ever mixed. Run with:

    python -m unittest discover -s backend/test -p 'test_brand*.py'
"""

import re

import unittest
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent

# Load brand.py directly: importing the open_webui package would pull the full
# application dependency tree, which this dependency-free test doesn't need.
import importlib.util  # noqa: E402

_spec = importlib.util.spec_from_file_location('brand', BACKEND_DIR / 'open_webui/brand.py')
brand = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(brand)

FORBIDDEN = [
    re.compile(r'open[\s_-]?web[\s_-]?ui', re.I),
    re.compile(r'tide[\s_-]?bot', re.I),
    re.compile(r'changing[\s_-]?tides', re.I),
]


def assert_clean(testcase, value, label):
    for pattern in FORBIDDEN:
        testcase.assertIsNone(
            pattern.search(value), f'{label} contains forbidden identity {pattern.pattern!r}: {value!r}'
        )


class TestBrandModule(unittest.TestCase):
    def test_identity_values(self):
        self.assertEqual(brand.PRODUCT_NAME, 'Kolb-Bot')
        self.assertEqual(brand.PRODUCT_SHORT_NAME, 'Kolb-Bot')
        self.assertEqual(brand.PRODUCT_SLUG, 'kolb-bot')
        self.assertEqual(brand.PRIMARY_DOMAIN, 'kolb-bot.com')
        self.assertEqual(brand.TERMINAL_DISPLAY_NAME, 'Kolb Terminal')
        self.assertEqual(brand.COMPUTER_DISPLAY_NAME, 'Kolb Computer')

    def test_no_identity_mixing(self):
        for name in dir(brand):
            value = getattr(brand, name)
            if isinstance(value, str) and not name.startswith('_'):
                assert_clean(self, value, f'brand.{name}')

    def test_asset_paths_are_local(self):
        self.assertTrue(brand.FAVICON_PATH.startswith('/static/'))
        self.assertTrue(brand.LOGO_PATH.startswith('/static/'))

    def test_theme_tokens_are_hex(self):
        for name in ('THEME_LIGHT_BACKGROUND', 'THEME_DARK_BACKGROUND', 'THEME_ACCENT'):
            self.assertRegex(getattr(brand, name), r'^#[0-9a-fA-F]{6}$', name)

    def test_user_pwa_branding_for_ateed120(self):
        branding = brand.get_user_pwa_branding('ateed120@gmail.com')
        self.assertIsNotNone(branding)
        self.assertEqual(branding['short_name'], 'ABBY-BOT')
        icon = BACKEND_DIR / 'open_webui/static/user-icons/abby-bot/apple-touch-icon.png'
        self.assertTrue(icon.exists(), 'abby-bot apple-touch-icon must exist')

    def test_user_pwa_branding_defaults_for_other_users(self):
        self.assertIsNone(brand.get_user_pwa_branding('other@example.com'))


class TestStaticIdentity(unittest.TestCase):
    def test_site_webmanifest(self):
        manifest = (BACKEND_DIR / 'open_webui/static/site.webmanifest').read_text()
        self.assertIn('Kolb-Bot', manifest)
        assert_clean(self, manifest, 'backend site.webmanifest')

    def test_no_upstream_default_name_suffix(self):
        # The upstream env module appended " (Open WebUI)" to custom names;
        # that logic must stay removed.
        env_src = (BACKEND_DIR / 'open_webui/env.py').read_text()
        self.assertNotIn("WEBUI_NAME += ' (", env_src)


if __name__ == '__main__':
    unittest.main()
