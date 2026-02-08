export type MemorySourceName = "memory" | "sessions";

export type MemorySearchResult = {
  path: string;
  startLine: number;
  endLine: number;
  score: number;
  snippet: string;
  source?: MemorySourceName;
  citation?: string;
};

export type MemorySyncProgress = {
  label?: string;
  completed: number;
  total: number;
};

export type MemoryProviderStatus = {
  backend?: "builtin" | "qmd";
  files: number;
  chunks: number;
  dirty: boolean;
  workspaceDir: string;
  dbPath: string;
  provider: string;
  model: string;
  requestedProvider?: string;
  fallback?: { from: string; reason?: string };
  sources?: MemorySourceName[];
  extraPaths?: string[];
  sourceCounts?: Array<{ source: MemorySourceName; files: number; chunks: number }>;
  vector?: {
    enabled: boolean;
    available?: boolean;
    extensionPath?: string;
    dims?: number;
    loadError?: string;
  };
  fts?: {
    enabled: boolean;
    available?: boolean;
    error?: string;
  };
  cache?: {
    enabled: boolean;
    entries?: number;
    maxEntries?: number;
  };
  batch?: {
    enabled: boolean;
    failures: number;
    limit: number;
    lastError?: string;
  };
};

export type MemorySearchManager = {
  search: (
    query: string,
    opts?: { maxResults?: number; minScore?: number; sessionKey?: string },
  ) => Promise<MemorySearchResult[]>;
  readFile: (opts: { relPath: string; from?: number; lines?: number }) => Promise<{
    path: string;
    from: number;
    lines: number;
    text: string;
  }>;
  status: () => MemoryProviderStatus;
  sync?: (opts?: {
    reason?: string;
    force?: boolean;
    progress?: (update: MemorySyncProgress) => void;
  }) => Promise<void>;
  probeVectorAvailability: () => Promise<boolean>;
  probeEmbeddingAvailability: () => Promise<{ ok: boolean; error?: string }>;
  close?: () => Promise<void>;
};

export type MemorySearchManagerResult = {
  manager: MemorySearchManager | null;
  error?: string;
};
