import crypto from "node:crypto";
import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { OnboardOptions } from "../../onboard-types.js";

function randomGatewayToken(): string {
  return `tok_${crypto.randomBytes(18).toString("base64url")}`;
}

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
  const gatewayToken =
    authMode === "token"
      ? params.opts.gatewayToken?.trim() || (bind === "lan" ? randomGatewayToken() : undefined)
      : undefined;

  return {
    nextConfig: {
      ...params.nextConfig,
      gateway: {
        ...params.nextConfig.gateway,
        port,
        bind,
        auth: {
          mode: authMode,
          token: gatewayToken,
          password: authMode === "password" ? params.opts.gatewayPassword?.trim() : undefined,
        },
        tailscale: { ...params.nextConfig.gateway?.tailscale, mode: tailscaleMode },
      },
    },
    port,
    bind,
    authMode,
    tailscaleMode,
    gatewayToken,
  };
}
