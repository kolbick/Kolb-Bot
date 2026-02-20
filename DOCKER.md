# Running Kolb-Bot in Docker

Docker puts Kolb-Bot in an isolated container so it can't touch your personal files or system. This is the recommended approach for VPS deployments, shared machines, or anyone who wants extra safety.

## Prerequisites

| Platform          | Install Docker                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Linux**         | `sudo apt update && sudo apt install -y docker.io docker-compose-v2` then `sudo usermod -aG docker $USER` and **log out/back in** |
| **Mac**           | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)                                                         |
| **Windows (WSL)** | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) with the WSL 2 backend enabled                          |

Verify Docker is working:

```bash
docker --version
docker compose version
```

## Quick Start (Recommended)

```bash
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot
./docker-setup.sh
```

This single script does everything:

1. Builds the Docker image
2. Creates `~/.kolb-bot/` config directory
3. Generates a secure gateway token
4. Runs the onboarding wizard (AI setup, channel connections)
5. Starts the gateway in the background

When it finishes, open **http://127.0.0.1:18789/** in your browser to access the Control UI.

## Manual Setup (Step by Step)

If you prefer to understand each step:

### 1. Clone and build the image

```bash
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot
docker build -t kolb-bot:local .
```

### 2. Create config directory and environment file

```bash
mkdir -p ~/.kolb-bot/workspace
```

Create a `.env` file in the Kolb-Bot directory:

```bash
cat > .env << 'EOF'
KOLB_BOT_CONFIG_DIR=~/.kolb-bot
KOLB_BOT_WORKSPACE_DIR=~/.kolb-bot/workspace
KOLB_BOT_GATEWAY_TOKEN=REPLACE_ME
KOLB_BOT_IMAGE=kolb-bot:local
EOF
```

Generate a secure token and write it to `.env`:

```bash
TOKEN=$(openssl rand -hex 32)
sed -i "s/REPLACE_ME/$TOKEN/" .env
echo "Your gateway token: $TOKEN"
```

Save this token somewhere safe -- you'll need it to access the Control UI.

### 3. Run the setup wizard

```bash
docker compose run --rm kolb-bot-cli onboard
```

The wizard walks you through connecting an AI provider (Google Gemini is free) and messaging apps.

### 4. Start the gateway

```bash
docker compose up -d kolb-bot-gateway
```

### 5. Verify it's running

```bash
docker compose ps
docker compose logs kolb-bot-gateway --tail 20
```

You should see the gateway listening on port 18789.

## Connecting Messaging Apps

Run these from the Kolb-Bot directory:

```bash
# WhatsApp (scan QR code with your phone)
docker compose run --rm kolb-bot-cli channels login

# Telegram
docker compose run --rm kolb-bot-cli channels add --channel telegram --token "YOUR_BOT_TOKEN"

# Discord
docker compose run --rm kolb-bot-cli channels add --channel discord --token "YOUR_BOT_TOKEN"
```

## Running CLI Commands

Any `kolb-bot` command works through Docker Compose:

```bash
docker compose run --rm kolb-bot-cli doctor          # Health check
docker compose run --rm kolb-bot-cli models list      # List AI models
docker compose run --rm kolb-bot-cli gateway status   # Gateway status
docker compose run --rm kolb-bot-cli tui              # Interactive chat
```

## Updating

```bash
cd Kolb-Bot
git pull
docker build -t kolb-bot:local .
docker compose down
docker compose up -d kolb-bot-gateway
```

## VPS / Cloud Server Setup

For a headless server (no browser), use API key authentication:

```bash
ssh user@your-server

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# Clone and run setup
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot
./docker-setup.sh
```

When the wizard asks about AI auth, choose **API key** (browser-based auth won't work on a headless server).

## Container Architecture

```
Host machine                     Docker container
~/.kolb-bot/  <-- bind mount --> /home/node/.kolb-bot/   (config + credentials)
                                 /app/                    (Kolb-Bot code, read-only)
                                 runs as 'node' user      (uid 1000, non-root)
                                 ports: 18789, 18790      (gateway + bridge)
```

- Runs as **non-root** (`node`, uid 1000)
- Only `~/.kolb-bot/` is shared with the host
- Gateway requires a token for access when bound to the network

## Optional Extras

**Install system packages** (e.g., ffmpeg for media processing):

```bash
export KOLB_BOT_DOCKER_APT_PACKAGES="ffmpeg imagemagick"
./docker-setup.sh
```

**Mount additional directories** into the container:

```bash
export KOLB_BOT_EXTRA_MOUNTS="$HOME/documents:/home/node/documents:ro"
./docker-setup.sh
```

**Persist the container home directory** across rebuilds:

```bash
export KOLB_BOT_HOME_VOLUME="kolb-bot_home"
./docker-setup.sh
```

## Troubleshooting

| Problem                               | Fix                                                                |
| ------------------------------------- | ------------------------------------------------------------------ |
| `permission denied` on `~/.kolb-bot/` | `sudo chown -R 1000:1000 ~/.kolb-bot` (container runs as uid 1000) |
| Gateway not reachable from host       | Check `docker compose ps` -- port 18789 should be mapped           |
| WhatsApp disconnected                 | Re-scan QR: `docker compose run --rm kolb-bot-cli channels login`  |
| "unauthorized" in Control UI          | Paste your gateway token in Settings (check `.env` for the value)  |
| Container won't start                 | `docker compose logs kolb-bot-gateway` to see the error            |
| Out of disk space                     | `docker system prune` to clean up old images/containers            |

## Stopping and Removing

```bash
# Stop the gateway (keeps config)
docker compose down

# Stop and remove everything (keeps ~/.kolb-bot/ config)
docker compose down --volumes --rmi local
```

---

For advanced topics (agent sandboxing, custom images, security hardening), see the full docs in `docs/install/docker.md`.
