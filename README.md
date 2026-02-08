# ☠️ Kolb-Bot

<p align="center">
    <img src="assets/kolb-bot-logo.png" alt="Kolb-Bot" width="400">
</p>

<p align="center">
  <strong>Your Personal AI Pirate Assistant — Powered by Google Gemini (Free)</strong>
</p>

---

Kolb-Bot is a personal AI assistant that lives on your computer and talks to you through WhatsApp, Discord, Telegram, Slack, iMessage, Signal, and pretty much every other messaging app you can think of. You own it. It runs on your machine. Your data stays with you.

This whole thing started because I got tired of juggling a dozen different AI tools and wanted one assistant that just works everywhere. Months of late nights messing with local LLMs, open-source projects, and way too many terminal sessions later — here it is.

**Best part: it's set up to use Google Gemini, which has a generous free tier so you can use it without paying anything.**

---

## What You Need to Download (and Why)

Before you can run Kolb-Bot, you need three things on your computer. Here's what each one is and why you need it:

### 1. Git — for downloading the code

**What is it?** Git is a tool developers use to download and manage code. You need it to grab the Kolb-Bot code from GitHub.

**Check if you already have it:**
```bash
git --version
```
If you see a version number, you're good. If not:

**Mac:**
```bash
# This will prompt you to install Xcode Command Line Tools, which includes git
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install -y git
```

**Windows:** You need WSL2 (Windows Subsystem for Linux). Everything about Kolb-Bot runs in Linux, so set this up first:
1. Open PowerShell as Administrator
2. Run: `wsl --install`
3. Restart your computer
4. Open "Ubuntu" from your Start menu
5. Now follow the Linux instructions above inside that Ubuntu window

**All remaining commands in this guide should be run inside WSL2 on Windows.**

---

### 2. Node.js (version 22+) — the engine that runs Kolb-Bot

**What is it?** Node.js is what actually runs the Kolb-Bot code. Kolb-Bot is written in TypeScript/JavaScript, and Node.js is the program that executes it. Think of it like how you need Microsoft Word to open a .docx file — you need Node.js to run Kolb-Bot.

**Why version 22?** Kolb-Bot uses modern JavaScript features that only work in Node.js 22 or newer.

**Check if you already have it:**
```bash
node --version
```
If you see `v22.x.x` or higher, skip ahead. If not:

**Mac:**
```bash
# If you have Homebrew:
brew install node@22

# If you don't have Homebrew, install it first:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node@22
```

**Linux (Ubuntu/Debian) / Windows WSL2:**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify it worked:**
```bash
node --version   # Should show v22.x.x or higher
npm --version    # Should show a number (npm comes with Node.js)
```

---

### 3. pnpm — the package manager that installs Kolb-Bot's dependencies

**What is it?** When you download Kolb-Bot's code, it doesn't come with every single library it needs — that would make the download huge. Instead, it comes with a list of what it needs (like a grocery list), and pnpm reads that list and downloads everything. It's like npm (which came with Node.js) but faster and uses less disk space.

**Install it:**
```bash
npm install -g pnpm
```

**Verify:**
```bash
pnpm --version   # Should show a version number
```

---

## Step 1: Download and Build Kolb-Bot

Now that you have the tools, let's get the actual code and build it.

```bash
# Download the code from GitHub
git clone https://github.com/kolbick/Kolb-Bot.git

# Go into the folder
cd Kolb-Bot

# Install all the libraries Kolb-Bot needs (this will take a minute)
pnpm install

# Build Kolb-Bot (compiles the TypeScript code into runnable JavaScript)
pnpm build
```

**What just happened?**
- `git clone` downloaded the entire Kolb-Bot project to your computer
- `pnpm install` read the "grocery list" (`package.json`) and downloaded ~1,000 libraries Kolb-Bot depends on
- `pnpm build` compiled the TypeScript source code into JavaScript that Node.js can run

**Make the `kolb-bot` command available everywhere:**
```bash
npm link
```

Now you can type `kolb-bot` from any folder on your system.

---

## Step 2: Set Up Google Gemini (Free)

Kolb-Bot supports many AI providers, but **Google Gemini is the recommended default** because it has a generous free tier — you can make a ton of requests per day without paying a cent.

You have two options:

### Option A: Gemini CLI OAuth (Easiest — No API Key Needed)

This uses the same free authentication as Google's official Gemini CLI. No API key to manage, just sign in with your Google account.

```bash
kolb-bot onboard --auth-choice google-gemini-cli
```

This will:
1. Open your browser
2. Ask you to sign in with your Google account
3. Grant Kolb-Bot permission to use Gemini
4. That's it — you're authenticated

**Your default model will be set to `gemini-3-pro-preview` — Google's most capable free model.**

### Option B: Gemini API Key (Also Free)

If you prefer using an API key:

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key
4. Run the setup:

```bash
kolb-bot onboard --auth-choice gemini-api-key
```

5. Paste your key when asked

**Both options are free.** Option A is simpler because you don't have to manage a key.

---

## Step 3: Run the Setup Wizard

If you already ran `kolb-bot onboard` in Step 2, you may have already completed the full wizard. If not, run it now:

```bash
kolb-bot onboard
```

The wizard walks you through everything. Here's what to expect:

### 3a. Security Notice
Read and accept to continue.

### 3b. Choose Setup Mode
- **QuickStart** — Pick this one. It uses sensible defaults and gets you running fast.
- **Advanced** — Only if you want to configure every detail manually.

### 3c. Workspace Directory
Where Kolb-Bot stores its data. The default is fine:
```
~/.kolb-bot/workspace
```
Just press Enter.

### 3d. AI Model Setup
If you already did Step 2, this is done. If not, choose **Google Gemini** and follow the prompts.

### 3e. Gateway Configuration
The "gateway" is the background engine that keeps Kolb-Bot running and connected to your messaging apps. Think of it like a mail server — it's always listening for messages.
- **Port** — Default `18789`. Press Enter.
- **Auth** — It generates a security token automatically.

### 3f. Connect Your Messaging Apps

This is the fun part. Pick whichever apps you use:

**WhatsApp:**
- A QR code appears in your terminal
- Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
- Scan the QR code
- Done — Kolb-Bot is on your WhatsApp

**Discord:**
- Go to https://discord.com/developers/applications
- Create a New Application → Go to "Bot" → Add Bot
- Copy the token, paste it in the wizard
- Invite the bot to your server using the URL the wizard gives you

**Telegram:**
- Open Telegram, message @BotFather
- Send `/newbot`, follow the instructions
- Copy the token, paste it in the wizard

**Signal, Slack, iMessage, Teams, Google Chat, Matrix, and more** — the wizard guides you through each one.

### 3g. Install as Background Service
Say **yes**. This means Kolb-Bot starts automatically when your computer boots.

---

## Step 4: Start the Gateway

If you installed the daemon service, it's already running. Check with:

```bash
kolb-bot gateway status
```

If you need to start it manually:

```bash
kolb-bot gateway start
```

---

## Step 5: Talk to Your Bot

### From your terminal:
```bash
# Ask it something
kolb-bot agent --message "What's the weather like today?"

# Open the full chat interface
kolb-bot tui
```

### From your phone:
Just send a message to Kolb-Bot on WhatsApp, Discord, Telegram — whatever you connected. It responds like a normal chat.

---

## Commands Cheat Sheet

| Command | What It Does |
|---------|-------------|
| `kolb-bot onboard` | Run the setup wizard |
| `kolb-bot gateway start` | Start the gateway (background) |
| `kolb-bot gateway stop` | Stop the gateway |
| `kolb-bot gateway status` | Check if the gateway is running |
| `kolb-bot gateway restart` | Restart the gateway |
| `kolb-bot agent --message "..."` | Send a message to the AI |
| `kolb-bot tui` | Open the terminal chat interface |
| `kolb-bot models list` | See all available AI models |
| `kolb-bot models set gemini` | Switch to Gemini (default) |
| `kolb-bot models set opus` | Switch to Claude Opus |
| `kolb-bot models set gpt` | Switch to GPT |
| `kolb-bot doctor` | Diagnose problems |
| `kolb-bot doctor --fix` | Auto-fix any issues |
| `kolb-bot update` | Update to the latest version |
| `kolb-bot --help` | Show all commands |

---

## Switching AI Models

Kolb-Bot isn't locked to one AI provider. You can switch anytime:

```bash
# See what's available
kolb-bot models list

# Switch models (these are shorthand aliases)
kolb-bot models set gemini          # Google Gemini 3 Pro (free)
kolb-bot models set gemini-flash    # Google Gemini 3 Flash (free, faster)
kolb-bot models set opus            # Anthropic Claude Opus (paid)
kolb-bot models set sonnet          # Anthropic Claude Sonnet (paid)
kolb-bot models set gpt             # OpenAI GPT (paid)
kolb-bot models set gpt-mini        # OpenAI GPT Mini (paid, cheaper)
```

To add a new provider's API key:
```bash
kolb-bot models auth login --provider <provider> --set-default
```

---

## Something Not Working?

```bash
kolb-bot doctor
```

This checks everything — config, gateway, channels, auth tokens, Node.js version — and tells you exactly what's wrong. To auto-fix:

```bash
kolb-bot doctor --fix
```

### Common Issues

**"Command not found: kolb-bot"**
- Run `npm link` inside the Kolb-Bot folder again
- Or make sure Node.js is installed and restart your terminal

**"Gateway not reachable"**
- Start it: `kolb-bot gateway start`
- Check status: `kolb-bot gateway status`

**"Auth token expired"**
- Run `kolb-bot doctor --fix`
- Or re-run `kolb-bot onboard` to set up credentials again

**WhatsApp disconnected**
- Run `kolb-bot onboard` and re-scan the QR code

**Build errors during `pnpm build`**
- Make sure Node.js is version 22+: `node --version`
- Try deleting `node_modules` and reinstalling: `rm -rf node_modules && pnpm install`

---

## Where Kolb-Bot Keeps Its Stuff

Everything lives in `~/.kolb-bot/` on your machine:

```
~/.kolb-bot/
  kolb-bot.json          ← Main config file
  workspace/             ← Bot's working directory
  credentials/           ← Auth tokens (keep this safe!)
  agents/                ← Agent configs and auth profiles
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

## Supported AI Models

| Provider | Models | Cost | How to Get Access |
|----------|--------|------|-------------------|
| **Google Gemini** | **Gemini 3 Pro, Flash** | **Free tier** | **https://aistudio.google.com/apikey** |
| Anthropic | Claude Opus, Sonnet, Haiku | Paid | https://console.anthropic.com/ |
| OpenAI | GPT-4, GPT-5, o1, o3 | Paid | https://platform.openai.com/ |
| Ollama | Llama 3, Mistral, Phi, etc. | Free (local) | https://ollama.com/ |
| xAI | Grok | Paid | https://x.ai/ |
| OpenRouter | 100+ models | Varies | https://openrouter.ai/ |
| AWS Bedrock | Claude, Titan, etc. | Paid | https://aws.amazon.com/bedrock/ |

---

## License

MIT — do whatever you want with it.
