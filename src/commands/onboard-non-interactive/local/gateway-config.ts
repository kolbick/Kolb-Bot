import crypto from "node:crypto";
import type { KolbBotConfig } from "../../../config/config.js";
import type { OnboardOptions } from "../../onboard-types.js";

export function applyNonInteractiveGatewayConfig(params: {
  nextConfig: KolbBotConfig;
  opts: OnboardOptions;
  runtime: unknown;
  defaultPort: number;
}):
  | {
      nextConfig: KolbBotConfig;
      port: number;
      bind: string;
      authMode: string;
      gatewayToken: string;
      tailscaleMode: string;
    }
  | undefined {
  const port = params.opts.gatewayPort ?? params.defaultPort;
  const bind = params.opts.gatewayBind ?? "loopback";
  const authMode = params.opts.gatewayAuth ?? "token";
  const tailscaleMode = params.opts.tailscale ?? "off";

  let gatewayToken = params.opts.gatewayToken ?? "";

  // Auto-generate a token when binding to LAN and no explicit token/password is set
  if (bind === "lan" && authMode === "token" && !gatewayToken) {
    gatewayToken = crypto.randomBytes(24).toString("hex");
  }

  const nextConfig: KolbBotConfig = {
    ...params.nextConfig,
    gateway: {
      ...params.nextConfig.gateway,
      port,
      bind,
      auth:
        authMode === "token"
          ? { mode: "token" as const, token: gatewayToken }
          : authMode === "password"
            ? { mode: "password" as const, password: params.opts.gatewayPassword ?? "" }
            : params.nextConfig.gateway?.auth,
    },
  };

  return {
    nextConfig,
    port,
    bind,
    authMode,
    gatewayToken,
    tailscaleMode,
  };
}
