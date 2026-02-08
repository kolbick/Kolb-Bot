import fs from "node:fs/promises";
import path from "node:path";
import type { KolbBotConfig } from "../config/config.js";
import type { MemoryProviderStatus, MemorySearchManager, MemorySearchResult } from "./types.js";
import { resolveAgentWorkspaceDir } from "../agents/agent-scope.js";
import { normalizeExtraMemoryPaths, listMemoryFiles } from "./internal.js";

class SimpleMemorySearchManager implements MemorySearchManager {
  constructor(
    private readonly cfg: KolbBotConfig,
    private readonly agentId: string,
  ) {}

  private get workspaceDir(): string {
    return resolveAgentWorkspaceDir(this.cfg, this.agentId);
  }

  async search(
    query: string,
    opts?: { maxResults?: number; minScore?: number },
  ): Promise<MemorySearchResult[]> {
    const maxResults = opts?.maxResults ?? 6;
    const minScore = opts?.minScore ?? 0;
    const lc = query.toLowerCase();
    const files = await listMemoryFiles(
      this.workspaceDir,
      normalizeExtraMemoryPaths(
        this.workspaceDir,
        this.cfg.agents?.defaults?.memorySearch?.extraPaths ?? [],
      ),
    );
    const results: MemorySearchResult[] = [];
    for (const file of files) {
      const relPath = path.relative(this.workspaceDir, file) || path.basename(file);
      const lines = (await fs.readFile(file, "utf8")).split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i]?.toLowerCase().includes(lc)) {
          continue;
        }
        const score = 1;
        if (score < minScore) {
          continue;
        }
        const start = i + 1;
        const end = Math.min(lines.length, start + 2);
        results.push({
          path: relPath,
          startLine: start,
          endLine: end,
          score,
          snippet: lines.slice(i, end).join("\n"),
          source: relPath.endsWith(".jsonl") ? "sessions" : "memory",
        });
      }
    }
    return results.slice(0, maxResults);
  }

  async readFile(opts: { relPath: string; from?: number; lines?: number }) {
    const abs = path.resolve(this.workspaceDir, opts.relPath);
    const all = (await fs.readFile(abs, "utf8")).split(/\r?\n/);
    const from = Math.max(1, opts.from ?? 1);
    const lineCount = Math.max(1, opts.lines ?? 120);
    return {
      path: opts.relPath,
      from,
      lines: lineCount,
      text: all.slice(from - 1, from - 1 + lineCount).join("\n"),
    };
  }

  status(): MemoryProviderStatus {
    return {
      backend: this.cfg.memory?.backend ?? "builtin",
      files: 0,
      chunks: 0,
      dirty: false,
      workspaceDir: this.workspaceDir,
      dbPath: path.join(this.workspaceDir, ".memory", `${this.agentId}.sqlite`),
      provider: this.cfg.agents?.defaults?.memorySearch?.provider ?? "builtin",
      model: this.cfg.agents?.defaults?.memorySearch?.model ?? "builtin",
      requestedProvider: this.cfg.agents?.defaults?.memorySearch?.provider,
      sources: this.cfg.agents?.defaults?.memorySearch?.sources ?? ["memory"],
      vector: { enabled: true, available: false, loadError: "vector index not configured" },
      fts: { enabled: true, available: true },
      cache: { enabled: true, entries: 0 },
    };
  }

  async sync(): Promise<void> {}

  async probeVectorAvailability(): Promise<boolean> {
    return false;
  }

  async probeEmbeddingAvailability(): Promise<{ ok: boolean; error?: string }> {
    return { ok: false, error: "embedding provider unavailable" };
  }

  async close(): Promise<void> {}
}

export class MemoryIndexManager {
  static async get(params: { cfg: KolbBotConfig; agentId: string }): Promise<MemorySearchManager> {
    return new SimpleMemorySearchManager(params.cfg, params.agentId);
  }
}
