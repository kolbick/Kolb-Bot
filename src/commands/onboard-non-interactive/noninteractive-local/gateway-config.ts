import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { OnboardOptions } from "../../onboard-types.js";

export function applyNonInteractiveGatewayConfig(params: {
  nextConfig: KolbBotConfig;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  defaultPort: number;
}): {
  nextConfig: KolbBotConfig;
  port: number;
  bind: string;
  authMode: string;
  tailscaleMode: string;
  gatewayToken?: string;
} | null {
  const port = params.opts.gatewayPort ?? params.defaultPort;
  const bind = params.opts.gatewayBind ?? "loopback";
  const authMode = params.opts.gatewayAuth ?? "token";
  const tailscaleMode = params.opts.tailscale ?? "off";
  return {
    nextConfig: {
      ...params.nextConfig,
      gateway: {
        ...params.nextConfig.gateway,
        port,
        bind,
        tailscale: { ...params.nextConfig.gateway?.tailscale, mode: tailscaleMode },
      },
    },
    port,
    bind,
    authMode,
    tailscaleMode,
    gatewayToken: params.opts.gatewayToken,
  };
}
