import type { RuntimeEnv } from "../../../runtime.js";

export function logNonInteractiveOnboardingJson(params: {
  opts: { json?: boolean };
  runtime: RuntimeEnv;
  [key: string]: unknown;
}): void {
  if (params.opts.json) {
    params.runtime.log(JSON.stringify(params, null, 2));
  }
}
