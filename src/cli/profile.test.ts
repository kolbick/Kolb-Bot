import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "kolb-bot",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "kolb-bot", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "kolb-bot", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "kolb-bot", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "kolb-bot", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "kolb-bot", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "kolb-bot", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "kolb-bot", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "kolb-bot", "--profile", "work", "--dev", "status"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".kolb-bot-dev");
    expect(env.KOLB_BOT_PROFILE).toBe("dev");
    expect(env.KOLB_BOT_STATE_DIR).toBe(expectedStateDir);
    expect(env.KOLB_BOT_CONFIG_PATH).toBe(path.join(expectedStateDir, "kolb-bot.json"));
    expect(env.KOLB_BOT_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      KOLB_BOT_STATE_DIR: "/custom",
      KOLB_BOT_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.KOLB_BOT_STATE_DIR).toBe("/custom");
    expect(env.KOLB_BOT_GATEWAY_PORT).toBe("19099");
    expect(env.KOLB_BOT_CONFIG_PATH).toBe(path.join("/custom", "kolb-bot.json"));
  });

  it("uses KOLB_BOT_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      KOLB_BOT_HOME: "/srv/kolb-bot-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/kolb-bot-home");
    expect(env.KOLB_BOT_STATE_DIR).toBe(path.join(resolvedHome, ".kolb-bot-work"));
    expect(env.KOLB_BOT_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".kolb-bot-work", "kolb-bot.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "kolb-bot doctor --fix",
      env: {},
      expected: "kolb-bot doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "kolb-bot doctor --fix",
      env: { KOLB_BOT_PROFILE: "default" },
      expected: "kolb-bot doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "kolb-bot doctor --fix",
      env: { KOLB_BOT_PROFILE: "Default" },
      expected: "kolb-bot doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "kolb-bot doctor --fix",
      env: { KOLB_BOT_PROFILE: "bad profile" },
      expected: "kolb-bot doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "kolb-bot --profile work doctor --fix",
      env: { KOLB_BOT_PROFILE: "work" },
      expected: "kolb-bot --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "kolb-bot --dev doctor",
      env: { KOLB_BOT_PROFILE: "dev" },
      expected: "kolb-bot --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("kolb-bot doctor --fix", { KOLB_BOT_PROFILE: "work" })).toBe(
      "kolb-bot --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("kolb-bot doctor --fix", { KOLB_BOT_PROFILE: "  jbkolb-bot  " })).toBe(
      "kolb-bot --profile jbkolb-bot doctor --fix",
    );
  });

  it("handles command with no args after kolb-bot", () => {
    expect(formatCliCommand("kolb-bot", { KOLB_BOT_PROFILE: "test" })).toBe(
      "kolb-bot --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm kolb-bot doctor", { KOLB_BOT_PROFILE: "work" })).toBe(
      "pnpm kolb-bot --profile work doctor",
    );
  });
});
