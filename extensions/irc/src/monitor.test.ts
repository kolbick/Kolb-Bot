import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#kolb-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#kolb-bot",
      rawTarget: "#kolb-bot",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "kolb-bot-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "kolb-bot-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "kolb-bot-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "kolb-bot-bot",
      rawTarget: "kolb-bot-bot",
    });
  });
});
