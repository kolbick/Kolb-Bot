import type { KolbBotConfig } from "../../../config/config.js";
import type { OnboardOptions } from "../../onboard-types.js";

export async function installGatewayDaemonNonInteractive(_params: {
  nextConfig: KolbBotConfig;
  opts: OnboardOptions;
  runtime: unknown;
  port: number;
  gatewayToken: string;
}): Promise<void> {
  // Stub: daemon installation not available
}
