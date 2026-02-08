import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".kolb-bot"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", KOLB_BOT_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".kolb-bot-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", KOLB_BOT_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".kolb-bot"));
  });

  it("uses KOLB_BOT_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", KOLB_BOT_STATE_DIR: "/var/lib/kolb-bot" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/kolb-bot"));
  });

  it("expands ~ in KOLB_BOT_STATE_DIR", () => {
    const env = { HOME: "/Users/test", KOLB_BOT_STATE_DIR: "~/kolb-bot-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/kolb-bot-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { KOLB_BOT_STATE_DIR: "C:\\State\\kolb-bot" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\kolb-bot");
  });
});
