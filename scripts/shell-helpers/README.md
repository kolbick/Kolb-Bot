# KolbDock <!-- omit in toc -->

Stop typing `docker-compose` commands. Just type `kolbdock-start`.

Inspired by Simon Willison's [Running KolbBot in Docker](https://til.simonwillison.net/llms/kolb-bot-docker).

- [Quickstart](#quickstart)
- [Available Commands](#available-commands)
  - [Basic Operations](#basic-operations)
  - [Container Access](#container-access)
  - [Web UI \& Devices](#web-ui--devices)
  - [Setup \& Configuration](#setup--configuration)
  - [Maintenance](#maintenance)
  - [Utilities](#utilities)
- [Common Workflows](#common-workflows)
  - [Check Status and Logs](#check-status-and-logs)
  - [Set Up WhatsApp Bot](#set-up-whatsapp-bot)
  - [Troubleshooting Device Pairing](#troubleshooting-device-pairing)
  - [Fix Token Mismatch Issues](#fix-token-mismatch-issues)
  - [Permission Denied](#permission-denied)
- [Requirements](#requirements)

## Quickstart

**Install:**

```bash
mkdir -p ~/.kolbdock && curl -sL https://raw.githubusercontent.com/kolb-bot/kolb-bot/main/scripts/shell-helpers/kolbdock-helpers.sh -o ~/.kolbdock/kolbdock-helpers.sh
```

```bash
echo 'source ~/.kolbdock/kolbdock-helpers.sh' >> ~/.zshrc && source ~/.zshrc
```

**See what you get:**

```bash
kolbdock-help
```

On first command, KolbDock auto-detects your KolbBot directory:

- Checks common paths (`~/kolb-bot`, `~/workspace/kolb-bot`, etc.)
- If found, asks you to confirm
- Saves to `~/.kolbdock/config`

**First time setup:**

```bash
kolbdock-start
```

```bash
kolbdock-fix-token
```

```bash
kolbdock-dashboard
```

If you see "pairing required":

```bash
kolbdock-devices
```

And approve the request for the specific device:

```bash
kolbdock-approve <request-id>
```

## Available Commands

### Basic Operations

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `kolbdock-start`   | Start the gateway               |
| `kolbdock-stop`    | Stop the gateway                |
| `kolbdock-restart` | Restart the gateway             |
| `kolbdock-status`  | Check container status          |
| `kolbdock-logs`    | View live logs (follows output) |

### Container Access

| Command                   | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `kolbdock-shell`          | Interactive shell inside the gateway container |
| `kolbdock-cli <command>`  | Run KolbBot CLI commands                       |
| `kolbdock-exec <command>` | Execute arbitrary commands in the container    |

### Web UI & Devices

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `kolbdock-dashboard`    | Open web UI in browser with authentication |
| `kolbdock-devices`      | List device pairing requests               |
| `kolbdock-approve <id>` | Approve a device pairing request           |

### Setup & Configuration

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `kolbdock-fix-token` | Configure gateway authentication token (run once) |

### Maintenance

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `kolbdock-rebuild` | Rebuild the Docker image                         |
| `kolbdock-clean`   | Remove all containers and volumes (destructive!) |

### Utilities

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `kolbdock-health`    | Run gateway health check                  |
| `kolbdock-token`     | Display the gateway authentication token  |
| `kolbdock-cd`        | Jump to the KolbBot project directory     |
| `kolbdock-config`    | Open the KolbBot config directory         |
| `kolbdock-workspace` | Open the workspace directory              |
| `kolbdock-help`      | Show all available commands with examples |

## Common Workflows

### Check Status and Logs

**Restart the gateway:**

```bash
kolbdock-restart
```

**Check container status:**

```bash
kolbdock-status
```

**View live logs:**

```bash
kolbdock-logs
```

### Set Up WhatsApp Bot

**Shell into the container:**

```bash
kolbdock-shell
```

**Inside the container, login to WhatsApp:**

```bash
kolb-bot channels login --channel whatsapp --verbose
```

Scan the QR code with WhatsApp on your phone.

**Verify connection:**

```bash
kolb-bot status
```

### Troubleshooting Device Pairing

**Check for pending pairing requests:**

```bash
kolbdock-devices
```

**Copy the Request ID from the "Pending" table, then approve:**

```bash
kolbdock-approve <request-id>
```

Then refresh your browser.

### Fix Token Mismatch Issues

If you see "gateway token mismatch" errors:

```bash
kolbdock-fix-token
```

This will:

1. Read the token from your `.env` file
2. Configure it in the KolbBot config
3. Restart the gateway
4. Verify the configuration

### Permission Denied

**Ensure Docker is running and you have permission:**

```bash
docker ps
```

## Requirements

- Docker and Docker Compose installed
- Bash or Zsh shell
- KolbBot project (from `docker-setup.sh`)

## Development

**Test with fresh config (mimics first-time install):**

```bash
unset KOLBDOCK_DIR && rm -f ~/.kolbdock/config && source scripts/shell-helpers/kolbdock-helpers.sh
```

Then run any command to trigger auto-detect:

```bash
kolbdock-start
```
