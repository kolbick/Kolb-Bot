import type { Command } from "commander";
import { registerQrCli } from "./qr-cli.js";

export function registerLegacyCli(program: Command) {
  const legacy = program.command("clawbot").description("Legacy command aliases");
  registerQrCli(legacy);
}
