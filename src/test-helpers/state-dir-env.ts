type StateDirEnvSnapshot = {
  kolb-botStateDir: string | undefined;
  kolb-botStateDir: string | undefined;
};

export function snapshotStateDirEnv(): StateDirEnvSnapshot {
  return {
    kolb-botStateDir: process.env.KOLB_BOT_STATE_DIR,
    kolb-botStateDir: process.env.CLAWDBOT_STATE_DIR,
  };
}

export function restoreStateDirEnv(snapshot: StateDirEnvSnapshot): void {
  if (snapshot.kolb-botStateDir === undefined) {
    delete process.env.KOLB_BOT_STATE_DIR;
  } else {
    process.env.KOLB_BOT_STATE_DIR = snapshot.kolb-botStateDir;
  }
  if (snapshot.kolb-botStateDir === undefined) {
    delete process.env.CLAWDBOT_STATE_DIR;
  } else {
    process.env.CLAWDBOT_STATE_DIR = snapshot.kolb-botStateDir;
  }
}

export function setStateDirEnv(stateDir: string): void {
  process.env.KOLB_BOT_STATE_DIR = stateDir;
  delete process.env.CLAWDBOT_STATE_DIR;
}
