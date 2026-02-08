export type MemorySearchResult = {
  path: string;
  snippet: string;
  score: number;
  startLine: number;
  endLine: number;
  citation?: string;
};

export type MemoryVectorStatus = {
  enabled: boolean;
  available?: boolean;
  extensionPath?: string;
  dims?: number;
  loadError?: string;
};

export type MemoryFtsStatus = {
  enabled: boolean;
  available?: boolean;
  error?: string;
};

export type MemoryCacheStatus = {
  enabled: boolean;
  entries?: number;
  maxEntries?: number;
};

export type MemoryProviderStatus = {
  provider: string;
  requestedProvider?: string;
  model?: string;
  backend: "qmd" | "none";
  dbPath?: string;
  workspaceDir?: string;
  sources?: Array<"memory" | "sessions">;
  sourceCounts?: Array<{ source: "memory" | "sessions"; files: number; chunks: number }>;
  files: number;
  chunks: number;
  dirty?: boolean;
  extraPaths?: string[];
  vector?: MemoryVectorStatus;
  fts?: MemoryFtsStatus;
  cache?: MemoryCacheStatus;
  batch?: {
    enabled?: boolean;
    wait?: boolean;
    intervalMs?: number;
    timeoutMs?: number;
    running?: boolean;
    failures?: number;
    limit?: number;
    lastError?: string;
  };
  fallback?: { from: string; to?: string; reason?: string };
};

export type MemoryProbeResult = { ok: boolean; error?: string };
export type MemorySyncUpdate = { completed: number; total: number; label?: string };

export type MemoryManager = {
  search: (
    query: string,
    opts?: { maxResults?: number; minScore?: number; sessionKey?: string },
  ) => Promise<MemorySearchResult[]>;
  readFile: (opts: {
    relPath: string;
    from?: number;
    lines?: number;
  }) => Promise<{ path: string; text: string }>;
  status: () => MemoryProviderStatus;
  probeVectorAvailability: () => Promise<MemoryProbeResult>;
  probeEmbeddingAvailability: () => Promise<MemoryProbeResult>;
  sync?: (opts: {
    reason: string;
    force?: boolean;
    progress?: (update: MemorySyncUpdate) => void;
  }) => Promise<void>;
  close?: () => Promise<void>;
};
