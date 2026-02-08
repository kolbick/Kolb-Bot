import { randomBytes } from "node:crypto";
import type { KolbBotConfig } from "../../../config/config.js";
import type { RuntimeEnv } from "../../../runtime.js";
import type { OnboardOptions } from "../../onboard-types.js";

function mintGatewayToken(): string {
  return `kb_${randomBytes(24).toString("base64url")}`;
}

export function applyNonInteractiveGatewayConfig(params: {
  nextConfig: KolbBotConfig;
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  defaultPort: number;
}): {
  nextConfig: KolbBotConfig;
  port: number;
  bind: "auto" | "lan" | "loopback" | "custom" | "tailnet";
  authMode: "token" | "password";
  tailscaleMode: "off" | "serve" | "funnel";
  gatewayToken?: string;
} | null {
  const port = params.opts.gatewayPort ?? params.defaultPort;
  const bind = params.opts.gatewayBind ?? "loopback";
  const tailscaleMode = params.opts.tailscale ?? "off";

  const requestedAuthMode = params.opts.gatewayAuth;
  let authMode: "token" | "password" = requestedAuthMode ?? "token";
  if (!requestedAuthMode && bind === "lan") {
    authMode = "token";
  }

  let gatewayToken = params.opts.gatewayToken?.trim();
  const gatewayPassword = params.opts.gatewayPassword?.trim();
  if (authMode === "password" && !gatewayPassword) {
    params.runtime.error("Missing --gateway-password when --gateway-auth=password.");
    params.runtime.exit(1);
    return null;
  }

  if (authMode === "token" && !gatewayToken) {
    gatewayToken = mintGatewayToken();
  }

  const nextConfig: KolbBotConfig = {
    ...params.nextConfig,
    gateway: {
      ...params.nextConfig.gateway,
      mode: "local",
      port,
      bind,
      tailscale: {
        ...params.nextConfig.gateway?.tailscale,
        mode: tailscaleMode,
        resetOnExit: params.opts.tailscaleResetOnExit,
      },
      auth: {
        mode: authMode,
        token: authMode === "token" ? gatewayToken : undefined,
        password: authMode === "password" ? gatewayPassword : undefined,
      },
    },
  };

  return { nextConfig, port, bind, authMode, tailscaleMode, gatewayToken };
}
