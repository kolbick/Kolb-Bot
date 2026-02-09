import type { RuntimeEnv } from "../../../runtime.js";
import type { OnboardOptions } from "../../onboard-types.js";

export function logNonInteractiveOnboardingJson(params: {
  opts: OnboardOptions;
  runtime: RuntimeEnv;
  mode: "local" | "remote";
  workspaceDir: string;
  authChoice: unknown;
  gateway: {
    port: number;
    bind: string;
    authMode: string;
    tailscaleMode: string;
  };
  installDaemon: boolean;
  daemonRuntime: unknown;
  skipSkills: boolean;
  skipHealth: boolean;
}): void {
  if (!params.opts.json) {
    return;
  }
  params.runtime.log(
    JSON.stringify({
      mode: params.mode,
      workspace: params.workspaceDir,
      authChoice: params.authChoice,
      gateway: params.gateway,
      installDaemon: params.installDaemon,
      daemonRuntime: params.daemonRuntime ?? null,
      skipSkills: params.skipSkills,
      skipHealth: params.skipHealth,
    }),
  );
}
