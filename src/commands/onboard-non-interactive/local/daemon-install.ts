import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { OnboardOptions } from "../../onboard-types.js";

export async function installGatewayDaemonNonInteractive(params: {
  nextConfig: KolbBotConfig;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  port: number;
  gatewayToken?: string;
}): Promise<void> {
  void params.nextConfig;
  void params.port;
  void params.gatewayToken;
  if (!params.opts.installDaemon) {
    return;
  }
  params.runtime.log("Gateway daemon installation is not available in this environment.");
}
