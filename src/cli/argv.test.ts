import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "kolb-bot", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "kolb-bot", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "kolb-bot", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "kolb-bot", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "kolb-bot", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "kolb-bot", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "kolb-bot", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "kolb-bot"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "kolb-bot", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "kolb-bot", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "kolb-bot", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "kolb-bot", "status", "--timeout=2500"], "--timeout")).toBe(
      "2500",
    );
    expect(getFlagValue(["node", "kolb-bot", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "kolb-bot", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "kolb-bot", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "kolb-bot", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "kolb-bot", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "kolb-bot", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "kolb-bot", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "kolb-bot", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "kolb-bot", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "kolb-bot", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["node", "kolb-bot", "status"],
    });
    expect(nodeArgv).toEqual(["node", "kolb-bot", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["node-22", "kolb-bot", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "kolb-bot", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["node-22.2.0.exe", "kolb-bot", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "kolb-bot", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["node-22.2", "kolb-bot", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "kolb-bot", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["node-22.2.exe", "kolb-bot", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "kolb-bot", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["/usr/bin/node-22.2.0", "kolb-bot", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "kolb-bot", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["nodejs", "kolb-bot", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "kolb-bot", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["node-dev", "kolb-bot", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "kolb-bot", "node-dev", "kolb-bot", "status"]);

    const directArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["kolb-bot", "status"],
    });
    expect(directArgv).toEqual(["node", "kolb-bot", "status"]);

    const bunArgv = buildParseArgv({
      programName: "kolb-bot",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "kolb-bot",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "kolb-bot", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "kolb-bot", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "kolb-bot", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "kolb-bot", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "kolb-bot", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "kolb-bot", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "kolb-bot", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "kolb-bot", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
