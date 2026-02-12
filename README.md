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

## Security: Lock It Down (Read This Early)

Kolb-Bot runs on your machine with the same permissions you have. That means it can read files, run commands, and send messages. This is what makes it powerful — but it also means you need to lock it down properly.

### The Threat Model

When you give Kolb-Bot access to a messaging app, anyone who can message it can potentially tell it to do things. The default setup protects against this, but you should understand the layers:

1. **Your AI can execute shell commands** — it reads/writes files, runs programs, and sends messages on your behalf
2. **Message senders can try to trick the AI** — prompt injection, social engineering, probing your setup
3. **The golden rule: access control comes before intelligence** — lock down who can talk to your bot before worrying about what it says

### Default Protections (Already On)

- **Pairing mode** for DMs — unknown senders get a one-time pairing code, not direct access
- **Gateway binds to localhost** — nobody on the internet can reach it without you exposing it
- **File permissions** — `~/.kolb-bot/` is restricted to your user account

### Recommended Hardening

Run the security audit to see where you stand:

```bash
kolb-bot security audit --deep
```

To auto-apply basic guardrails:

```bash
kolb-bot security audit --fix
```

**Lock down DMs to known contacts only:**

```bash
kolb-bot config set session.dmScope per-channel-peer
```

This prevents cross-user context leakage — each person gets their own isolated session.

**Set a gateway token** (required if you expose the gateway on your network):

```bash
kolb-bot config set gateway.auth.token "$(openssl rand -hex 32)"
```

**Review exec approvals** — control what commands the bot can run on your machine:

```bash
kolb-bot approvals get                                    # See current policy
kolb-bot approvals allowlist add "/usr/bin/git"           # Allow specific commands
kolb-bot approvals allowlist add "~/Projects/**/bin/*"    # Allow with glob patterns
```

**Sandbox untrusted sessions** — isolate tool execution in Docker containers:

```bash
kolb-bot config set agents.defaults.sandbox.mode all
```

See the [Isolated Environment](#installing-in-an-isolated-environment-docker) section below for full Docker setup.

### File Permission Check

Make sure your config directory is locked down:

```bash
chmod 700 ~/.kolb-bot
chmod 600 ~/.kolb-bot/kolb-bot.json
```

The `kolb-bot doctor` command checks this automatically.

### For Multi-User Setups

If multiple people will message your bot (family, team, etc.), consider per-agent access profiles:

- **Personal agent** — full access, no sandbox
- **Shared/family agent** — sandboxed, read-only tools
- **Public-facing agent** — sandboxed, no filesystem/shell tools at all

Configure this in `~/.kolb-bot/kolb-bot.json` under `agents.list[]` — each agent can have its own sandbox policy, tool restrictions, and sender allowlists.

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

### Which Install Method? (npm vs brew vs git vs pnpm)

During setup, Kolb-Bot may ask you to pick a preferred install command. Here's what each one means:

| Method | What It Does | Best For |
| --- | --- | --- |
| **npm** (recommended) | Installs a pre-built version from the npm registry. No source code on your machine. | Most people. Fastest, simplest, easiest to update. |
| **brew** (Mac only) | Installs via Homebrew (`brew install kolb-bot`). Homebrew manages updates alongside your other Mac packages. | Mac users who already use Homebrew for everything. |
| **git** | Clones the full source code and builds it locally with pnpm. | Developers, tinkerers, and anyone who wants to read or patch the code. |
| **pnpm** (from source) | Runs directly from an existing source checkout via `pnpm kolb-bot ...`. | Contributors actively working on Kolb-Bot itself. |

**If you're not sure, pick npm.** It installs in seconds and updates with one command (`kolb-bot update`).

**What is Homebrew?** Homebrew (`brew`) is a popular package manager for Mac. If you don't have it, you can install it with:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

The Kolb-Bot installer script will also install Homebrew for you on Mac if it's missing (it needs it to set up Node.js and Git).

**One-liner install (npm method):**

```bash
curl -fsSL https://kolb-bot.bot/install.sh | bash
```

This downloads and installs the latest release globally. No git clone, no build step. You can start using `kolb-bot` immediately after it finishes.

**One-liner install (git method):**

```bash
curl -fsSL https://kolb-bot.bot/install.sh | bash -s -- --install-method git
```

This clones the repo to `~/kolb-bot`, installs dependencies, builds from source, and puts a wrapper script at `~/.local/bin/kolb-bot`.

**Already did the manual setup above?** That's the git/pnpm method. You're all set — skip the one-liners.

**Switching between methods later:**

You can change your mind anytime without losing your config, sessions, or workspace data. Everything in `~/.kolb-bot/` stays intact:

```bash
# Switch from git to npm:
npm install -g kolb-bot@latest
kolb-bot doctor            # Detects the change and offers to update the service config
kolb-bot gateway restart

# Switch from npm to git:
git clone https://github.com/kolbick/Kolb-Bot.git ~/kolb-bot
cd ~/kolb-bot && pnpm install && pnpm build
kolb-bot doctor
kolb-bot gateway restart
```

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

## Installing AI CLIs (Optional Power Tools)

Kolb-Bot can use external AI coding tools as skills. These are separate programs you install alongside Kolb-Bot — each one gives the bot extra capabilities. You don't need any of these to use Kolb-Bot, but they're great if you want to use it for coding tasks.

### Gemini CLI (Free)

Google's command-line tool for Gemini. Great for quick Q&A, summaries, and code generation.

**Mac:**

```bash
brew install gemini-cli
```

**Linux / Windows (WSL):**

```bash
npm install -g @anthropic-ai/gemini-cli
```

**First-time setup** — sign in once:

```bash
gemini
```

It opens your browser to authenticate with your Google account. After that, Kolb-Bot's `gemini` skill can use it automatically.

**Usage with Kolb-Bot:**

```bash
kolb-bot skills info gemini        # Check if it's detected
```

### Claude Code (Paid — Anthropic)

Anthropic's interactive coding agent. Excellent for complex code tasks, refactoring, and multi-file edits.

**Install:**

```bash
npm install -g @anthropic-ai/claude-code
```

**First-time setup:**

```bash
claude
```

It opens your browser to authenticate with your Anthropic account (requires a paid plan).

**Usage with Kolb-Bot:**

The `coding-agent` skill automatically detects Claude Code. It runs in the background with PTY mode:

```bash
kolb-bot skills info coding-agent  # Check if it's detected
```

### Codex CLI (Paid — OpenAI)

OpenAI's command-line coding agent. Supports full-auto mode where it executes without asking for approval.

**Install:**

```bash
npm install -g @openai/codex
```

**First-time setup:**

Set your OpenAI API key:

```bash
export OPENAI_API_KEY="your-key-here"
```

Or configure it in `~/.codex/config.toml`:

```toml
[auth]
api_key = "your-key-here"
```

**Key modes:**

```bash
codex "Build a REST API"                  # Interactive (asks before running commands)
codex exec --full-auto "Build a REST API" # Auto-approves everything
```

**Important:** Codex requires a git repository to run. If you need a scratch workspace:

```bash
SCRATCH=$(mktemp -d) && cd $SCRATCH && git init && codex exec "your task"
```

### Oracle (Paid — uses ChatGPT browser)

A prompt-bundling tool that feeds large codebases to GPT-5.2 Pro via the ChatGPT browser. Good for long-think tasks that need lots of context.

**Install:**

```bash
npm install -g @steipete/oracle
```

**Usage:**

```bash
oracle --dry-run summary -p "Explain this codebase" --file "src/**"    # Preview what gets sent
oracle --engine browser --model gpt-5.2-pro -p "Refactor auth" --file "src/**"  # Full run
```

### OpenCode

A curated coding CLI with multi-provider support.

**Install:**

```bash
npm install -g opencode-ai
```

**Usage:**

```bash
opencode run "Summarize the codebase"
```

### Pi Coding Agent (Built In)

Pi is already embedded in Kolb-Bot — no separate install needed. It powers the core agent loop and is the default coding engine. You can also use it standalone:

```bash
# Already available if you ran npm link during setup
pi -p "Your coding task"
```

### Quick Reference

| CLI | Install Command | Auth | Cost |
| --- | --- | --- | --- |
| **Gemini CLI** | `brew install gemini-cli` | Google sign-in | Free |
| **Claude Code** | `npm install -g @anthropic-ai/claude-code` | Anthropic account | Paid |
| **Codex CLI** | `npm install -g @openai/codex` | OpenAI API key | Paid |
| **Oracle** | `npm install -g @steipete/oracle` | ChatGPT browser | Paid |
| **OpenCode** | `npm install -g opencode-ai` | API key | Paid |
| **Pi** | Built into Kolb-Bot | Via `kolb-bot models auth` | Varies |

After installing any of these, run `kolb-bot skills check` to verify Kolb-Bot can see them.

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

Docker puts Kolb-Bot in a sealed box on your computer. It can't see your personal files or mess anything up. See the full section below.

---

## Installing in an Isolated Environment (Docker)

Running Kolb-Bot in Docker means it can't touch your personal files, your system, or anything outside its container. This is the recommended approach if you're running it on a shared machine, a VPS, or if you just want peace of mind.

### Prerequisites

Install Docker and Docker Compose:

- **Mac:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** `sudo apt update && sudo apt install -y docker.io docker-compose-v2` (then `sudo usermod -aG docker $USER` and re-login)
- **Windows (WSL):** Install Docker Desktop with WSL 2 backend enabled

### Quick Start

The repo includes a setup script that builds the image and configures everything:

```bash
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot
./docker-setup.sh
```

This builds the Docker image, creates the config directory, and starts the gateway.

### Manual Setup (Step by Step)

**1. Build the image:**

```bash
docker build -t kolb-bot:local .
```

Need extra system packages inside the container? Add them at build time:

```bash
docker build --build-arg KOLB_BOT_DOCKER_APT_PACKAGES="ffmpeg imagemagick" -t kolb-bot:local .
```

**2. Create your config directory:**

```bash
mkdir -p ~/.kolb-bot
```

**3. Set environment variables** (create a `.env` file in the Kolb-Bot directory):

```bash
KOLB_BOT_CONFIG_DIR=~/.kolb-bot
KOLB_BOT_WORKSPACE_DIR=~/.kolb-bot/workspace
KOLB_BOT_GATEWAY_TOKEN=your-secret-token-here
```

**4. Start with Docker Compose:**

```bash
docker compose up -d kolb-bot-gateway
```

**5. Run the setup wizard** (inside the container):

```bash
docker compose run --rm kolb-bot-cli onboard
```

**6. Run CLI commands:**

```bash
docker compose run --rm kolb-bot-cli models list
docker compose run --rm kolb-bot-cli doctor
docker compose run --rm kolb-bot-cli tui
```

### What the Container Looks Like

```
Host machine                     Docker container
~/.kolb-bot/  <-- bind mount --> /home/node/.kolb-bot/   (config + credentials)
                                 /app/                    (Kolb-Bot code, read-only)
                                 runs as 'node' user      (uid 1000, non-root)
                                 ports: 18789, 18790      (gateway + bridge)
```

- The container runs as a **non-root user** (`node`, uid 1000)
- Only `~/.kolb-bot/` is shared with the host — your other files are invisible to the bot
- The gateway binds to LAN by default in Docker (so you can reach it from the host), but requires a token

### Agent Sandboxing (Docker-in-Docker Isolation)

For even deeper isolation, Kolb-Bot can run each agent's tool execution in its own throwaway Docker container. This means even if the AI tries to run something dangerous, it's trapped in a minimal sandbox with no network, no capabilities, and resource limits.

**Enable sandboxing for all sessions:**

```bash
kolb-bot config set agents.defaults.sandbox.mode all
```

**Default sandbox settings** (these are already pretty locked down):

| Setting | Default | What It Does |
| --- | --- | --- |
| `network` | `none` | No internet access from sandbox |
| `user` | `1000:1000` | Non-root |
| `capDrop` | `ALL` | No Linux capabilities |
| `readOnlyRoot` | `true` | Can't modify the filesystem |
| `pidsLimit` | `256` | Limits processes |
| `memory` | `1g` | RAM limit |
| `cpus` | `1` | CPU limit |

**Manage sandbox containers:**

```bash
kolb-bot sandbox explain                  # Show effective sandbox policy
kolb-bot sandbox list                     # List running sandbox containers
kolb-bot sandbox recreate --all           # Rebuild containers after config changes
```

**Workspace access modes** — control what the sandbox can see:

| Mode | What the Sandbox Sees |
| --- | --- |
| `none` (default) | Only its own scratch directory |
| `ro` | Agent workspace mounted read-only at `/agent` |
| `rw` | Agent workspace mounted read/write at `/workspace` |

### Running on a VPS with Docker

For a fully hands-off setup on a cloud server:

```bash
# SSH into your server
ssh user@your-server

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# Clone and build
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot
docker build -t kolb-bot:local .

# Create config and set a strong gateway token
mkdir -p ~/.kolb-bot
export KOLB_BOT_GATEWAY_TOKEN=$(openssl rand -hex 32)
echo "KOLB_BOT_GATEWAY_TOKEN=$KOLB_BOT_GATEWAY_TOKEN" >> .env
echo "KOLB_BOT_CONFIG_DIR=$HOME/.kolb-bot" >> .env
echo "KOLB_BOT_WORKSPACE_DIR=$HOME/.kolb-bot/workspace" >> .env

# Run the setup wizard (use API key auth — no browser on a server)
docker compose run --rm kolb-bot-cli onboard --auth-choice gemini-api-key

# Start the gateway in the background
docker compose up -d kolb-bot-gateway
```

---

## License

MIT — do whatever you want with it.
