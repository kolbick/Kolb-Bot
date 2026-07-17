"""Kolb-Bot brand configuration.

Single source of truth for user-visible product identity on the backend.
Modules must consume these values instead of hardcoding brand strings, so an
upstream sync only has to re-apply this layer. See docs/BRANDING.md and
docs/UPSTREAM_SYNC.md.

The frontend counterpart is ``src/lib/brand.ts``; keep the two in sync when
values change.

The ``open_webui`` Python package name and internal identifiers are
deliberately unchanged; they are not user-visible and renaming them would make
upstream syncs unmaintainable (see docs/LICENSE_NOTES.md).
"""

import os

PRODUCT_NAME = os.environ.get('PRODUCT_NAME', 'Kolb-Bot')
PRODUCT_SHORT_NAME = os.environ.get('PRODUCT_SHORT_NAME', 'Kolb-Bot')
PRODUCT_SLUG = os.environ.get('PRODUCT_SLUG', 'kolb-bot')
PRIMARY_DOMAIN = os.environ.get('PRIMARY_DOMAIN', 'kolb-bot.com')

# Placeholder until the owner supplies a real support/contact channel.
SUPPORT_URL = os.environ.get('SUPPORT_URL', f'https://{PRIMARY_DOMAIN}')

DEFAULT_DESCRIPTION = os.environ.get(
    'PRODUCT_DESCRIPTION', f'{PRODUCT_NAME} is a private, self-hosted AI workspace.'
)

# Served from this application's own static directory; never an upstream URL.
FAVICON_PATH = '/static/favicon.png'
LOGO_PATH = '/static/logo.png'

TERMINAL_DISPLAY_NAME = os.environ.get('TERMINAL_DISPLAY_NAME', 'Kolb Terminal')
COMPUTER_DISPLAY_NAME = os.environ.get('COMPUTER_DISPLAY_NAME', 'Kolb Computer')

THEME_LIGHT_BACKGROUND = '#ffffff'
THEME_DARK_BACKGROUND = '#171717'
THEME_ACCENT = '#8f11b1'
