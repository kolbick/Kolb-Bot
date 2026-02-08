# ☠️ Kolb-Bot

<p align="center">
    <img src="assets/kolb-bot-logo.png" alt="Kolb-Bot" width="400">
</p>

<p align="center">
  <strong>Your Personal AI Pirate Assistant</strong>
</p>

<p align="center">
  <a href="https://github.com/kolbick/Kolb-Bot"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

---

## About

**Kolb-Bot** is the culmination of months of Kolby's work with local and open-source AI projects. What started as tinkering with self-hosted models and hacking together scripts evolved into a full-blown personal AI assistant platform that runs on your own devices and talks to you across every channel you already use.

This project is built on top of the open-source [OpenClaw](https://github.com/openclaw/openclaw) gateway framework, rebranded and customized as Kolb-Bot -- a pirate-themed personal AI assistant with personality.

## What It Does

Kolb-Bot is a personal AI assistant you run locally. It connects to the channels you already use:

- **Messaging**: WhatsApp, Telegram, Signal, iMessage, Discord, Slack, Microsoft Teams, Google Chat
- **Extended**: Matrix, BlueBubbles, Zalo, Mattermost, Nostr, Line, Feishu
- **Native Apps**: macOS, iOS, Android
- **Web**: Browser extension, WebChat, Canvas

The Gateway is the control plane. The assistant is the product. You own your data, you pick your models, and it runs on your hardware.

## Why It Exists

Kolby wanted a single assistant that:

- Runs locally and stays always-on
- Works across every messaging platform without vendor lock-in
- Supports any LLM provider (Anthropic, OpenAI, local models via Ollama, and more)
- Is extensible with skills, plugins, and custom workflows
- Doesn't send your data to someone else's cloud

Months of experimenting with local LLMs, open-source tools, and AI pipelines led to this -- a unified platform that brings it all together.

## Quick Start

Runtime: **Node >= 22**

```bash
npm install -g kolb-bot@latest

kolb-bot onboard --install-daemon
```

The onboarding wizard walks you through setting up the gateway, workspace, channels, and skills.

```bash
# Start the gateway
kolb-bot gateway --port 18789 --verbose

# Talk to your assistant
kolb-bot agent --message "What's on the agenda today?" --thinking high

# Send a message via WhatsApp
kolb-bot message send --to +1234567890 --message "Ahoy from Kolb-Bot"
```

## Models

Kolb-Bot works with any LLM provider:

- **Anthropic** (Claude) -- recommended for long-context and prompt-injection resistance
- **OpenAI** (GPT / Codex)
- **Local models** via Ollama, llama.cpp, and other local inference engines
- **Google Gemini**, **AWS Bedrock**, **Azure OpenAI**, and more

## Install

Works with npm, pnpm, or bun. Runs on **macOS, Linux, and Windows (via WSL2)**.

```bash
npm install -g kolb-bot@latest
# or
pnpm add -g kolb-bot@latest
```

## Development

```bash
git clone https://github.com/kolbick/Kolb-Bot.git
cd Kolb-Bot
pnpm install
pnpm build
pnpm dev
```

## Skills & Extensions

Kolb-Bot ships with 50+ skills and 25+ channel extensions out of the box. Add your own by dropping a plugin into the `skills/` or `extensions/` directory.

## Credits

- Built on top of [OpenClaw](https://github.com/openclaw/openclaw) (MIT License)
- AI agent framework by [@mariozechner](https://github.com/mariozechner) (pi-agent)
- Months of Kolby's late-night hacking with local AI and open-source projects

## License

MIT
