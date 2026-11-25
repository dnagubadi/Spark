// Take it home: a share code to write down, and a QR code that carries the whole
// Spark inside the link (compressed), so it opens on a grown-up's phone with no
// accounts and no server. Codes only look up Sparks on this station until Supabase is in.

import QRCode from "qrcode";

const WORDS_A = ["COMET", "MAPLE", "OTTER", "PIXEL", "TIGER", "CLOUD", "MANGO", "ROCKET", "PEBBLE", "LUNAR", "CORAL", "BREEZE"];
const WORDS_B = ["CLAY", "SPARK", "DRUM", "WAVE", "FERN", "STAR", "GLOW", "TRAIL", "BLOOM", "ZOOM", "LEAF", "JUMP"];

export function makeCode() {
  const a = WORDS_A[Math.floor(Math.random() * WORDS_A.length)];
  const b = WORDS_B[Math.floor(Math.random() * WORDS_B.length)];
  const n = String(Math.floor(Math.random() * 90) + 10);
  return `${a}-${b}-${n}`;
}

function toBase64Url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  const s = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

async function pipe(bytes, stream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

// The link leaves out the AI draft copy and station details to keep the QR code small.
export async function encodeSpark(spark) {
  const { draft, id, shareCode, createdAt, updatedAt, source, ...rest } = spark;
  const bytes = new TextEncoder().encode(JSON.stringify(rest));
  return toBase64Url(await pipe(bytes, new CompressionStream("deflate-raw")));
}

export async function decodeSpark(packed) {
  const bytes = await pipe(fromBase64Url(packed), new DecompressionStream("deflate-raw"));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function shareLink(spark) {
  return `${location.origin}${location.pathname}#/open/${await encodeSpark(spark)}`;
}

export async function drawQR(canvas, text) {
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel: "L",
    margin: 1,
    width: 352,
    color: { dark: "#1B2A4A", light: "#FFFFFF" },
  });
}
