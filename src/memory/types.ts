export type MemorySearchResult = {
  path: string;
  startLine: number;
  endLine: number;
  score: number;
  snippet: string;
  source: "memory" | "sessions";
  citation?: string;
};

export type MemoryProviderStatus = {
  provider: string;
  model?: string;
  requestedProvider?: string;
  files?: number;
  chunks?: number;
  dirty?: boolean;
  workspaceDir?: string;
  dbPath?: string;
  extraPaths?: string[];
  sources?: Array<"memory" | "sessions">;
  sourceCounts?: Array<{
    source: "memory" | "sessions";
    files: number;
    chunks: number;
  }>;
  fallback?: {
    from: string;
    reason?: string;
  };
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
  backend?: "builtin" | "qmd";
};
