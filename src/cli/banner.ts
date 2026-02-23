import { resolveCommitHash } from "../infra/git-commit.js";
import { visibleWidth } from "../terminal/ansi.js";
import { isRich, theme } from "../terminal/theme.js";
import { pickTagline, type TaglineOptions } from "./tagline.js";

type BannerOptions = TaglineOptions & {
  argv?: string[];
  commit?: string | null;
  columns?: number;
  richTty?: boolean;
};

let bannerEmitted = false;

const graphemeSegmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function splitGraphemes(value: string): string[] {
  if (!graphemeSegmenter) {
    return Array.from(value);
  }
  try {
    return Array.from(graphemeSegmenter.segment(value), (seg) => seg.segment);
  } catch {
    return Array.from(value);
  }
}

const hasJsonFlag = (argv: string[]) =>
  argv.some((arg) => arg === "--json" || arg.startsWith("--json="));

const hasVersionFlag = (argv: string[]) =>
  argv.some((arg) => arg === "--version" || arg === "-V" || arg === "-v");

export function formatCliBannerLine(version: string, options: BannerOptions = {}): string {
  const commit = options.commit ?? resolveCommitHash({ env: options.env });
  const commitLabel = commit ?? "unknown";
  const tagline = pickTagline(options);
  const rich = options.richTty ?? isRich();
  const title = "☠️  Kolb-Bot";
  const prefix = "☠️  ";
  const columns = options.columns ?? process.stdout.columns ?? 120;

  const plainFullLine = `${title} ${version} (${commitLabel}) — ${tagline}`;
  const fitsOnOneLine = visibleWidth(plainFullLine) <= columns;

  if (rich) {
    if (fitsOnOneLine) {
      return `${theme.heading(title)} ${theme.info(version)} ${theme.muted(
        `(${commitLabel})`,
      )} ${theme.muted("—")} ${theme.accentDim(tagline)}`;
    }
    const line1 = `${theme.heading(title)} ${theme.info(version)} ${theme.muted(
      `(${commitLabel})`,
    )}`;
    const line2 = `${" ".repeat(prefix.length)}${theme.accentDim(tagline)}`;
    return `${line1}\n${line2}`;
  }

  if (fitsOnOneLine) {
    return plainFullLine;
  }
  const line1 = `${title} ${version} (${commitLabel})`;
  const line2 = `${" ".repeat(prefix.length)}${tagline}`;
  return `${line1}\n${line2}`;
}

/**
 * ASCII art generated from the Kolb-Bot image you provided.
 * 80 cols wide; we auto-hide it if terminal is narrower to avoid wrapping.
 */
const KOLBBOT_ASCII = [
  "                         i:                                                     ",
  "                         Ai                                                     ",
  "                        .s;     ..,:,,::,:,,..                                  ",
  "                        ,2, ,:::iirrA2XrArrrrrii;:.                             ",
  "                        ;5. ::;5rMAhG39ABXi5Shhrirsri::,.                   ..  ",
  "                        i2  ,:;###:92;&2BX;3B3BXArhSMhr53Air;:::::::::,::::;;,  ",
  "                        r2  ,;;9M#55GHHs#H35B392hAMSh#AB2S35SS3sXXsssrri;;:::   ",
  "                        XA  ,;;Hss2issrrrssrA52i;;MSM95B;HS:SGrXXXAXsrrrii;:.   ",
  "                        As  ,;iirrirrrrsrriiiiX:iAX2AXihHG5;SHiXXAXAXrriii;:    ",
  "                        Ar  :iirrrrrrsXXrri;:;rsr;:rsii;rrsXAAsXXssssssiii:,    ",
  "                       .2;  :iirssrrsXsri:,.,isAXii;:irsriXXssXXAXXssssrri::.   ",
  "                       .2:  :iiriirrrsXsi,:;..;hr5XX;i,;;isXXAAAAAXXsssrii::,   ",
  "                       ,2,  ,;;;;rXAXrissi,.AsX32225i5:;rrsAXX22AAAXXsri;ii;,   ",
  "                       :2. .:;;rAAA55:;5255s:r233AsX,;isXXAAAA2AXsssrrrii;:::.  ",
  "                       iA  ,;;iAXr;X2255XrA5s:;s3s;::rXXsX222AAAXXsrrrsri;:;:,  ",
  "                       rX .;irsr;,:;rXA2XrrXAAi,  .;rrsXsrXXXssXXXssrsri;:;;:;. ",
  "                       ss.sXsi;,..,,:;irriiirX25Xsii,:;rrXXssssXXXAsrri;i;:::;; ",
  "                       Xi i;,.. ,:iX535X;rr:::;sXX25. ...,:iiirXsXAXsrrrr;::,.  ",
  "                      .Xs  ,,.,,,,.,:2i,X:ss,;:,:rs:.         ..,:::,,,.        ",
  "                     :i2Hir   rs: ..XS3s3r55r5A,;:.                             ",
  "                   .;:;AMir,  .:,AArX525XsAi:ii.                                ",
  "                 .5s.;isMs     .,riiX53XrrXs,                                    ",
  "               ,s:25..,:i:  ;rXr: :52X3H5XX: .;i .,,.                           ",
  "              :2:isXr s:   ,A3s;, .,;:ri.i:rAAr,. .::,..                        ",
  "              .2;rr:..A;.;s; iA:, ;,,:;,:25A2i,::,:;;,                          ",
  "              .sXr;i:,A:,Asi:,X.,,::;AiXrr5:;i2s2HSGM2s;.                       ",
  "               ;rri;.:2,.XssXXr..r;rX35hr:X,;A3rsX2hGGGhX:                      ",
  "               .r;:, ;A,.:r2Xs,;Xris2h2s:r225X:5XrX3HGh2rr;                     ",
  "                ...  iX ..,A;i,;233GS93riiA32H;:.is3i,:.;r:                     ",
  "                     rX   .AXi,i25hS#GhiirXrHA;i2Xi ;rr5hM2:                    ",
  "                     ss    X;:,;rX5hM5s:;X32Mis;53X.iXhSSH5X:                   ",
  "                     Xr    XX;.,,;ir2X.:i2X5A:r;,:;:X;XX5;iX3A..                ",
  "                     Ai    r::,.:rs2G5,,;Ar3i:;:,.,.:;:i::rssi;::               ",
  "                    .A:    .:., ,,;sr;,,;;;5:,,,..  .,:,.ihiGS2i,               ",
  "                    ,A,       ,. ,:i2X..,;:A,:,.,      .Ai;iAHS3s                ",
  "                    :A.        ..:sXAXr....;.... ..    .;2iX2s22i               ",
  "                    ;2          :;rXr;  .          .    ,2XrXrX5.               ",
  "                    iX          ,i;:.   ,.         :     ;:;:;:;               ",
  "                    ir           .     .:         .:      .                    ",
  "                    ..                  :,        .;                           ",
  "                                        ..        ..                           ",
  "                                                   .,,,,.                     ",
];

/**
 * Colorize ASCII based on “ink density” characters.
 * Darker chars get brighter / more accent; lighter stay muted.
 */
export function formatCliBannerArt(options: BannerOptions = {}): string {
  const rich = options.richTty ?? isRich();
  if (!rich) {
    return KOLBBOT_ASCII.join("\n");
  }

  // Lowest -> highest ink density (same ordering used by common ASCII renderers)
  const levels = " .,:;irsXA253hMHGS#9B&@";
  const max = levels.length - 1;

  const colorByDensity = (ch: string) => {
    const idx = levels.indexOf(ch);
    if (idx === -1) {
      // Keep pipes/lines a bit more visible
      if (ch === "|" || ch === "│") return theme.accent(ch);
      return theme.muted(ch);
    }
    const t = idx / max;

    // tuned for Kolb-Bot vibe: muted -> purple -> gold highlights
    if (t < 0.15) return theme.muted(ch);
    if (t < 0.35) return theme.accentDim(ch);
    if (t < 0.65) return theme.accent(ch);
    if (t < 0.85) return theme.accentBright(ch);
    return theme.warn(ch);
  };

  const colored = KOLBBOT_ASCII.map((line) =>
    splitGraphemes(line)
      .map((ch) => colorByDensity(ch))
      .join(""),
  );

  return colored.join("\n");
}

export function emitCliBanner(version: string, options: BannerOptions = {}) {
  if (bannerEmitted) return;

  const argv = options.argv ?? process.argv;

  // only show banners when interactive output is intended
  if (!process.stdout.isTTY) return;
  if (hasJsonFlag(argv)) return;
  if (hasVersionFlag(argv)) return;

  const columns = options.columns ?? process.stdout.columns ?? 120;

  // Avoid wrapping: only print art if it fits.
  const widestArt = Math.max(...KOLBBOT_ASCII.map((l) => visibleWidth(l)));
  const showArt = widestArt <= columns;

  const line = formatCliBannerLine(version, options);
  const art = showArt ? formatCliBannerArt(options) : "";

  process.stdout.write(`\n${art ? art + "\n" : ""}${line}\n\n`);
  bannerEmitted = true;
}

export function hasEmittedCliBanner(): boolean {
  return bannerEmitted;
}
