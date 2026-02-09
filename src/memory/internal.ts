import fs from "node:fs";
import path from "node:path";

export async function listMemoryFiles(
  workspaceDir: string,
  extraPaths?: string[],
): Promise<string[]> {
  const files: string[] = [];
  const candidates = [path.join(workspaceDir, "MEMORY.md"), path.join(workspaceDir, "memory.md")];
  for (const candidate of candidates) {
    try {
      await fs.promises.access(candidate, fs.constants.R_OK);
      files.push(candidate);
    } catch {
      // file doesn't exist, skip
    }
  }
  const memoryDir = path.join(workspaceDir, "memory");
  try {
    const entries = await fs.promises.readdir(memoryDir);
    for (const entry of entries) {
      if (entry.endsWith(".md")) {
        files.push(path.join(memoryDir, entry));
      }
    }
  } catch {
    // directory doesn't exist, skip
  }
  if (extraPaths) {
    const normalized = normalizeExtraMemoryPaths(workspaceDir, extraPaths);
    files.push(...normalized);
  }
  return [...new Set(files)];
}

export function normalizeExtraMemoryPaths(workspaceDir: string, extraPaths: string[]): string[] {
  return [
    ...new Set(
      extraPaths
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => (path.isAbsolute(p) ? p : path.resolve(workspaceDir, p))),
    ),
  ];
}
