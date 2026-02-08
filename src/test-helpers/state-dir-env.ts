type StateDirEnvSnapshot = {
  kolbBotStateDir: string | undefined;
  kolbBotStateDir: string | undefined;
};

export function snapshotStateDirEnv(): StateDirEnvSnapshot {
  return {
    kolbBotStateDir: process.env.KOLB_BOT_STATE_DIR,
    kolbBotStateDir: process.env.CLAWDBOT_STATE_DIR,
  };
}

export function restoreStateDirEnv(snapshot: StateDirEnvSnapshot): void {
  if (snapshot.kolbBotStateDir === undefined) {
    delete process.env.KOLB_BOT_STATE_DIR;
  } else {
    process.env.KOLB_BOT_STATE_DIR = snapshot.kolbBotStateDir;
  }
  if (snapshot.kolbBotStateDir === undefined) {
    delete process.env.CLAWDBOT_STATE_DIR;
  } else {
    process.env.CLAWDBOT_STATE_DIR = snapshot.kolbBotStateDir;
  }
}

export function setStateDirEnv(stateDir: string): void {
  process.env.KOLB_BOT_STATE_DIR = stateDir;
  delete process.env.CLAWDBOT_STATE_DIR;
}
