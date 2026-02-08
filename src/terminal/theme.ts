import chalk, { Chalk } from "chalk";
import { KOLBBOT_PALETTE } from "./palette.js";

const hasForceColor =
  typeof process.env.FORCE_COLOR === "string" &&
  process.env.FORCE_COLOR.trim().length > 0 &&
  process.env.FORCE_COLOR.trim() !== "0";

const baseChalk = process.env.NO_COLOR && !hasForceColor ? new Chalk({ level: 0 }) : chalk;

const hex = (value: string) => baseChalk.hex(value);

export const theme = {
  accent: hex(KOLBBOT_PALETTE.accent),
  accentBright: hex(KOLBBOT_PALETTE.accentBright),
  accentDim: hex(KOLBBOT_PALETTE.accentDim),
  info: hex(KOLBBOT_PALETTE.info),
  success: hex(KOLBBOT_PALETTE.success),
  warn: hex(KOLBBOT_PALETTE.warn),
  error: hex(KOLBBOT_PALETTE.error),
  muted: hex(KOLBBOT_PALETTE.muted),
  heading: baseChalk.bold.hex(KOLBBOT_PALETTE.accent),
  command: hex(KOLBBOT_PALETTE.accentBright),
  option: hex(KOLBBOT_PALETTE.warn),
} as const;

export const isRich = () => Boolean(baseChalk.level > 0);

export const colorize = (rich: boolean, color: (value: string) => string, value: string) =>
  rich ? color(value) : value;
