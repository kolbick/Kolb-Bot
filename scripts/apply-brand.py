#!/usr/bin/env python3
"""Apply Kolb-Bot brand strings to upstream-derived source and locale files.

This is part of the maintainable rebranding layer (see docs/BRANDING.md and
docs/UPSTREAM_SYNC.md): after merging an upstream release, re-run

    python3 scripts/apply-brand.py

to re-apply the mechanical text-level rebrand, then review the structural
surfaces listed in docs/UPSTREAM_SYNC.md by hand and finish with

    bash scripts/audit-branding.sh

The script is idempotent. It only rewrites the user-visible product name in
frontend source strings and localization files; it deliberately does not touch
license files, upstream sync docs, the `open_webui` Python package name, or
dependency metadata.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PRODUCT_NAME = 'Kolb-Bot'

# Ordered so longer variants are replaced first.
NAME_REPLACEMENTS = [
    ('Open WebUI', PRODUCT_NAME),
    ('OpenWebUI', PRODUCT_NAME),
]

# i18next interpolation variable names must not be rewritten: they are matched
# by name against parameters passed from code.
INTERPOLATION_RE = re.compile(r'{{[^}]*}}')

# Files that intentionally retain upstream attribution (license notices must
# not be rewritten).
EXCLUDED_FILES = {
    'src/lib/components/chat/Settings/About.svelte',
}


def replace_names(text: str) -> str:
    parts = []
    last = 0
    for m in INTERPOLATION_RE.finditer(text):
        seg = text[last : m.start()]
        for old, new in NAME_REPLACEMENTS:
            seg = seg.replace(old, new)
        parts.append(seg)
        parts.append(m.group(0))
        last = m.end()
    seg = text[last:]
    for old, new in NAME_REPLACEMENTS:
        seg = seg.replace(old, new)
    parts.append(seg)
    return ''.join(parts)


# Locale values include hand-translated spellings ("Open-WebUI", "Open WEBUI"),
# so locale files get a case-insensitive variant match instead of the literal
# replacements used for source code.
LOCALE_VARIANT_RE = re.compile(r'open[\s_-]?web[\s_-]?ui', re.I)


def replace_locale_names(text: str) -> str:
    parts = []
    last = 0
    for m in INTERPOLATION_RE.finditer(text):
        parts.append(LOCALE_VARIANT_RE.sub(PRODUCT_NAME, text[last : m.start()]))
        parts.append(m.group(0))
        last = m.end()
    parts.append(LOCALE_VARIANT_RE.sub(PRODUCT_NAME, text[last:]))
    return ''.join(parts)


def rebrand_locales() -> int:
    changed = 0
    for path in sorted((ROOT / 'src/lib/i18n/locales').glob('*/translation.json')):
        data = json.loads(path.read_text(encoding='utf-8'))
        out = {replace_locale_names(k): replace_locale_names(v) for k, v in data.items()}
        if out != data:
            path.write_text(
                json.dumps(out, ensure_ascii=False, indent='\t') + '\n', encoding='utf-8'
            )
            changed += 1
    return changed


def rebrand_frontend_source() -> int:
    changed = 0
    for pattern in ('src/**/*.svelte', 'src/**/*.ts', 'src/*.html'):
        for path in sorted(ROOT.glob(pattern)):
            rel = path.relative_to(ROOT).as_posix()
            if 'i18n/locales' in rel or rel in EXCLUDED_FILES:
                continue
            text = path.read_text(encoding='utf-8')
            out = replace_names(text)
            if out != text:
                path.write_text(out, encoding='utf-8')
                changed += 1
    return changed


def main() -> int:
    locales = rebrand_locales()
    source = rebrand_frontend_source()
    print(f'rebranded {locales} locale files, {source} source files')
    return 0


if __name__ == '__main__':
    sys.exit(main())
