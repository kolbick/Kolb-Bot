import fs from "node:fs/promises";
import path from "node:path";
import type { KolbBotConfig } from "../config/config.js";
import type { MemoryManager, MemorySearchResult } from "./types.js";
import { resolveDefaultAgentId } from "../agents/agent-scope.js";
import { resolveStateDir } from "../config/paths.js";
import { listMemoryFiles, normalizeExtraMemoryPaths } from "./internal.js";

export type MemorySearchManagerResult = { manager: MemoryManager | null; error?: string };

function scoreSnippet(text: string, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) {
    return 0;
  }
  return text.toLowerCase().includes(q) ? 1 : 0;
}

export async function getMemorySearchManager(params: {
  cfg: KolbBotConfig;
  agentId?: string;
}): Promise<MemorySearchManagerResult> {
  const agentId = params.agentId ?? resolveDefaultAgentId(params.cfg);
  const workspaceDir = params.cfg.agents?.defaults?.workspace;
  if (!workspaceDir) {
    return { manager: null, error: "Memory search disabled (no workspace configured)." };
  }
  const extraPaths = normalizeExtraMemoryPaths(
    workspaceDir,
    params.cfg.agents?.defaults?.memorySearch?.extraPaths ?? [],
  );
  const dbPath = path.join(resolveStateDir(process.env), "memory", `${agentId}.sqlite`);

  const manager: MemoryManager = {
    async search(query, opts) {
      const files = await listMemoryFiles(workspaceDir, extraPaths);
      const rows: MemorySearchResult[] = [];
      for (const file of files) {
        let text = "";
        try {
          text = await fs.readFile(file, "utf8");
        } catch {
          continue;
        }
        const lines = text.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const score = scoreSnippet(lines[i] ?? "", query);
          if (score > 0) {
            rows.push({
              path: file,
              snippet: lines[i] ?? "",
              score,
              startLine: i + 1,
              endLine: i + 1,
            });
          }
        }
      }
      const minScore = opts?.minScore ?? 0;
      const maxResults = opts?.maxResults ?? 6;
      return rows.filter((r) => r.score >= minScore).slice(0, maxResults);
    },
    async readFile(opts) {
      const target = path.isAbsolute(opts.relPath)
        ? opts.relPath
        : path.join(workspaceDir, opts.relPath);
      const text = await fs.readFile(target, "utf8");
      const lines = text.split(/\r?\n/);
      const from = Math.max(1, opts.from ?? 1);
      const count = Math.max(1, opts.lines ?? lines.length);
      return { path: target, text: lines.slice(from - 1, from - 1 + count).join("\n") };
    },
    status() {
      return {
        provider: "local",
        requestedProvider: "local",
        model: "builtin",
        backend: "qmd",
        dbPath,
        workspaceDir,
        sources: ["memory"],
        sourceCounts: [{ source: "memory", files: 0, chunks: 0 }],
        files: 0,
        chunks: 0,
        dirty: false,
        extraPaths,
        vector: { enabled: false, available: false },
        fts: { enabled: true, available: true },
        cache: { enabled: false, entries: 0 },
      };
    },
    async probeVectorAvailability() {
      return { ok: true };
    },
    async probeEmbeddingAvailability() {
      return { ok: true };
    },
    async sync(opts) {
      opts.progress?.({ completed: 1, total: 1, label: "indexed" });
    },
    async close() {},
  };
  return { manager };
}
