import fs from "node:fs/promises";
import path from "node:path";
import { resolveUserPath } from "../utils.js";

export function normalizeExtraMemoryPaths(workspaceDir: string, extraPaths: string[]): string[] {
  const seen = new Set<string>();
  for (const raw of extraPaths) {
    const trimmed = raw.trim();
    if (!trimmed) {
      continue;
    }
    const resolved = path.isAbsolute(trimmed)
      ? resolveUserPath(trimmed)
      : path.resolve(workspaceDir, trimmed);
    seen.add(resolved);
  }
  return [...seen];
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectMarkdownFiles(full)));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

export async function listMemoryFiles(
  workspaceDir: string,
  extraPaths: string[] = [],
): Promise<string[]> {
  const candidates = new Set<string>();
  for (const name of ["MEMORY.md", "memory.md"]) {
    candidates.add(path.join(workspaceDir, name));
  }
  const memoryDir = path.join(workspaceDir, "memory");
  try {
    for (const file of await collectMarkdownFiles(memoryDir)) {
      candidates.add(file);
    }
  } catch {}

  for (const extraPath of extraPaths) {
    try {
      const stat = await fs.stat(extraPath);
      if (stat.isDirectory()) {
        for (const file of await collectMarkdownFiles(extraPath)) {
          candidates.add(file);
        }
      } else if (stat.isFile()) {
        candidates.add(extraPath);
      }
    } catch {}
  }

  const existing: string[] = [];
  for (const file of candidates) {
    try {
      const stat = await fs.stat(file);
      if (stat.isFile()) {
        existing.push(file);
      }
    } catch {}
  }
  return existing.sort();
}
