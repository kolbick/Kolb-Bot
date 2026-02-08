import type { RuntimeEnv } from "../../../runtime.js";

export function logNonInteractiveOnboardingJson(params: {
  opts: { json?: boolean };
  runtime: RuntimeEnv;
  mode: "local" | "remote";
  workspaceDir: string;
  authChoice: string;
  gateway: {
    port: number;
    bind: string;
    authMode: string;
    tailscaleMode: string;
  };
  installDaemon: boolean;
  daemonRuntime?: string;
  skipSkills: boolean;
  skipHealth: boolean;
}): void {
  const payload = {
    mode: params.mode,
    workspaceDir: params.workspaceDir,
    authChoice: params.authChoice,
    gateway: params.gateway,
    installDaemon: params.installDaemon,
    daemonRuntime: params.daemonRuntime,
    skipSkills: params.skipSkills,
    skipHealth: params.skipHealth,
  };
  if (params.opts.json) {
    params.runtime.log(JSON.stringify(payload, null, 2));
    return;
  }
  params.runtime.log(`Mode: ${payload.mode}`);
  params.runtime.log(`Workspace: ${payload.workspaceDir}`);
  params.runtime.log(
    `Gateway: ${payload.gateway.bind}:${payload.gateway.port} (${payload.gateway.authMode})`,
  );
}
