import { Conversation } from "@11labs/client";

export interface VoiceMessage {
  id: string;
  text: string;
  source: "user" | "agent";
}

export type VoiceStatus = "disconnected" | "connecting" | "connected";

export interface VoiceCallbacks {
  onStatusChange: (status: VoiceStatus) => void;
  onMessage: (msg: VoiceMessage) => void;
  onError: (err: string) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

let conversation: Conversation | null = null;

export async function startVoiceSession(agentId: string, callbacks: VoiceCallbacks): Promise<void> {
  if (conversation) {
    await conversation.endSession();
    conversation = null;
  }

  callbacks.onStatusChange("connecting");

  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    callbacks.onError("Microphone permission denied");
    callbacks.onStatusChange("disconnected");
    return;
  }

  try {
    conversation = await Conversation.startSession({
      agentId,
      onConnect: () => {
        callbacks.onStatusChange("connected");
      },
      onDisconnect: () => {
        callbacks.onStatusChange("disconnected");
        conversation = null;
      },
      onMessage: ({ message, source }: { message: string; source: string }) => {
        callbacks.onMessage({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          text: message,
          source: source === "user" ? "user" : "agent",
        });
      },
      onError: (err: unknown) => {
        callbacks.onError(String(err));
      },
      onStatusChange: ({ status }: { status: string }) => {
        if (status === "speaking") {
          callbacks.onSpeakingChange(true);
        } else if (status === "listening") {
          callbacks.onSpeakingChange(false);
        }
      },
    });
  } catch (err) {
    callbacks.onError(`Failed to start voice session: ${String(err)}`);
    callbacks.onStatusChange("disconnected");
  }
}

export async function endVoiceSession(): Promise<void> {
  if (conversation) {
    await conversation.endSession();
    conversation = null;
  }
}

export function getVoiceConversation(): Conversation | null {
  return conversation;
}
