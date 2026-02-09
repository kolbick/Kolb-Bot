# ☠️ Kolb-Bot

<p align="center">
    <img src="assets/kolb-bot-logo.png" alt="Kolb-Bot" width="400">
</p>

<p align="center">
  <strong>Your Personal AI Pirate Assistant
</p>

---

Kolb-Bot is a personal AI assistant that lives on your computer and can talk to you through WhatsApp, Discord, Telegram, Slack, iMessage, Signal, and pretty much every other messaging app you can think of. You own it. It runs on your machine. Your data stays with you.

This whole thing started because I got tired of juggling a dozen different AI tools and wanted one assistant that just works everywhere. Months of late nights, learning AI, messing with open-source projects, trying to learn code, and way too many terminal sessions later — here it is.

**Best part: You can set it up to use Google Gemini, which has a generous free tier so you can use it without paying anything.**

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

## Running Kolb-Bot on a VPS / VM / Remote Server

### Why would you want to do this?

When you run Kolb-Bot on your laptop, it only works when your laptop is on and connected to the internet. Close the lid? Kolb-Bot goes to sleep. Lose Wi-Fi? Your WhatsApp bot goes offline.

A **VPS** (Virtual Private Server) is a small computer in the cloud that runs 24/7. It costs a few bucks a month (some providers have free tiers) and it means your bot **never goes offline** — it's always listening, always responding, even when your laptop is off.

**A VM** (Virtual Machine) is similar but runs on your own hardware — it's like a computer inside your computer. You might use one to keep Kolb-Bot isolated from the rest of your system.

**Here's when each option makes sense:**

| Scenario | Best Option | Why |
|----------|-------------|-----|
| Just trying it out | Your laptop | Easiest, no setup needed |
| Want it always online | VPS (cloud server) | Runs 24/7 without your laptop |
| Want isolation/safety | VM or Docker on your machine | Keeps Kolb-Bot contained |
| Want both always-on + safe | Docker on a VPS | Best of both worlds |
| Already have a home server | Docker on your server | Free, always on, you own it |

---

### Option 1: Run on a VPS (Always Online)

A VPS is a small Linux server you rent in the cloud. Popular providers:

| Provider | Free Tier? | Cheapest Paid | Notes |
|----------|-----------|---------------|-------|
| Oracle Cloud | Yes (forever free tier) | $0 | ARM instances are free forever |
| Hetzner | No | ~$4/mo | Great performance for the price |
| Railway | Limited free tier | ~$5/mo | Easy deploy, good for beginners |
| Fly.io | Limited free tier | ~$3/mo | Good for lightweight workloads |
| DigitalOcean | No | $4/mo | Beginner-friendly dashboard |

#### Step-by-step: Set up Kolb-Bot on a VPS

**1. Get a VPS and SSH into it:**
```bash
# After creating your VPS, you'll get an IP address. Connect to it:
ssh root@your-server-ip
```

**What is SSH?** It's a way to remotely control another computer from your terminal. Think of it like remote desktop, but text-only.

**2. Install the prerequisites (same as local, but on the server):**
```bash
# Install Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Install pnpm
npm install -g pnpm
```

**3. Clone and build Kolb-Bot:**
```bash
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot
pnpm install
pnpm build
npm link
```

**4. Run the setup wizard:**
```bash
kolb-bot onboard --auth-choice gemini-api-key
```

> **Why API key instead of OAuth on a VPS?** The OAuth option (`google-gemini-cli`) opens a browser window — which a headless server doesn't have. Use the API key option instead. Get your free key at https://aistudio.google.com/apikey

**5. Install as a system service (so it survives reboots):**
```bash
kolb-bot gateway install
```

This creates a systemd service that starts Kolb-Bot automatically when the server boots.

**6. Verify it's running:**
```bash
kolb-bot gateway status
```

**7. Access the Control UI from your laptop (securely via SSH tunnel):**

You don't want to expose Kolb-Bot's control port to the public internet. Instead, use an SSH tunnel — this creates a secure, encrypted pipe between your laptop and the server:

```bash
# Run this on YOUR LAPTOP (not the server):
ssh -N -L 18789:127.0.0.1:18789 root@your-server-ip
```

**What does this do?** It makes `localhost:18789` on your laptop secretly connect to port 18789 on your server through an encrypted tunnel. Now you can access the Control UI at `http://localhost:18789` on your laptop as if Kolb-Bot was running locally.

Keep this terminal open while you want access. Close it when you're done.

---

### Option 2: Run with Docker (Contained and Safe)

**What is Docker?** Docker is like a shipping container for software. It packages Kolb-Bot and everything it needs into an isolated box that can't touch the rest of your computer unless you explicitly allow it. This is the best way to keep things safe and contained.

**Why use Docker?**
- Kolb-Bot can't access your personal files, passwords, or other apps
- Easy to start, stop, and delete without leaving traces
- Same setup works on your laptop, a VPS, or a home server
- If something goes wrong, just delete the container and start fresh

**Install Docker:**

**Mac:**
```bash
brew install --cask docker
# Then open Docker Desktop from your Applications
```

**Linux:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for the group change to take effect
```

**Run Kolb-Bot with Docker Compose:**

```bash
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot

# Create your config directory
mkdir -p ~/.kolb-bot

# Start it up
docker compose up -d
```

**What just happened?**
- `-d` means "detached" — it runs in the background
- Docker downloaded the image, started a container, and Kolb-Bot is now running
- Your config is stored in `~/.kolb-bot/` on your host machine (not inside the container)
- The container only has access to that one folder

**Run the setup wizard inside the container:**
```bash
docker compose exec kolb-bot-gateway kolb-bot onboard --auth-choice gemini-api-key
```

**Check status:**
```bash
docker compose exec kolb-bot-gateway kolb-bot gateway status
```

**View logs:**
```bash
docker compose logs -f kolb-bot-gateway
```

**Stop it:**
```bash
docker compose down
```

**Start it again:**
```bash
docker compose up -d
```

---

### Option 3: Docker on a VPS (Best of Both Worlds)

This gives you always-on + isolated. The setup is just Option 1 + Option 2 combined:

1. Get a VPS and SSH into it
2. Install Docker on the VPS
3. Clone the repo and run `docker compose up -d`
4. Access via SSH tunnel from your laptop

This is the recommended production setup.

---

## Security: Full Access vs. Limited Access

Kolb-Bot is powerful — it can run commands, read files, control your browser, and manage your messaging apps. That power is useful, but you should understand what you're giving it access to and how to limit it.

### Understanding the Access Levels

**Full access (default when running directly on your machine):**
- Kolb-Bot can read/write any file your user account can access
- It can run any command on your system
- It can access your network
- It has access to your messaging app credentials

**Limited access (Docker or sandbox mode):**
- Kolb-Bot can only see files you explicitly share with it
- Commands run inside the container, not on your real system
- Network access can be restricted
- Your personal files are invisible to it

### Pros and Cons

#### Running Directly on Your Machine (Full Access)

| Pros | Cons |
|------|------|
| Easiest setup | Bot can see all your files |
| Can use iMessage (Mac only) | A bug or prompt injection could run harmful commands |
| Can control your browser directly | Harder to contain if something goes wrong |
| Access to all your local tools | Messaging credentials stored alongside your other files |
| Best performance (no container overhead) | |

**Best for:** Personal use on a trusted machine, when you want maximum capability.

#### Running in Docker (Limited Access)

| Pros | Cons |
|------|------|
| Bot is contained — can't touch your personal files | Slightly more complex setup |
| Easy to wipe and restart from scratch | Some features need extra config (browser, iMessage) |
| Same setup works everywhere | Small performance overhead |
| Can restrict network access | Need to explicitly mount directories you want shared |
| Production-ready isolation | |

**Best for:** Security-conscious users, running on a shared machine, or production/server deployments.

#### Running on a VPS (Hosted Elsewhere)

| Pros | Cons |
|------|------|
| Always online 24/7 | Costs money (unless free tier) |
| Your laptop can be off | Can't use iMessage or local browser |
| Physically separated from your personal data | Need to manage a remote server |
| If compromised, your personal machine is safe | API keys stored on the server |
| Professional-grade uptime | SSH tunnel needed for control UI |

**Best for:** Always-on bots, WhatsApp/Discord/Telegram bots that need to respond at 3am.

---

### How to Lock Things Down (Sandbox Mode)

Even without Docker, Kolb-Bot has a built-in sandbox system that restricts what agents can do. You configure this in `~/.kolb-bot/kolb-bot.json`:

#### Restrict which tools agents can use:

```json5
{
  "agents": {
    "defaults": {
      "toolPolicy": {
        // Only allow these tools (deny everything else)
        "allow": ["read", "write", "edit", "exec"],
        // Or explicitly deny specific tools
        "deny": ["browser", "canvas", "nodes"]
      }
    }
  }
}
```

#### Enable Docker sandboxing for agent commands:

```json5
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "all",
        "docker": {
          "image": "kolb-bot-sandbox:bookworm-slim",
          "network": "none",
          "readOnlyRoot": true,
          "memory": "1g",
          "cpus": 1
        }
      }
    }
  }
}
```

**What does this do?** Every command the AI agent runs gets executed inside a throwaway Docker container instead of on your real machine. The container has no network access (`"none"`), limited memory, and a read-only filesystem. It's like giving the AI a scratch pad that gets thrown away after each use.

#### Restrict who can message your bot:

```json5
{
  "channels": {
    "whatsapp": {
      "allowFrom": ["+15555550123"],
      "dmPolicy": "pairing"
    },
    "discord": {
      "allowFrom": ["your-discord-user-id"]
    }
  }
}
```

This ensures only YOU can talk to your bot — nobody else.

#### Keep the gateway locked to localhost:

```json5
{
  "gateway": {
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "a-very-long-random-string-here"
    }
  }
}
```

**What does `loopback` mean?** It means the gateway only accepts connections from the same machine. Nobody on the internet or your local network can reach it. If you need remote access, use an SSH tunnel (explained above) instead of opening the port.

#### Run a security audit:

```bash
kolb-bot security audit --deep
```

This checks your entire setup and flags anything risky — exposed ports, weak auth, overly permissive tool policies, etc. Run this after any configuration change.

---

### Quick Security Checklist

- [ ] Gateway bind is set to `loopback` (not `lan` or a public IP)
- [ ] Gateway auth token is set and is long/random
- [ ] Channel `allowFrom` lists only your phone number / user ID
- [ ] If on a VPS, access is via SSH tunnel (not exposed to internet)
- [ ] If using Docker, only `~/.kolb-bot/` is mounted (not your home dir)
- [ ] Run `kolb-bot security audit` and address any warnings
- [ ] API keys are stored in `~/.kolb-bot/` (not in the repo or public files)

---

## License

MIT — do whatever you want with it.
