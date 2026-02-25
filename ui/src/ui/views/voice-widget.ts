import { html, nothing } from "lit";
import type { AppViewState } from "../app-view-state.ts";

const micIcon = html`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
      d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21h2v-3.07A7 7 0 0 0 19 11h-2Z"
    />
  </svg>
`;

function renderTranscript(state: AppViewState) {
  if (state.voiceMessages.length === 0) {
    return html`<div class="voice-transcript__empty">
      ${
        state.voiceStatus === "connected"
          ? "Listening\u2026 speak to begin"
          : "Press Talk to start a conversation"
      }
    </div>`;
  }
  return state.voiceMessages.map(
    (msg) => html`
      <div class="voice-msg voice-msg--${msg.source}">
        <span class="voice-msg__source">${msg.source === "user" ? "You" : "Agent"}</span>
        ${msg.text}
      </div>
    `,
  );
}

function renderSettings(state: AppViewState) {
  if (!state.voiceShowSettings) return nothing;
  return html`
    <div class="voice-settings">
      <label class="voice-settings__label">ElevenLabs Agent ID</label>
      <input
        class="voice-settings__input"
        type="text"
        .value=${state.voiceAgentId}
        @input=${(e: Event) => state.handleVoiceAgentIdChange((e.target as HTMLInputElement).value)}
        placeholder="agent_xxx"
        spellcheck="false"
      />
      <div class="voice-settings__hint">
        Get your Agent ID from the ElevenLabs dashboard.
      </div>
    </div>
  `;
}

export function renderVoiceWidget(state: AppViewState) {
  // Collapsed FAB
  if (!state.voiceExpanded) {
    const isActive = state.voiceStatus === "connected";
    return html`
      <button
        class="voice-fab ${isActive ? "voice-fab--active" : ""}"
        @click=${() => state.handleVoiceToggleExpanded()}
        title="Voice assistant"
        aria-label="Open voice assistant"
      >
        ${micIcon}
      </button>
    `;
  }

  // Expanded panel
  const isActive = state.voiceStatus === "connected";
  const isConnecting = state.voiceStatus === "connecting";
  const statusDotClass = isActive
    ? "voice-panel__status-dot--ok"
    : isConnecting
      ? "voice-panel__status-dot--warn"
      : "";
  const statusText = isActive
    ? state.voiceSpeaking
      ? "Speaking\u2026"
      : "Listening"
    : isConnecting
      ? "Connecting\u2026"
      : "Ready";

  return html`
    <div class="voice-panel">
      <div class="voice-panel__header">
        <span class="voice-panel__title">Voice</span>
        <div class="voice-panel__status">
          <span class="voice-panel__status-dot ${statusDotClass}"></span>
          ${statusText}
        </div>
        <div style="display:flex;gap:4px;">
          <button
            class="voice-panel__close"
            @click=${() => state.handleVoiceToggleSettings()}
            title="Settings"
          >\u2699</button>
          <button
            class="voice-panel__close"
            @click=${() => state.handleVoiceToggleExpanded()}
            title="Minimize"
          >\u2715</button>
        </div>
      </div>

      ${state.voiceError ? html`<div class="voice-warning">${state.voiceError}</div>` : nothing}

      <div class="voice-talk">
        <button
          class="voice-talk__btn ${isActive ? "voice-talk__btn--active" : ""}"
          @click=${() => (isActive ? state.handleVoiceStop() : state.handleVoiceStart())}
          ?disabled=${isConnecting}
        >
          ${isActive ? "Stop" : isConnecting ? "\u2026" : "Talk"}
        </button>
        <div class="voice-talk__status">
          ${
            isActive
              ? state.voiceSpeaking
                ? "Agent is speaking\u2026"
                : "Listening\u2026"
              : isConnecting
                ? "Connecting\u2026"
                : ""
          }
        </div>
      </div>

      <div class="voice-transcript">
        ${renderTranscript(state)}
      </div>

      ${renderSettings(state)}
    </div>
  `;
}
