#!/usr/bin/env python3
"""Generate Kolb-Bot static brand assets from the owner-supplied originals.

Source of truth: branding/original/ (never modified). Outputs overwrite the
upstream-branded assets in:

  - static/                      (SvelteKit static root)
  - static/static/               (served at /static/)
  - backend/open_webui/static/   (backend-served copies)

Mapping (also documented in docs/BRANDING.md):

  favicon.png (512)            <- android-chrome-512x512.png
  favicon-96x96.png            <- android-chrome-192x192.png (resized)
  favicon-dark.png (500)       <- android-chrome-512x512.png (resized)
  favicon.ico                  <- favicon.ico (32px frame re-encoded)
  favicon.svg                  <- android-chrome-192x192.png embedded as data URI
  logo.png (500)               <- logo-512.png (resized, transparent full logo)
  splash.png (500)             <- logo-512.png (resized)
  splash-dark.png (500)        <- logo-512.png (resized)
  apple-touch-icon.png (180)   <- apple-touch-icon.png
  web-app-manifest-192x192.png <- maskable-icon-512x512.png (resized)
  web-app-manifest-512x512.png <- maskable-icon-512x512.png

user.png (neutral default avatar) is deliberately left as the upstream
generic silhouette; it carries no product branding.

Requires Pillow: pip install pillow
"""

import base64
import io
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'branding/original'
DESTS = [ROOT / 'static/static', ROOT / 'backend/open_webui/static']


def load(name: str) -> Image.Image:
    return Image.open(SRC / name).convert('RGBA')


def save_resized(im: Image.Image, size: int, *paths: Path) -> None:
    out = im.resize((size, size), Image.LANCZOS)
    for p in paths:
        out.save(p, 'PNG', optimize=True)
        print('wrote', p.relative_to(ROOT))


def main() -> int:
    icon = load('android-chrome-512x512.png')
    icon192 = load('android-chrome-192x192.png')
    maskable = load('maskable-icon-512x512.png')
    logo = load('logo-512.png')
    touch = load('apple-touch-icon.png')

    save_resized(icon, 512, ROOT / 'static/favicon.png')
    for d in DESTS:
        save_resized(icon, 512, d / 'favicon.png')
        save_resized(icon192, 96, d / 'favicon-96x96.png')
        save_resized(icon, 500, d / 'favicon-dark.png')
        save_resized(logo, 500, d / 'logo.png')
        save_resized(logo, 500, d / 'splash.png')
        save_resized(logo, 500, d / 'splash-dark.png')
        save_resized(touch, 180, d / 'apple-touch-icon.png')
        save_resized(maskable, 192, d / 'web-app-manifest-192x192.png')
        save_resized(maskable, 512, d / 'web-app-manifest-512x512.png')

        ico = icon.resize((32, 32), Image.LANCZOS)
        ico.save(d / 'favicon.ico', sizes=[(16, 16), (32, 32)])
        print('wrote', (d / 'favicon.ico').relative_to(ROOT))

        buf = io.BytesIO()
        icon192.save(buf, 'PNG', optimize=True)
        b64 = base64.b64encode(buf.getvalue()).decode()
        svg = (
            '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" '
            'viewBox="0 0 192 192"><image width="192" height="192" '
            f'href="data:image/png;base64,{b64}"/></svg>\n'
        )
        (d / 'favicon.svg').write_text(svg)
        print('wrote', (d / 'favicon.svg').relative_to(ROOT))

    return 0


if __name__ == '__main__':
    sys.exit(main())
