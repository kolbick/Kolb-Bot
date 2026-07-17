# Backup and restore

All state lives in two named Docker volumes:

| Volume | Contents |
| --- | --- |
| `kolb-bot-data` | Database (SQLite by default), uploads, vector store, caches |
| `kolb-terminal-data` | Terminal home/workspace (only when the terminal profile is enabled) |

Plus `.env` on the host (secrets — store the backup of this file securely).

## Backup

```bash
# 1. Quiesce writes (brief downtime is the safe default for SQLite)
docker compose stop kolb-bot

# 2. Snapshot the volumes to tarballs
docker run --rm -v kolb-bot-data:/data:ro -v "$PWD/backups:/backup" alpine \
  tar czf /backup/kolb-bot-data-$(date +%F).tar.gz -C /data .
docker run --rm -v kolb-terminal-data:/data:ro -v "$PWD/backups:/backup" alpine \
  tar czf /backup/kolb-terminal-data-$(date +%F).tar.gz -C /data . || true

# 3. Copy .env alongside (contains the encryption/session secret!)
cp .env backups/env-$(date +%F)

# 4. Resume
docker compose start kolb-bot
```

Keep backups off the host as well (external drive or private remote).

## Restore

```bash
docker compose down
docker volume rm kolb-bot-data && docker volume create kolb-bot-data
docker run --rm -v kolb-bot-data:/data -v "$PWD/backups:/backup" alpine \
  tar xzf /backup/kolb-bot-data-<DATE>.tar.gz -C /data
cp backups/env-<DATE> .env        # same WEBUI_SECRET_KEY is required
docker compose up -d --build
bash scripts/healthcheck.sh
```

Restore the matching `.env`: the secret key signs sessions and encrypts
stored credentials — data restored under a different key will not decrypt.

## Testing the procedure

After any significant change (and before upgrades), verify:

1. Take a backup as above.
2. `docker compose down && docker volume rm kolb-bot-data` (destroys state).
3. Restore, start, log in, and confirm chats/settings/uploads are present.

Data must also survive plain container replacement without any restore:
`docker compose up -d --force-recreate` must lose nothing, because state is
in the named volumes, not the containers.
