# Voice Widget Design — Floating ElevenLabs Voice UI for Kolb-Bot Control UI

**Date:** 2026-02-25
**Status:** Approved

## Summary

Add a floating voice conversation widget to the Kolb-Bot Control UI that brings over the best features from the Kolb-Bot-Voice Electron app: ElevenLabs voice conversation, relay-based local tool execution, and a polished UI — all integrated natively into the existing Lit + Vite dashboard.

## Requirements

- Floating widget accessible from any tab (not a new tab)
- ElevenLabs voice conversation via `@11labs/client` vanilla JS SDK
- Push-to-talk button with transcript display
- Relay WebSocket endpoint (`/relay`) built into the gateway for local tool execution
- Visual design matches the existing Control UI theme (CSS variables)
- Configurable via `kolb-bot.json`

## Architecture

### Widget States

1. **Collapsed** — circular microphone button, bottom-right corner (56px), always visible
2. **Expanded** — panel (~350×450px) with talk button, transcript, relay status, settings
3. **Active** — expanded with pulsing talk button and live transcript

### Data Flow

```
User clicks Talk
  → @11labs/client requests mic permission
  → startSession({ agentId, connectionType: 'webrtc' })
  → Audio streams to ElevenLabs servers (WebRTC)
  → ElevenLabs processes speech, triggers tool calls
  → Tool calls route through MCP to voice-agent-mcp server
  → voice-agent-mcp forwards via /relay WebSocket
  → Gateway voice-relay.ts receives, executes tool locally
  → Result sent back through relay → ElevenLabs → voice response
  → Transcript messages arrive via onMessage callback
  → voice-widget.ts updates message list, auto-scrolls
```

### Component Design

The widget renders outside `<main>` in the app shell (same position as `renderExecApprovalPrompt` and `renderGatewayUrlConfirmation`), so it floats over all tab content.

Voice state lives in the main `KolbBotApp` class (not isolated in the component) so it can access gateway connection status, authenticated client, and persist settings.

## New Files

### UI (`ui/src/`)

| File                     | Purpose                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `ui/voice-widget.ts`     | Main render function — expand/collapse, talk button, status display |
| `ui/voice-transcript.ts` | Scrollable message list with user/agent bubbles                     |
| `ui/voice-settings.ts`   | Inline settings panel (Agent ID input, relay URL)                   |
| `controllers/voice.ts`   | ElevenLabs connection logic using `@11labs/client` vanilla JS SDK   |
| `styles/voice.css`       | All voice widget styling using existing CSS variables               |

### Gateway (`src/gateway/`)

| File             | Purpose                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------- |
| `voice-relay.ts` | WebSocket `/relay` endpoint — accepts connections, forwards tool calls, returns results |

## Modified Files

| File                          | Change                                           |
| ----------------------------- | ------------------------------------------------ |
| `ui/src/ui/app-render.ts`     | Add `${renderVoiceWidget(state)}` after line 963 |
| `ui/src/ui/app.ts`            | Add voice `@state()` properties                  |
| `ui/src/ui/app-view-state.ts` | Add voice state types                            |
| `ui/package.json`             | Add `@11labs/client` dependency                  |
| `ui/src/styles.css`           | Add `@import "./styles/voice.css"`               |
| `src/gateway/server.impl.ts`  | Register `/relay` WebSocket upgrade handler      |

## Configuration

New fields in `kolb-bot.json`:

```json
{
  "gateway": {
    "voice": {
      "enabled": true,
      "elevenlabsAgentId": "agent_xxx",
      "relay": {
        "enabled": true
      }
    }
  }
}
```

- `voice.enabled` — controls whether the widget renders
- `elevenlabsAgentId` — stored server-side, fetched by UI via `voice.config` RPC method
- `relay.enabled` — controls whether `/relay` WebSocket endpoint is active

## Styling

- Uses existing CSS variables: `--bg`, `--card`, `--accent`, `--text`, `--muted`, `--radius-md`, `--shadow-md`
- `position: fixed; bottom: 24px; right: 24px; z-index: 1000`
- Expanded panel: `--card` background, `--shadow-md` elevation
- Talk button: `--accent` color, CSS `@keyframes pulse` when active
- Transcript: user messages use subtle `--accent` tint, agent messages use `--card`
- Responsive: on mobile (<768px), expanded widget goes full-width at bottom

## Tool Execution

The relay reuses Kolb-Bot's existing tool execution infrastructure rather than porting the standalone `tools.js` from the Voice repo. This means tools inherit:

- Sandbox policies
- Exec approval system
- Access control
- All existing agent tools (browser automation, file ops, system commands, etc.)

## SDK Choice

Uses `@11labs/client` (vanilla JS) instead of `@elevenlabs/react` because the Control UI is built with Lit, not React. The vanilla SDK provides the same `Conversation` class with `startSession()`, `endSession()`, `onMessage`, `onConnect`, `onDisconnect` callbacks.
