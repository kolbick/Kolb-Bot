import fs from "node:fs/promises";
import path from "node:path";
import { resolveUserPath } from "../utils.js";

export function normalizeExtraMemoryPaths(workspaceDir: string, extraPaths: string[]): string[] {
  return extraPaths
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) =>
      path.isAbsolute(entry) ? resolveUserPath(entry) : path.join(workspaceDir, entry),
    );
}

export async function listMemoryFiles(
  workspaceDir: string,
  extraPaths: string[] = [],
): Promise<string[]> {
  const out = new Set<string>();
  for (const name of ["MEMORY.md", "memory.md"]) {
    const p = path.join(workspaceDir, name);
    try {
      await fs.access(p);
      out.add(p);
    } catch {}
  }
  const memoryDir = path.join(workspaceDir, "memory");
  try {
    const entries = await fs.readdir(memoryDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith(".md")) {
        out.add(path.join(memoryDir, e.name));
      }
    }
  } catch {}
  for (const p of extraPaths) {
    out.add(p);
  }
  return [...out];
}
