/**
 * Browser fingerprinting: identify a browser without cookies, by combining
 * small rendering differences between GPUs, drivers, OSes and installed fonts.
 * The results are only displayed, never stored or sent.
 */
import type { StaticInfo } from "./collectors";

export async function sha256(text: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function canvasImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  const gradient = ctx.createLinearGradient(0, 0, 320, 0);
  gradient.addColorStop(0, "#06b6d4");
  gradient.addColorStop(1, "#a855f7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 320, 64);
  ctx.textBaseline = "alphabetic";
  ctx.font = "italic 22px Georgia, serif";
  ctx.fillStyle = "rgba(10, 10, 12, 0.85)";
  ctx.fillText("whoami? 🕵️‍♂️ Ωμ ∑ ✓", 10, 30);
  ctx.font = "14px Arial, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillText("Cwm fjordbank glyphs vext quiz 😃", 12, 52);
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgb(255, 0, 255)";
  ctx.beginPath();
  ctx.arc(270, 32, 24, 0, Math.PI * 2);
  ctx.fill();
  return canvas.toDataURL();
}

function webglSignature() {
  const gl = document.createElement("canvas").getContext("webgl") as WebGLRenderingContext | null;
  if (!gl) return undefined;
  const params = [
    gl.MAX_TEXTURE_SIZE,
    gl.MAX_RENDERBUFFER_SIZE,
    gl.MAX_VERTEX_ATTRIBS,
    gl.MAX_VERTEX_UNIFORM_VECTORS,
    gl.MAX_FRAGMENT_UNIFORM_VECTORS,
    gl.MAX_VARYING_VECTORS,
    gl.ALIASED_LINE_WIDTH_RANGE,
    gl.ALIASED_POINT_SIZE_RANGE,
    gl.SHADING_LANGUAGE_VERSION,
    gl.VERSION,
  ].map((p) => {
    const value = gl.getParameter(p);
    return value instanceof Float32Array ? [...value].join(",") : String(value);
  });
  return [...params, ...(gl.getSupportedExtensions() ?? [])].join("|");
}

async function audioSignature(): Promise<number | undefined> {
  try {
    const ctx = new OfflineAudioContext(1, 5000, 44100);
    const oscillator = ctx.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = 10000;
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;
    oscillator.connect(compressor);
    compressor.connect(ctx.destination);
    oscillator.start(0);

    const timeout = new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1500));
    const buffer = await Promise.race([ctx.startRendering(), timeout]);
    if (!buffer) return undefined;
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 4500; i < 5000; i++) sum += Math.abs(data[i]);
    return sum;
  } catch {
    return undefined;
  }
}

const FONT_CANDIDATES = [
  "Arial", "Arial Narrow", "Bahnschrift", "Calibri", "Cambria", "Candara", "Century Gothic", "Comic Sans MS",
  "Consolas", "Courier New", "Franklin Gothic Medium", "Garamond", "Georgia", "Impact", "Lucida Console",
  "Palatino Linotype", "Segoe UI", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana", "Wingdings",
  "Helvetica", "Helvetica Neue", "Avenir", "Futura", "Gill Sans", "Menlo", "Monaco", "Optima", "SF Pro Text",
  "Lucida Grande", "Roboto", "Noto Sans", "Ubuntu", "Cantarell", "DejaVu Sans", "Liberation Sans",
  "Open Sans", "Lato", "Fira Code", "JetBrains Mono", "Source Code Pro", "Myriad Pro", "Minion Pro",
  "Microsoft YaHei", "PingFang SC", "MS Gothic", "Meiryo", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji",
];

function detectFonts() {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return [];
  const sample = "mmmmmmmmmmlliWW@#0123456789";
  const bases = ["monospace", "sans-serif", "serif"];
  const width = (font: string) => {
    ctx.font = `72px ${font}`;
    return ctx.measureText(sample).width;
  };
  const baseWidths = bases.map(width);
  return FONT_CANDIDATES.filter((font) => bases.some((base, i) => width(`"${font}", ${base}`) !== baseWidths[i]));
}

export async function computeFingerprint(info: StaticInfo) {
  const canvas = canvasImage();
  const webgl = webglSignature();
  const [audio, fonts] = [await audioSignature(), detectFonts()];

  const components = {
    userAgent: info.ua,
    languages: info.languages.join(","),
    timeZone: info.timeZone,
    screen: `${info.screen} @${info.pixelRatio}x ${info.colorDepth}bit`,
    hardware: `${info.cores ?? "?"} cores / ${info.memoryGb ?? "?"} GB / ${info.touchPoints} touch`,
    gpu: `${info.gpuVendor ?? "?"} — ${info.gpuRenderer ?? "?"}`,
    canvas: canvas ? await sha256(canvas) : "unavailable",
    webgl: webgl ? await sha256(webgl) : "unavailable",
    audio: audio !== undefined ? audio.toFixed(9) : "unavailable",
    fonts: fonts.join(","),
  };

  return {
    id: (await sha256(JSON.stringify(components))).slice(0, 20),
    canvasImage: canvas,
    fonts,
    components,
  };
}

export type Fingerprint = Awaited<ReturnType<typeof computeFingerprint>>;
