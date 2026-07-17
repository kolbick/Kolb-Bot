"""Compose OPENAI_API_BASE_URLS/OPENAI_API_KEYS/OPENAI_API_CONFIGS so that
"Kolb Computer" (the CPTR gateway) is registered as an OpenAI-compatible
connection automatically at startup, alongside any general OPENAI_API_BASE_URL
connection the admin has configured.

Only meant to be invoked by kolb-entrypoint.sh, and only when CPTR_GATEWAY_URL
is set. Prints `export VAR=value` lines for the caller to eval — this keeps
the composition logic testable in isolation rather than embedded in shell
string-splicing (an empty slot in OPENAI_API_BASE_URLS silently becomes
https://api.openai.com/v1 upstream, so slots must only be added when a URL is
actually configured).

See docs/CPTR_INTEGRATION.md. Kolb Computer is admin-only until an admin
explicitly grants other users/groups access (Workspace > Models): any model
surfaced from a connection with no Model DB row is visible only to admins by
design (open_webui/utils/models.py, get_filtered_models) — no extra access
control code is needed here for that default.
"""

import json
import os
import shlex
import sys


def main() -> int:
    cptr_url = os.environ.get('CPTR_GATEWAY_URL', '').strip()
    if not cptr_url:
        return 0

    cptr_key = os.environ.get('CPTR_GATEWAY_KEY', '').strip()
    general_url = os.environ.get('OPENAI_API_BASE_URL', '').strip()
    general_key = os.environ.get('OPENAI_API_KEY', '').strip()

    base_urls = ([general_url] if general_url else []) + [cptr_url]
    keys = ([general_key] if general_url else []) + [cptr_key]

    configs = {}
    existing = os.environ.get('OPENAI_API_CONFIGS', '').strip()
    if existing:
        try:
            parsed = json.loads(existing)
            if isinstance(parsed, dict):
                configs = parsed
        except ValueError:
            pass
    configs[cptr_url] = {
        'prefix_id': 'kolb-computer',
        'tags': ['Kolb Computer'],
    }

    print(f"export OPENAI_API_BASE_URLS={shlex.quote(';'.join(base_urls))}")
    print(f"export OPENAI_API_KEYS={shlex.quote(';'.join(keys))}")
    print(f"export OPENAI_API_CONFIGS={shlex.quote(json.dumps(configs))}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
