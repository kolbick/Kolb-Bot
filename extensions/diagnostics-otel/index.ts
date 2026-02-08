import type { KolbBotPluginApi } from "kolb-bot/plugin-sdk";
import { emptyPluginConfigSchema } from "kolb-bot/plugin-sdk";
import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: KolbBotPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
