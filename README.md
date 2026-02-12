# Kolb-Bot

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

## How Does It Work? (The Simple Version)

```
You send a message from your phone (WhatsApp, Discord, etc.)
       |
       v
Kolb-Bot (running on your computer) receives it
       |
       v
Kolb-Bot asks an AI service (like Google Gemini) for a response
       |
       v
The AI's answer gets sent back to you as a reply
```

That's it. Your computer acts as the middleman between you and the AI.

**Important:** Kolb-Bot only works while your computer is turned on and connected to the internet. Close the lid on your laptop? Kolb-Bot goes to sleep too. (There are ways around this — see the "Advanced" section later.)

---

## Before We Start: What's a "Terminal"?

Every computer has a built-in app where you can type commands instead of clicking buttons. It looks like a black window with text. You'll need to use it to set up Kolb-Bot.

**How to open it:**

- **Mac:** Press `Cmd + Space`, type "Terminal", hit Enter
- **Windows:** See the Windows section below (you need an extra step first)
- **Linux:** Press `Ctrl + Alt + T`

Don't worry if you've never used it — this guide tells you exactly what to type, and you can just copy and paste each command.

---

## What You Need to Install First

Before Kolb-Bot can run, your computer needs three programs. Think of them as tools that Kolb-Bot needs to work — like how a printer needs ink and paper.

### 1. Git — Downloads the Kolb-Bot code

Git is a program that downloads code from the internet. You'll use it once to grab Kolb-Bot.

**Check if you already have it** (type this in your terminal):

```bash
git --version
```

If you see a version number (like `git version 2.39.0`), you already have it. Skip to the next section.

If you got an error, install it:

**Mac:**

```bash
xcode-select --install
```

A window will pop up asking you to install. Click "Install" and wait for it to finish.

**Linux (Ubuntu/Debian):**

```bash
sudo apt update && sudo apt install -y git
```

It may ask for your password — type it in (you won't see the characters as you type, that's normal).

**Windows:**
Windows needs an extra step. Kolb-Bot runs inside a mini Linux environment called WSL:

1. Click the Start button, search for "PowerShell"
2. Right-click it and choose "Run as Administrator"
3. Type: `wsl --install` and press Enter
4. Restart your computer when it asks
5. After restarting, open "Ubuntu" from your Start menu — this is your terminal for everything below
6. Inside Ubuntu, type: `sudo apt update && sudo apt install -y git`

**Everything from here on should be typed inside Ubuntu on Windows.**

---

### 2. Node.js (version 22 or newer) — Runs the Kolb-Bot code

Node.js is the program that actually makes Kolb-Bot work. Kolb-Bot's code is written in a programming language called JavaScript, and Node.js is what reads and runs that code. (You don't need to know JavaScript — just think of Node.js as the engine.)

**Check if you already have it:**

```bash
node --version
```

If you see `v22` or higher (like `v22.5.1`), you're good. Skip ahead.

If not, install it:

**Mac:**

```bash
# First, install Homebrew (a tool that installs other tools — ironic, I know):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Node.js:
brew install node@22
```

**Linux / Windows (inside Ubuntu):**

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify it worked:**

```bash
node --version
```

You should see `v22.something`.

---

### 3. pnpm — Installs Kolb-Bot's building blocks

Kolb-Bot is made up of thousands of small building blocks (called "packages") made by other developers. pnpm is the tool that downloads all of them for you. Think of it like an app store, but for code.

**Install it** (this works on all systems):

```bash
npm install -g pnpm
```

**Verify:**

```bash
pnpm --version
```

You should see a version number. If so, you're ready.

---

## Setting Up Kolb-Bot

Now the fun part. This is a one-time setup — once it's done, you won't need to do it again.

### Step 1: Download and Build

Copy and paste these commands one at a time into your terminal:

```bash
# Download Kolb-Bot's code from the internet
git clone https://github.com/kolbick/Kolb-Bot.git

# Go into the Kolb-Bot folder
cd Kolb-Bot

# Download all the building blocks it needs (takes a few minutes)
pnpm install

# Build Kolb-Bot (turns the source code into something your computer can run)
pnpm build
```

**What just happened?**

- `git clone` downloaded the Kolb-Bot project to a folder on your computer
- `pnpm install` downloaded about 1,000 code packages that Kolb-Bot depends on
- `pnpm build` assembled everything into a working program

**One more thing — make `kolb-bot` available as a command:**

```bash
npm link
```

Now you can type `kolb-bot` from anywhere on your computer.

---

### Step 2: Connect It to a Free AI

Kolb-Bot needs an AI "brain" to generate responses. We'll use **Google Gemini** because it's free — you can send hundreds of messages per day without paying.

**The easiest way (just sign into Google):**

```bash
kolb-bot onboard --auth-choice google-gemini-cli
```

This will:

1. Open your web browser
2. Ask you to sign into your Google account
3. That's it — Kolb-Bot can now use Google's AI for free

**Alternative: Use an API key instead.**

An API key is like a password that lets Kolb-Bot talk to Google's AI. If you'd rather use a key instead of signing in:

1. Go to https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key (it looks like a long random string of letters and numbers)
4. Run:

```bash
kolb-bot onboard --auth-choice gemini-api-key
```

5. Paste your key when it asks

Both options are free. The first one is easier because there's no key to keep track of.

---

### Step 3: Run the Setup Wizard

If you already ran `kolb-bot onboard` above, you may have already gone through the full setup. If not:

```bash
kolb-bot onboard
```

The wizard walks you through everything with prompts. Here's what it asks:

1. **Security notice** — Read it and accept
2. **Setup mode** — Pick "QuickStart" (it uses good defaults so you don't have to make decisions)
3. **Where to store data** — Just press Enter to accept the default
4. **AI setup** — Already done if you completed Step 2
5. **Gateway** — This is the part of Kolb-Bot that runs in the background and listens for messages. Just press Enter to accept the defaults.
6. **Connect messaging apps** — This is where you connect WhatsApp, Discord, etc. (see below)
7. **Start automatically** — Say yes. This means Kolb-Bot starts up whenever you turn on your computer.

---

### Step 4: Connect Your Messaging Apps

You can connect as many or as few apps as you want. Here are the most popular ones:

**WhatsApp:**

- The setup wizard shows a QR code in your terminal
- On your phone: open WhatsApp > Settings > Linked Devices > Link a Device
- Point your phone's camera at the QR code on your screen
- Done! Kolb-Bot is now on your WhatsApp

**Discord:**

- Go to https://discord.com/developers/applications
- Click "New Application" and give it a name
- Click "Bot" on the left, then "Add Bot"
- Copy the token and paste it when the wizard asks
- The wizard gives you a link to invite the bot to your Discord server

**Telegram:**

- Open Telegram on your phone
- Search for @BotFather and start a chat
- Send `/newbot` and follow the instructions to create a bot
- Copy the token it gives you and paste it in the wizard

**Other apps** (Signal, Slack, iMessage, Teams, Google Chat, etc.) — the wizard guides you through each one step by step.

---

### Step 5: Start Talking!

**From your computer:**

```bash
kolb-bot tui
```

This opens a chat window right in your terminal. Type a message and hit Enter.

**From your phone:**
Just send a message to Kolb-Bot on whatever app you connected — WhatsApp, Discord, Telegram, etc. It responds just like texting a friend.

---

## Everyday Commands

Once Kolb-Bot is set up, here are the commands you'll actually use:

| What You Want to Do                  | What to Type                                    |
| ------------------------------------ | ----------------------------------------------- |
| Chat with Kolb-Bot in your terminal  | `kolb-bot tui`                                  |
| Send a quick one-off question        | `kolb-bot agent --message "your question here"` |
| Check if everything's working        | `kolb-bot gateway status`                       |
| Start Kolb-Bot (if it's not running) | `kolb-bot gateway start`                        |
| Stop Kolb-Bot                        | `kolb-bot gateway stop`                         |
| Restart Kolb-Bot                     | `kolb-bot gateway restart`                      |
| Fix problems automatically           | `kolb-bot doctor --fix`                         |
| See what AI models you can use       | `kolb-bot models list`                          |
| Switch to a different AI model       | `kolb-bot models set gemini`                    |
| Update to the newest version         | `kolb-bot update`                               |
| Re-run the setup wizard              | `kolb-bot onboard`                              |
| See all available commands           | `kolb-bot --help`                               |

---

## Switching Which AI Kolb-Bot Uses

Kolb-Bot isn't locked to one AI. You can switch between different ones anytime:

```bash
# See what's available
kolb-bot models list
```

| AI                                 | Command                            | Cost |
| ---------------------------------- | ---------------------------------- | ---- |
| Google Gemini 3 Pro                | `kolb-bot models set gemini`       | Free |
| Google Gemini 3 Flash (faster)     | `kolb-bot models set gemini-flash` | Free |
| Anthropic Claude Opus (very smart) | `kolb-bot models set opus`         | Paid |
| Anthropic Claude Sonnet            | `kolb-bot models set sonnet`       | Paid |
| OpenAI GPT                         | `kolb-bot models set gpt`          | Paid |
| OpenAI GPT Mini (cheaper)          | `kolb-bot models set gpt-mini`     | Paid |

For paid models, you'll need to sign up with that company and get an access key. The free Google Gemini models work great for most people.

---

## Something Not Working?

Run this:

```bash
kolb-bot doctor
```

It checks everything and tells you exactly what's wrong in plain English. To let it try to fix things automatically:

```bash
kolb-bot doctor --fix
```

### Common Problems

**"Command not found: kolb-bot"**
Go back to the Kolb-Bot folder and run `npm link` again. Then close your terminal and open a new one.

**"Gateway not reachable"**
Kolb-Bot isn't running. Start it: `kolb-bot gateway start`

**WhatsApp stopped working**
The connection expired. Run `kolb-bot onboard` and scan the QR code again.

**"Auth token expired"**
Your AI access expired. Run `kolb-bot doctor --fix` or re-run `kolb-bot onboard`.

**The build failed**
Make sure you have Node.js version 22 or higher: `node --version`. If it's older, update Node.js (see the install instructions above).

---

## CLI Reference

Everything you can do with `kolb-bot` from the terminal. Run any command with `--help` for full details.

### Models

```bash
kolb-bot models list                       # See all available AI models
kolb-bot models set <model>                # Switch to a different model
kolb-bot models set-image <model>          # Set the image generation model
kolb-bot models status                     # Show your current model config
kolb-bot models scan                       # Scan for free models on OpenRouter
kolb-bot models aliases add <alias> <model>  # Create a shortcut name for a model
kolb-bot models aliases list               # List your aliases
kolb-bot models fallbacks add <model>      # Add a backup model if the main one fails
kolb-bot models auth add                   # Set up authentication for a provider
kolb-bot models auth login                 # Log into a model provider
kolb-bot models auth paste-token           # Paste an API key directly
```

### Skills

Skills are add-on abilities that extend what Kolb-Bot can do. Many work through CLI tools installed on your machine.

```bash
kolb-bot skills list                       # See all available skills
kolb-bot skills list --eligible            # Show only skills you can use right now
kolb-bot skills info <skill-name>          # Get details about a specific skill
kolb-bot skills check                      # Verify skill dependencies are installed
```

**Popular skills:**

| Skill | What It Does |
| --- | --- |
| `coding-agent` | Run Codex CLI, Claude Code, or other coding agents in the background |
| `github` | Interact with GitHub issues, PRs, and CI runs |
| `tmux` | Remote-control tmux sessions with keystrokes and pane scraping |
| `discord` | Send messages, react, manage threads, create polls on Discord |
| `slack` | React to messages, pin/unpin items in Slack |
| `1password` | Read and inject secrets from 1Password |
| `apple-notes` | Create, view, edit, and search Apple Notes |
| `notion` | Create and manage Notion pages and databases |
| `obsidian` | Work with Obsidian vaults |
| `weather` | Get weather forecasts (no API key needed) |
| `sag` | Text-to-speech via ElevenLabs |
| `summarize` | Summarize URLs, podcasts, and local files |
| `clawhub` | Search and install community skills from ClawHub |
| `spotify-player` | Control Spotify playback from the terminal |
| `camsnap` | Capture frames from RTSP/ONVIF cameras |
| `nano-pdf` | Edit PDFs with natural-language instructions |
| `himalaya` | Manage email via IMAP/SMTP |
| `gog` | Google Workspace CLI (Gmail, Calendar, Drive, Sheets) |
| `voice-call` | Start voice calls via the voice-call plugin |
| `imsg` | Send and read iMessages from the terminal |

### Gateway & Daemon

```bash
kolb-bot gateway start                     # Start the background gateway server
kolb-bot gateway stop                      # Stop it
kolb-bot gateway restart                   # Restart it
kolb-bot gateway status                    # Check if it's running and healthy
kolb-bot gateway dev                       # Start in dev mode (verbose logging)
kolb-bot logs                              # View live gateway logs
kolb-bot logs --tail 50                    # Show the last 50 log lines
```

### Agents & Sessions

```bash
kolb-bot agent --message "Hello"           # Send a one-off message
kolb-bot agent --message "Hi" --local      # Run the agent locally (skip gateway)
kolb-bot agents list                       # List configured agents
kolb-bot sessions                          # Show active sessions
kolb-bot tui                               # Open the interactive terminal chat
kolb-bot tui --session <key>               # Open a specific session
```

### Memory

```bash
kolb-bot memory list                       # List memory files
kolb-bot memory status                     # Show memory index status
kolb-bot memory search "some topic"        # Search memory for a topic
kolb-bot memory info <file>                # Show details about a memory file
kolb-bot memory export                     # Export memory data
```

### Channels & Messaging

```bash
kolb-bot channels list                     # List connected messaging apps
kolb-bot channels add                      # Connect a new messaging app
kolb-bot pairing list                      # Show paired devices
kolb-bot message send --to <target> "Hi"   # Send a message through a channel
```

### Hooks & Cron

```bash
kolb-bot hooks list                        # List available lifecycle hooks
kolb-bot hooks enable <name>               # Enable a hook
kolb-bot hooks disable <name>              # Disable a hook
kolb-bot cron list                         # List scheduled jobs
kolb-bot cron add                          # Add a new scheduled job (interactive)
kolb-bot cron status                       # Show cron job status
```

### Browser Automation

```bash
kolb-bot browser manage launch             # Launch the built-in browser
kolb-bot browser manage close              # Close it
kolb-bot browser inspect screenshot        # Take a screenshot of the current page
kolb-bot browser actions input click       # Click an element
kolb-bot browser actions input type "text" # Type into the focused element
kolb-bot browser state cookies list        # List cookies
```

### Plugins

```bash
kolb-bot plugins list                      # List installed plugins
kolb-bot plugins install <name>            # Install a plugin
kolb-bot plugins update                    # Update all plugins
```

### Security & Maintenance

```bash
kolb-bot doctor                            # Run health checks
kolb-bot doctor --fix                      # Auto-fix problems
kolb-bot security audit                    # Basic security scan
kolb-bot security audit --deep             # Deep security scan
kolb-bot update                            # Update Kolb-Bot to the latest version
kolb-bot reset                             # Reset config/state (keeps CLI installed)
kolb-bot config get <key>                  # Read a config value
kolb-bot config set <key> <value>          # Set a config value
kolb-bot completion                        # Generate shell tab-completion script
```

---

## Where Kolb-Bot Saves Its Files

Everything Kolb-Bot creates lives in a hidden folder called `.kolb-bot` in your home directory:

```
~/.kolb-bot/
    kolb-bot.json     <- Settings file
    workspace/        <- Where the bot stores its working files
    credentials/      <- Login info for AI services (keep this private!)
    agents/           <- Bot personality and behavior settings
```

The `~` means your home folder. On Mac that's `/Users/yourname/`, on Linux it's `/home/yourname/`.

---

## Supported Messaging Apps

| App             | Works? | Notes                                  |
| --------------- | ------ | -------------------------------------- |
| WhatsApp        | Yes    | Scan QR code to connect                |
| Discord         | Yes    | Create a bot at discord.com/developers |
| Telegram        | Yes    | Create a bot via @BotFather            |
| Slack           | Yes    |                                        |
| Signal          | Yes    |                                        |
| iMessage        | Yes    | Mac only                               |
| Microsoft Teams | Yes    |                                        |
| Google Chat     | Yes    |                                        |
| Matrix          | Yes    |                                        |
| Line            | Yes    |                                        |
| Twitch          | Yes    |                                        |
| Nostr           | Yes    |                                        |
| BlueBubbles     | Yes    |                                        |
| Mattermost      | Yes    |                                        |
| Zalo            | Yes    |                                        |
| Feishu / Lark   | Yes    |                                        |
| Web browser     | Yes    | Built-in chat page                     |

## Supported AI Services

| AI Provider       | Models                      | Cost                         | Sign Up                                |
| ----------------- | --------------------------- | ---------------------------- | -------------------------------------- |
| **Google Gemini** | **Gemini 3 Pro, Flash**     | **Free**                     | **https://aistudio.google.com/apikey** |
| Anthropic         | Claude Opus, Sonnet, Haiku  | Paid                         | https://console.anthropic.com/         |
| OpenAI            | GPT-4, GPT-5, o1, o3        | Paid                         | https://platform.openai.com/           |
| Ollama            | Llama 3, Mistral, Phi, etc. | Free (runs on your computer) | https://ollama.com/                    |
| xAI               | Grok                        | Paid                         | https://x.ai/                          |
| OpenRouter        | 100+ models                 | Varies                       | https://openrouter.ai/                 |
| AWS Bedrock       | Claude, Titan, etc.         | Paid                         | https://aws.amazon.com/bedrock/        |

---

## Advanced: Keeping Kolb-Bot On 24/7

By default, Kolb-Bot only works when your computer is on. If you want it to respond to messages even at 3am, you have a few options:

### Option 1: Leave Your Computer On

The simplest approach. Just don't close the lid / don't shut down. Kolb-Bot runs as a background service, so you don't need to keep any windows open.

### Option 2: Use a Cloud Server (VPS)

A VPS is a small computer you rent in the cloud for a few dollars a month. It runs 24/7, so your bot never sleeps.

| Provider     | Price        | Notes             |
| ------------ | ------------ | ----------------- |
| Oracle Cloud | Free forever | Best free option  |
| Hetzner      | ~$4/month    | Great value       |
| DigitalOcean | $4/month     | Beginner-friendly |
| Fly.io       | ~$3/month    | Lightweight       |

The setup is the same as on your own computer — install Node.js, pnpm, clone Kolb-Bot, run the wizard. The only difference:

- You connect to the server remotely (using a tool called SSH — it's like remote desktop but text-only)
- Use the API key option for Google Gemini (the browser sign-in won't work on a server with no screen)

### Option 3: Docker (Extra Safety)

Docker puts Kolb-Bot in a sealed box on your computer. It can't see your personal files or mess anything up. Good if you're cautious. See the full Docker guide in the [docs](https://github.com/kolbick/Kolb-Bot/blob/main/docs).

---

## Security (Read This)

Kolb-Bot runs on your computer and has access to the same things you do. A few things to know:

- **Only you should be able to message your bot.** The setup wizard helps you configure this. If you skip it, anyone who knows your bot's username could send it commands.
- **Your AI keys are stored locally.** They're saved in `~/.kolb-bot/credentials/`. Don't share that folder with anyone.
- **The gateway only listens locally by default.** Other people on the internet can't connect to it unless you change the settings.

To run a security check:

```bash
kolb-bot security audit --deep
```

This scans your setup and tells you if anything looks risky.

---

## License

MIT — do whatever you want with it.
