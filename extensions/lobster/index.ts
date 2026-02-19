import type {
  AnyAgentTool,
  KolbBotPluginApi,
  KolbBotPluginToolFactory,
} from "../../src/plugins/types.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default function register(api: KolbBotPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createLobsterTool(api) as AnyAgentTool;
    }) as KolbBotPluginToolFactory,
    { optional: true },
  );
}
