import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, type WebSocket } from "ws";

export const RELAY_WS_PATH = "/relay";

export interface RelayClient {
  ws: WebSocket;
  connectedAt: number;
}

const clients = new Set<RelayClient>();

export function createRelayWss(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: WebSocket) => {
    const client: RelayClient = { ws, connectedAt: Date.now() };
    clients.add(client);

    const keepAlive = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }, 25_000);

    ws.on("close", () => {
      clients.delete(client);
      clearInterval(keepAlive);
    });

    ws.on("error", () => {
      clients.delete(client);
      clearInterval(keepAlive);
    });

    ws.send(JSON.stringify({ type: "connected", ts: Date.now() }));
  });

  return wss;
}

export function handleRelayUpgrade(
  wss: WebSocketServer,
  req: IncomingMessage,
  socket: Duplex,
  head: Buffer,
): boolean {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname !== RELAY_WS_PATH) {
    return false;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
  return true;
}

export function getRelayClients(): Set<RelayClient> {
  return clients;
}

export function relayToolCall(
  toolName: string,
  params: Record<string, unknown>,
  timeoutMs = 30_000,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const client = [...clients].find((c) => c.ws.readyState === c.ws.OPEN);
    if (!client) {
      reject(new Error("No relay client connected"));
      return;
    }

    const callId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Relay tool call timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    const handler = (data: Buffer | string) => {
      try {
        const msg = JSON.parse(String(data));
        if (msg.callId === callId) {
          cleanup();
          if (msg.error) {
            reject(new Error(msg.error));
          } else {
            resolve(msg.result);
          }
        }
      } catch {
        // ignore parse errors from other messages
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      client.ws.off("message", handler);
    };

    client.ws.on("message", handler);
    client.ws.send(JSON.stringify({ type: "tool_call", callId, tool: toolName, params }));
  });
}
