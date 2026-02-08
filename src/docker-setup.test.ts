import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

async function writeDockerStub(binDir: string, logPath: string) {
  const stub = `#!/usr/bin/env bash
set -euo pipefail
log="$DOCKER_STUB_LOG"
if [[ "\${1:-}" == "compose" && "\${2:-}" == "version" ]]; then
  exit 0
fi
if [[ "\${1:-}" == "build" ]]; then
  echo "build $*" >>"$log"
  exit 0
fi
if [[ "\${1:-}" == "compose" ]]; then
  echo "compose $*" >>"$log"
  exit 0
fi
echo "unknown $*" >>"$log"
exit 0
`;

  await mkdir(binDir, { recursive: true });
  await writeFile(join(binDir, "docker"), stub, { mode: 0o755 });
  await writeFile(logPath, "");
}

describe("docker-setup.sh", () => {
  it("handles unset optional env vars under strict mode", async () => {
    const assocCheck = spawnSync("bash", ["-c", "declare -A _t=()"], {
      encoding: "utf8",
    });
    if (assocCheck.status !== 0) {
      return;
    }

    const rootDir = await mkdtemp(join(tmpdir(), "kolb-bot-docker-setup-"));
    const scriptPath = join(rootDir, "docker-setup.sh");
    const dockerfilePath = join(rootDir, "Dockerfile");
    const composePath = join(rootDir, "docker-compose.yml");
    const binDir = join(rootDir, "bin");
    const logPath = join(rootDir, "docker-stub.log");

    const script = await readFile(join(repoRoot, "docker-setup.sh"), "utf8");
    await writeFile(scriptPath, script, { mode: 0o755 });
    await writeFile(dockerfilePath, "FROM scratch\n");
    await writeFile(
      composePath,
      "services:\n  kolb-bot-gateway:\n    image: noop\n  kolb-bot-cli:\n    image: noop\n",
    );
    await writeDockerStub(binDir, logPath);

    const env = {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH ?? ""}`,
      DOCKER_STUB_LOG: logPath,
      KOLB_BOT_GATEWAY_TOKEN: "test-token",
      KOLB_BOT_CONFIG_DIR: join(rootDir, "config"),
      KOLB_BOT_WORKSPACE_DIR: join(rootDir, "kolb-bot"),
    };
    delete env.KOLB_BOT_DOCKER_APT_PACKAGES;
    delete env.KOLB_BOT_EXTRA_MOUNTS;
    delete env.KOLB_BOT_HOME_VOLUME;

    const result = spawnSync("bash", [scriptPath], {
      cwd: rootDir,
      env,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);

    const envFile = await readFile(join(rootDir, ".env"), "utf8");
    expect(envFile).toContain("KOLB_BOT_DOCKER_APT_PACKAGES=");
    expect(envFile).toContain("KOLB_BOT_EXTRA_MOUNTS=");
    expect(envFile).toContain("KOLB_BOT_HOME_VOLUME=");
  });

  it("plumbs KOLB_BOT_DOCKER_APT_PACKAGES into .env and docker build args", async () => {
    const assocCheck = spawnSync("bash", ["-c", "declare -A _t=()"], {
      encoding: "utf8",
    });
    if (assocCheck.status !== 0) {
      return;
    }

    const rootDir = await mkdtemp(join(tmpdir(), "kolb-bot-docker-setup-"));
    const scriptPath = join(rootDir, "docker-setup.sh");
    const dockerfilePath = join(rootDir, "Dockerfile");
    const composePath = join(rootDir, "docker-compose.yml");
    const binDir = join(rootDir, "bin");
    const logPath = join(rootDir, "docker-stub.log");

    const script = await readFile(join(repoRoot, "docker-setup.sh"), "utf8");
    await writeFile(scriptPath, script, { mode: 0o755 });
    await writeFile(dockerfilePath, "FROM scratch\n");
    await writeFile(
      composePath,
      "services:\n  kolb-bot-gateway:\n    image: noop\n  kolb-bot-cli:\n    image: noop\n",
    );
    await writeDockerStub(binDir, logPath);

    const env = {
      ...process.env,
      PATH: `${binDir}:${process.env.PATH ?? ""}`,
      DOCKER_STUB_LOG: logPath,
      KOLB_BOT_DOCKER_APT_PACKAGES: "ffmpeg build-essential",
      KOLB_BOT_GATEWAY_TOKEN: "test-token",
      KOLB_BOT_CONFIG_DIR: join(rootDir, "config"),
      KOLB_BOT_WORKSPACE_DIR: join(rootDir, "kolb-bot"),
      KOLB_BOT_EXTRA_MOUNTS: "",
      KOLB_BOT_HOME_VOLUME: "",
    };

    const result = spawnSync("bash", [scriptPath], {
      cwd: rootDir,
      env,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);

    const envFile = await readFile(join(rootDir, ".env"), "utf8");
    expect(envFile).toContain("KOLB_BOT_DOCKER_APT_PACKAGES=ffmpeg build-essential");

    const log = await readFile(logPath, "utf8");
    expect(log).toContain("--build-arg KOLB_BOT_DOCKER_APT_PACKAGES=ffmpeg build-essential");
  });

  it("keeps docker-compose gateway command in sync", async () => {
    const compose = await readFile(join(repoRoot, "docker-compose.yml"), "utf8");
    expect(compose).not.toContain("gateway-daemon");
    expect(compose).toContain('"gateway"');
  });
});
