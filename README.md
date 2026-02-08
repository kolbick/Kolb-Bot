# ☠️ Kolb-Bot

<p align="center">
    <img src="assets/kolb-bot-logo.png" alt="Kolb-Bot" width="400">
</p>

<p align="center">
  <strong>Your Personal AI Pirate Assistant</strong>
</p>

---

Kolb-Bot is a personal AI assistant that lives on your computer and talks to you through WhatsApp, Discord, Telegram, Slack, iMessage, Signal, and pretty much every other messaging app you can think of. You own it. It runs on your machine. Your data stays with you.

This whole thing started because I got tired of juggling a dozen different AI tools and wanted one assistant that just works everywhere. Months of late nights messing with local LLMs, open-source projects, and way too many terminal sessions later -- here it is.

---

## What You Need Before Starting

You need **one thing** installed on your computer: **Node.js version 22 or newer**.

### How to check if you have Node.js

Open your terminal (on Mac, search for "Terminal" in Spotlight; on Windows, use WSL2; on Linux, you already know) and type:

```bash
node --version
```

If you see something like `v22.x.x` or higher, you're good. If you get an error or a version lower than 22, you need to install or update Node.js.

### How to install Node.js

**Mac:**
```bash
# If you have Homebrew (recommended):
brew install node@22

# If you don't have Homebrew, install it first:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node@22
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**

You need to use WSL2 (Windows Subsystem for Linux). This is strongly recommended. Here's how:

1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart your computer
4. Open "Ubuntu" from your Start menu
5. Now follow the Linux instructions above inside that Ubuntu window

---

## Step 1: Install Kolb-Bot

Open your terminal and run:

```bash
npm install -g kolb-bot@latest
```

That's it. This downloads Kolb-Bot and makes the `kolb-bot` command available everywhere on your system.

> **What does `-g` mean?** It means "global" -- install it so you can use the `kolb-bot` command from any folder, not just one project.

To verify it worked:

```bash
kolb-bot --version
```

You should see a version number. If you do, Kolb-Bot is installed.

---

## Step 2: Run the Setup Wizard

This is the fun part. Kolb-Bot has a setup wizard that walks you through everything step by step. Just run:

```bash
kolb-bot onboard
```

The wizard will ask you a series of questions. Here's what to expect:

### 2a. Security Notice

It'll show a security notice. Read it, then accept to continue.

### 2b. Choose Your Setup Mode

You'll see two options:

- **QuickStart** -- Pick this one. It uses sensible defaults and gets you running fast.
- **Advanced** -- Only if you want to configure every detail manually (network binding, Tailscale, etc.)

### 2c. Workspace Directory

The wizard will ask where to store Kolb-Bot's data. The default is fine for most people:

```
~/.kolb-bot/workspace
```

Just press Enter to accept the default.

### 2d. AI Model Setup (This is Important)

Kolb-Bot needs an AI model to be smart. You'll choose a provider:

- **Anthropic (Claude)** -- Recommended. Best for long conversations and staying safe from prompt injection attacks.
- **OpenAI (GPT)** -- Also great. Use this if you already have an OpenAI API key.
- **Local models (Ollama)** -- Free, runs on your own hardware. Needs a beefy GPU.
- **Others** -- Google Gemini, xAI Grok, OpenRouter, and more.

**If you pick Anthropic or OpenAI:**
You'll need an API key. The wizard will tell you where to get one:
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

Paste your key when asked.

**If you pick Ollama (free local models):**
Make sure Ollama is installed and running on your machine first:
```bash
# Install Ollama (Mac/Linux):
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model:
ollama pull llama3

# Make sure it's running:
ollama serve
```

### 2e. Gateway Configuration

The "gateway" is the engine that keeps Kolb-Bot running in the background. The wizard will ask:

- **Port** -- Default is `18789`. Just press Enter.
- **Auth** -- It'll generate a security token for you. Keep this safe.

### 2f. Channel Setup (Connect Your Messaging Apps)

This is where it gets cool. The wizard will ask which messaging apps you want to connect:

**WhatsApp:**
- Kolb-Bot will show you a QR code in your terminal
- Open WhatsApp on your phone
- Go to Settings > Linked Devices > Link a Device
- Scan the QR code
- Done. Kolb-Bot is now on your WhatsApp.

**Discord:**
- You'll need a Discord bot token
- Go to https://discord.com/developers/applications
- Create a New Application
- Go to "Bot" section, click "Add Bot"
- Copy the token and paste it into the wizard
- Invite the bot to your server using the OAuth2 URL the wizard gives you

**Telegram:**
- Open Telegram and message @BotFather
- Send `/newbot` and follow the instructions
- Copy the token BotFather gives you
- Paste it into the wizard

**Signal, Slack, iMessage, Microsoft Teams, Google Chat, Matrix, and others** all have similar setup flows -- the wizard will guide you through each one.

### 2g. Install as Background Service (Recommended)

At the end, the wizard will ask if you want to install Kolb-Bot as a background service. **Say yes.** This means Kolb-Bot starts automatically when your computer boots up and keeps running in the background.

```
Install daemon service? (Y/n) Y
```

---

## Step 3: Start the Gateway

If you installed the daemon service in the previous step, Kolb-Bot is already running. You can check with:

```bash
kolb-bot gateway status
```

If you skipped the daemon install, start it manually:

```bash
kolb-bot gateway
```

This starts the gateway in the foreground (it'll keep running as long as your terminal is open). To run it in the background instead:

```bash
kolb-bot gateway install
kolb-bot gateway start
```

---

## Step 4: Talk to Your Bot

Now the fun begins. You can talk to Kolb-Bot in a few ways:

### From your terminal:

```bash
# Ask it something
kolb-bot agent --message "What's the weather like today?"

# Ask it something with deep thinking enabled
kolb-bot agent --message "Explain quantum computing" --thinking high

# Open the full terminal chat UI
kolb-bot tui
```

### From your phone:

Just send a message to Kolb-Bot on WhatsApp (or whatever channel you connected). It'll respond just like a normal chat.

### Send a message to someone:

```bash
kolb-bot message send --to +1234567890 --message "Ahoy!"
```

---

## Useful Commands Cheat Sheet

| Command | What It Does |
|---------|-------------|
| `kolb-bot onboard` | Run the setup wizard |
| `kolb-bot gateway` | Start the gateway (foreground) |
| `kolb-bot gateway start` | Start the gateway service (background) |
| `kolb-bot gateway stop` | Stop the gateway service |
| `kolb-bot gateway restart` | Restart the gateway |
| `kolb-bot gateway status` | Check if the gateway is running |
| `kolb-bot agent --message "..."` | Send a message to the AI |
| `kolb-bot tui` | Open the terminal chat interface |
| `kolb-bot doctor` | Diagnose and fix problems |
| `kolb-bot doctor --fix` | Auto-fix any issues it finds |
| `kolb-bot update` | Update to the latest version |
| `kolb-bot --version` | Show the installed version |
| `kolb-bot --help` | Show all available commands |

---

## Something Not Working?

Run the doctor:

```bash
kolb-bot doctor
```

This checks everything -- your config, your gateway, your channels, your auth tokens, your Node.js version -- and tells you exactly what's wrong and how to fix it. If you want it to just fix things automatically:

```bash
kolb-bot doctor --fix
```

### Common Issues

**"Command not found: kolb-bot"**
- Node.js isn't installed, or the global npm bin directory isn't in your PATH
- Try: `npm install -g kolb-bot@latest` again
- On Mac, you might need to restart your terminal

**"Gateway not reachable"**
- The gateway isn't running. Start it: `kolb-bot gateway start`
- Or check the status: `kolb-bot gateway status`

**"Auth token expired"**
- Run `kolb-bot doctor --fix` to refresh your auth tokens
- Or re-run `kolb-bot onboard` to set up new credentials

**WhatsApp disconnected**
- This happens sometimes. Run `kolb-bot onboard` and re-scan the QR code
- Or check the gateway logs for details

---

## Where Kolb-Bot Keeps Its Stuff

Everything lives in `~/.kolb-bot/` on your machine:

```
~/.kolb-bot/
  kolb-bot.json          <-- Main config file
  workspace/             <-- Bot's working directory
  credentials/           <-- Auth tokens (keep this safe!)
```

You can change the location by setting environment variables:

```bash
export KOLB_BOT_STATE_DIR=/path/to/your/folder
export KOLB_BOT_CONFIG_PATH=/path/to/your/config.json
```

---

## Running with Docker

If you prefer Docker:

```bash
docker run -d \
  --name kolb-bot \
  -p 18789:18789 \
  -v ~/.kolb-bot:/home/node/.kolb-bot \
  kolb-bot:local \
  gateway --allow-unconfigured
```

Or with Docker Compose:

```bash
docker compose up -d
```

---

## Supported Channels

| Channel | Status |
|---------|--------|
| WhatsApp | Fully supported |
| Discord | Fully supported |
| Telegram | Fully supported |
| Slack | Fully supported |
| Signal | Fully supported |
| iMessage | Fully supported (Mac only) |
| Microsoft Teams | Fully supported |
| Google Chat | Fully supported |
| Matrix | Fully supported |
| BlueBubbles | Fully supported |
| Mattermost | Fully supported |
| Zalo | Fully supported |
| Line | Fully supported |
| Feishu / Lark | Fully supported |
| Nostr | Fully supported |
| Twitch | Fully supported |
| WebChat | Fully supported |

---

## Supported AI Models

| Provider | Models | How to Get Access |
|----------|--------|-------------------|
| Anthropic | Claude Opus, Sonnet, Haiku | https://console.anthropic.com/ |
| OpenAI | GPT-4, GPT-4o, o1, o3 | https://platform.openai.com/ |
| Ollama | Llama 3, Mistral, Phi, etc. | https://ollama.com/ (free, local) |
| Google | Gemini Pro, Flash | https://ai.google.dev/ |
| xAI | Grok | https://x.ai/ |
| AWS Bedrock | Claude, Titan, etc. | https://aws.amazon.com/bedrock/ |
| Azure OpenAI | GPT-4, etc. | https://azure.microsoft.com/en-us/products/ai-services/openai-service |
| OpenRouter | 100+ models | https://openrouter.ai/ |

---

## License

MIT -- do whatever you want with it.
