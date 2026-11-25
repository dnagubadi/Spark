// Change It: the drawing. p5.js draws the one thing the kid shapes, from the Spark's
// recipe (base, parts, stand, colors) plus the live state (knob values, buttons,
// joystick, reveal). Every option here matches an item in shared/change-it/menu.js.
//
// createScene(container, getState) -> { remove() }
// getState() is called every frame and returns:
//   { base, parts, stand, stageColor, color, accent,
//     moves: { "stretch-tall": 0..1, ... }, pattern, stickers: [],
//     spin, tilt, reveal: { kind, t } | null, revealDone }

import p5 from "p5";

const NEUTRAL = { "stretch-tall": 0.5, "stretch-wide": 0.5, "bend-sides": 0.5, wobble: 0, taper: 0.5, "puff-top": 0.15 };

// ---------- Body outlines: half-width (0..1) at height t (0 = bottom, 1 = top) ----------
const PROFILES = {
  vase: (t) => 0.55 + 0.45 * Math.sin(Math.PI * (0.15 + t * 0.8)) - (t > 0.82 ? (t - 0.82) * 1.2 : 0),
  bowl: (t) => 0.55 + 0.45 * Math.sqrt(t),
  round: (t) => Math.max(0.18, Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2))),
  box: () => 1,
  cone: (t) => 1 - 0.88 * t,
  tower: () => 0.62,
  bottle: (t) => (t < 0.6 ? 1 : t < 0.8 ? 1 - ((t - 0.6) / 0.2) * 0.62 : 0.38),
};
const STRAIGHT = { vase: 0.8, bowl: 0.8, round: 0.75, box: 1, cone: null, tower: 0.62, bottle: null };
const HEIGHT = { vase: 1, bowl: 0.5, round: 0.8, box: 0.8, cone: 1, tower: 1.25, bottle: 1.1 };
const OPEN_TOP = new Set(["vase", "bowl", "bottle"]);

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
// Darker, richer version of the same color (used for the kiln firing).
function deepen(hex, t) {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 - 0.35 * t;
  return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * (1 - 0.2 * t))})`;
}
function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
}
const ease = (t) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
const smooth = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };

// A seeded random list so speckles don't jump around every frame.
function seeded(n, seed = 7) {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => [r(), r(), r()]);
}
const SPECKS = seeded(90);
const SNOW = seeded(40, 11);

export function createScene(container, getState) {
  let particles = [];

  const sketch = (p) => {
    p.setup = () => {
      const { width, height } = container.getBoundingClientRect();
      p.createCanvas(Math.max(200, width), Math.max(200, height));
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      p.frameRate(60);
    };
    p.windowResized = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width && height) p.resizeCanvas(width, height);
    };
    p.draw = () => draw(p, getState());
  };

  function draw(p, s) {
    const ctx = p.drawingContext;
    const W = p.width, H = p.height;
    p.clear();
    p.background(s.stageColor);

    const m = { ...NEUTRAL, ...s.moves };
    const reveal = s.reveal;
    const rt = reveal ? reveal.t : 0;
    const k = reveal ? ease(rt / 2.2) : 0; // reveal progress 0..1

    // ----- size -----
    const groundY = H * 0.74;
    const unit = Math.min(W * 0.42, H * 0.5);
    let bodyH = unit * HEIGHT[s.base] * (0.55 + m["stretch-tall"] * 0.9);
    if (reveal?.kind === "bake") bodyH *= 1 + 0.08 * k;
    const bodyW = unit * 0.62 * (0.5 + m["stretch-wide"] * 1.0);
    const floats = s.stand === "none";
    const bob = floats ? Math.sin(p.millis() / 600) * 6 : 0;
    const standLift = s.stand === "pedestal" ? H * 0.12 : s.stand === "wheel" ? 10 : s.stand === "plate" ? 6 : 0;
    const baseY = groundY - standLift - (s.parts.includes("legs") ? 18 : 0) - (s.parts.includes("wheels") ? 14 : 0) + bob;
    const cx = W / 2;

    // ----- outline -----
    const profile = PROFILES[s.base];
    const straight = STRAIGHT[s.base];
    const radius = (t) => {
      let r = profile(t);
      if (straight !== null) r = straight + (r - straight) * (0.2 + m["bend-sides"] * 1.6);
      else r = r * (0.85 + m["bend-sides"] * 0.3);
      if (s.base === "box") r += (m["bend-sides"] - 0.35) * 0.35 * Math.sin(Math.PI * t);
      r *= 1 + (m.taper - 0.5) * 1.6 * t;
      r += m["puff-top"] * 0.5 * smooth(0.55, 0.95, t) * (1 - t) * 3;
      r += m.wobble * 0.12 * Math.sin(t * 26 + s.spin * 3);
      return Math.max(0.06, r);
    };
    const N = 48;
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push([t, (radius(t) * bodyW) / 2]);
    }
    const yAt = (t) => baseY - t * bodyH;
    const domeH = (OPEN_TOP.has(s.base) ? 0 : 0.06 + m["puff-top"] * 0.3) * bodyH;

    const body = new Path2D();
    body.moveTo(cx - pts[0][1], yAt(0));
    for (const [t, r] of pts) body.lineTo(cx - r, yAt(t));
    const topR = pts[N][1];
    if (domeH > 0) body.quadraticCurveTo(cx, yAt(1) - domeH * 2, cx + topR, yAt(1));
    else body.lineTo(cx + topR, yAt(1));
    for (let i = N; i >= 0; i--) body.lineTo(cx + pts[i][1], yAt(pts[i][0]));
    body.closePath();

    ctx.save();
    ctx.translate(cx, baseY);
    ctx.rotate(s.tilt * 0.22);
    ctx.translate(-cx, -baseY);

    // ----- glow behind (reveals) -----
    if (reveal || s.revealDone) {
      const glow = reveal ? Math.sin(Math.min(1, rt / 2.2) * Math.PI) : 0.25;
      const g = { fire: "#FF7A1A", bake: "#FFD23F", sparkle: "#FFD23F", freeze: "#9FD0FF" }[reveal?.kind || s.revealDone] || "#FFD23F";
      const grad = ctx.createRadialGradient(cx, yAt(0.5), 10, cx, yAt(0.5), bodyH);
      grad.addColorStop(0, mixHex(g, "#FFFFFF", 0.2).replace("rgb", "rgba").replace(")", `,${0.65 * glow})`));
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    drawStand(p, ctx, s, cx, groundY, standLift, bodyW, pts[0][1]);
    drawBackParts(p, ctx, s, cx, yAt, radius, bodyW, bodyH, baseY, pts[0][1]);

    // ----- body color, after any reveal -----
    let fill = s.color;
    const done = s.revealDone;
    const kind = reveal?.kind || done;
    const kk = reveal ? k : done ? 1 : 0;
    if (kind === "fire") fill = deepen(s.color, kk);
    else if (kind === "bake") fill = mixHex(s.color, "#D9963F", 0.45 * kk);
    else if (kind === "freeze") fill = mixHex(s.color, "#CFE8FF", 0.5 * kk);

    ctx.fillStyle = fill;
    ctx.fill(body);

    // Pattern + shading clipped to the body.
    ctx.save();
    ctx.clip(body);
    drawPattern(ctx, s, cx, yAt, bodyW, bodyH);
    const shade = ctx.createLinearGradient(cx - bodyW / 2, 0, cx + bodyW / 2, 0);
    const gloss = kind === "fire" ? 0.25 + 0.3 * kk : kind === "freeze" ? 0.35 : 0.22;
    shade.addColorStop(0, "rgba(255,255,255,0)");
    shade.addColorStop(0.22, `rgba(255,255,255,${gloss})`);
    shade.addColorStop(0.38, "rgba(255,255,255,0)");
    shade.addColorStop(0.75, "rgba(15,26,48,0.05)");
    shade.addColorStop(1, "rgba(15,26,48,0.28)");
    ctx.fillStyle = shade;
    ctx.fillRect(cx - bodyW, yAt(1) - bodyH, bodyW * 2, bodyH * 3);
    if (kind === "freeze") drawFrost(ctx, cx, yAt, bodyW, bodyH, kk);
    ctx.restore();

    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(27,42,74,0.55)";
    ctx.stroke(body);

    if (OPEN_TOP.has(s.base)) {
      ctx.fillStyle = s.accent;
      ctx.beginPath();
      ctx.ellipse(cx, yAt(1), topR, Math.max(4, topR * 0.22), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawFrontParts(p, ctx, s, cx, yAt, radius, bodyW, bodyH, topR, domeH);
    drawStickers(ctx, s, cx, yAt, radius, bodyW);
    ctx.restore();

    drawRevealParticles(p, ctx, s, reveal, cx, yAt, bodyW, bodyH);
  }

  // ----- stand -----
  function drawStand(p, ctx, s, cx, groundY, lift, bodyW, bottomR) {
    const w = Math.max(bodyW * 0.75, bottomR * 2.4);
    ctx.fillStyle = "rgba(27,42,74,0.12)";
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 8, w * 0.75, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    if (s.stand === "wheel") {
      ctx.fillStyle = "#33415C";
      ctx.beginPath(); ctx.ellipse(cx, groundY + 2, w * 0.95, 30, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8A97B0";
      ctx.beginPath(); ctx.ellipse(cx, groundY - 8, w * 0.9, 24, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#C9CED8"; ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const a = s.spin * 2 + (i * Math.PI) / 3;
        if (Math.sin(a) < 0) continue;
        const x = cx + Math.cos(a) * w * 0.8;
        ctx.beginPath(); ctx.moveTo(x, groundY - 14); ctx.lineTo(x, groundY - 2); ctx.stroke();
      }
    } else if (s.stand === "plate") {
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#C9B6A6"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(cx, groundY - 4, w * 0.85, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (s.stand === "pedestal") {
      const top = groundY - lift;
      ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "#C9B6A6"; ctx.lineWidth = 3;
      ctx.fillRect(cx - w * 0.55, top, w * 1.1, lift);
      ctx.strokeRect(cx - w * 0.55, top, w * 1.1, lift);
      ctx.fillStyle = "#F0DCCB";
      ctx.fillRect(cx - w * 0.65, top - 8, w * 1.3, 10);
    } else if (s.stand === "table") {
      ctx.fillStyle = "#C98A5B";
      ctx.fillRect(0, groundY - 2, p.width, 18);
      ctx.fillStyle = "#A9693F";
      ctx.fillRect(0, groundY + 16, p.width, 6);
    }
  }

  // ----- parts behind the body -----
  function drawBackParts(p, ctx, s, cx, yAt, radius, bodyW, bodyH, baseY, bottomR) {
    const parts = s.parts;
    ctx.lineCap = "round";
    if (parts.includes("wings")) {
      const y = yAt(0.6), r = (radius(0.6) * bodyW) / 2;
      const flap = Math.sin(p.millis() / 220) * 0.15;
      ctx.fillStyle = mixHex(s.color, "#FFFFFF", 0.55);
      ctx.strokeStyle = s.accent; ctx.lineWidth = 3;
      for (const dir of [-1, 1]) {
        ctx.save();
        ctx.translate(cx + dir * r * 0.8, y);
        ctx.rotate(dir * (-0.5 + flap));
        ctx.beginPath(); ctx.ellipse(dir * bodyH * 0.18, 0, bodyH * 0.22, bodyH * 0.1, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    }
    if (parts.includes("legs")) {
      ctx.strokeStyle = s.accent; ctx.lineWidth = 8;
      for (const dx of [-0.5, 0, 0.5]) {
        ctx.beginPath(); ctx.moveTo(cx + dx * bottomR * 1.4, baseY - 2); ctx.lineTo(cx + dx * bottomR * 1.6, baseY + 18); ctx.stroke();
      }
    }
    if (parts.includes("handles")) {
      const y = yAt(0.62), r = (radius(0.62) * bodyW) / 2;
      ctx.strokeStyle = s.color; ctx.lineWidth = 12;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + dir * r, y, bodyH * 0.09, bodyH * 0.12, 0, dir < 0 ? Math.PI / 2 : -Math.PI / 2, dir < 0 ? (3 * Math.PI) / 2 : Math.PI / 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(27,42,74,0.35)"; ctx.lineWidth = 2;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(cx + dir * r, y, bodyH * 0.09 + 6, bodyH * 0.12 + 6, 0, dir < 0 ? Math.PI / 2 : -Math.PI / 2, dir < 0 ? (3 * Math.PI) / 2 : Math.PI / 2);
        ctx.stroke();
      }
    }
    if (parts.includes("spout")) {
      const y = yAt(0.55), r = (radius(0.55) * bodyW) / 2;
      ctx.fillStyle = s.color; ctx.strokeStyle = "rgba(27,42,74,0.55)"; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + r - 6, y + bodyH * 0.12);
      ctx.quadraticCurveTo(cx + r + bodyH * 0.15, y + bodyH * 0.05, cx + r + bodyH * 0.25, y - bodyH * 0.18);
      ctx.lineTo(cx + r + bodyH * 0.2, y - bodyH * 0.2);
      ctx.quadraticCurveTo(cx + r + bodyH * 0.08, y - bodyH * 0.02, cx + r - 6, y - bodyH * 0.04);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  // ----- parts in front of / on top of the body -----
  function drawFrontParts(p, ctx, s, cx, yAt, radius, bodyW, bodyH, topR, domeH) {
    const parts = s.parts;
    const topY = yAt(1) - domeH;
    if (parts.includes("wheels")) {
      const r0 = (radius(0) * bodyW) / 2;
      for (const dir of [-1, 1]) {
        const x = cx + dir * r0 * 0.75, y = yAt(0) + 10;
        ctx.fillStyle = "#1B2A4A"; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#C9CED8"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(s.spin * 4) * 12, y + Math.sin(s.spin * 4) * 12); ctx.stroke();
      }
    }
    if (parts.includes("lid")) {
      ctx.fillStyle = s.accent;
      ctx.beginPath(); ctx.ellipse(cx, yAt(1) - 4, topR * 1.08, Math.max(6, topR * 0.25), 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, yAt(1) - 14, Math.max(6, topR * 0.2), 0, Math.PI * 2); ctx.fill();
    }
    if (parts.includes("antenna")) {
      ctx.strokeStyle = s.accent; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx + Math.sin(p.millis() / 400) * 4, topY - bodyH * 0.22); ctx.stroke();
      ctx.fillStyle = "#FF7A1A";
      ctx.beginPath(); ctx.arc(cx + Math.sin(p.millis() / 400) * 4, topY - bodyH * 0.22, 9, 0, Math.PI * 2); ctx.fill();
    }
    if (parts.includes("leaf")) {
      ctx.strokeStyle = "#3F7D3A"; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx, topY); ctx.quadraticCurveTo(cx + 4, topY - 20, cx - 2, topY - 34); ctx.stroke();
      ctx.fillStyle = "#5FAE4E";
      ctx.beginPath(); ctx.ellipse(cx + 16, topY - 26, 18, 8, -0.5, 0, Math.PI * 2); ctx.fill();
    }
    if (parts.includes("candles")) {
      const span = Math.min(topR * 1.2, 70);
      for (const dx of [-0.6, 0, 0.6]) {
        const x = cx + dx * span, y = topY + 4;
        ctx.fillStyle = dx === 0 ? "#2F6FED" : "#FFFFFF";
        ctx.strokeStyle = "#1B2A4A"; ctx.lineWidth = 2;
        ctx.fillRect(x - 5, y - 32, 10, 32); ctx.strokeRect(x - 5, y - 32, 10, 32);
        const fl = 1 + Math.sin(p.millis() / 90 + dx * 5) * 0.15;
        ctx.fillStyle = "#FF7A1A";
        ctx.beginPath(); ctx.ellipse(x, y - 42, 5 * fl, 9 * fl, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FFD23F";
        ctx.beginPath(); ctx.ellipse(x, y - 40, 2.5, 5, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (parts.includes("face")) {
      const a = Math.sin(s.spin);
      const facing = Math.cos(s.spin);
      if (facing > 0.1) {
        const t = 0.55, r = (radius(t) * bodyW) / 2;
        const fx = cx + a * r * 0.7, fy = yAt(t);
        const sx = Math.max(0.3, facing);
        ctx.fillStyle = "#1B2A4A";
        for (const dx of [-1, 1]) {
          ctx.beginPath(); ctx.ellipse(fx + dx * r * 0.28 * sx, fy, 7 * sx, 9, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = "#1B2A4A"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(fx, fy + 14, r * 0.22 * sx, 9, 0, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      }
    }
  }

  function drawPattern(ctx, s, cx, yAt, bodyW, bodyH) {
    if (!s.pattern) return;
    const ink = s.accent;
    const shift = (s.spin * bodyW * 0.25) % 40;
    ctx.fillStyle = ink;
    ctx.strokeStyle = ink;
    const x0 = cx - bodyW, x1 = cx + bodyW, yTop = yAt(1) - bodyH * 0.3, yBot = yAt(0);
    if (s.pattern === "speckles") {
      for (const [a, b, c] of SPECKS) {
        const x = cx - bodyW / 2 + ((a * bodyW + shift * 3) % bodyW + bodyW) % bodyW;
        ctx.globalAlpha = 0.7;
        ctx.beginPath(); ctx.arc(x, yBot - b * (yBot - yTop), 1.5 + c * 2.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (s.pattern === "stripes") {
      ctx.globalAlpha = 0.85;
      for (let y = yBot - 18; y > yTop; y -= 36) ctx.fillRect(x0, y - 7, x1 - x0, 12);
      ctx.globalAlpha = 1;
    } else if (s.pattern === "zigzag") {
      ctx.lineWidth = 5; ctx.globalAlpha = 0.85;
      for (let y = yBot - 26; y > yTop; y -= 46) {
        ctx.beginPath();
        for (let x = x0 - 40 + shift, i = 0; x < x1 + 40; x += 18, i++) ctx.lineTo(x, y + (i % 2 ? -9 : 9));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    } else if (s.pattern === "dots") {
      const colors = ["#FFD23F", "#FF7A1A", "#2F6FED", "#FFFFFF"];
      let i = 0;
      for (let y = yBot - 14; y > yTop; y -= 26) {
        for (let x = x0 + ((i % 2) * 14) + shift; x < x1; x += 28) {
          ctx.fillStyle = colors[(i + Math.round(x)) % colors.length];
          ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        }
        i++;
      }
    }
  }

  function drawFrost(ctx, cx, yAt, bodyW, bodyH, k) {
    ctx.fillStyle = `rgba(255,255,255,${0.75 * k})`;
    for (const [a, b, c] of SNOW) {
      const edge = a < 0.5 ? a * 0.3 : 1 - (1 - a) * 0.3;
      ctx.beginPath(); ctx.arc(cx - bodyW / 2 + edge * bodyW, yAt(b), 2 + c * 3, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawStickers(ctx, s, cx, yAt, radius, bodyW) {
    s.stickers.forEach((name, i) => {
      const off = (i - (s.stickers.length - 1) / 2) * 0.7;
      const ang = s.spin + off;
      const facing = Math.cos(ang);
      if (facing < 0.15) return;
      const t = 0.35 + (i % 2) * 0.12;
      const r = (radius(t) * bodyW) / 2;
      const x = cx + Math.sin(ang) * r * 0.8, y = yAt(t);
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(Math.max(0.25, facing), 1);
      sticker(ctx, name, 18);
      ctx.restore();
    });
  }

  function sticker(ctx, name, r) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    if (name === "star" || name === "spark") {
      const spikes = name === "star" ? 5 : 4;
      const inner = name === "star" ? r * 0.45 : r * 0.28;
      for (let i = 0; i < spikes * 2; i++) {
        const rad = i % 2 ? inner : r;
        const a = (i * Math.PI) / spikes - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
      }
      ctx.closePath();
      ctx.fillStyle = "#FFD23F";
    } else if (name === "heart") {
      ctx.moveTo(0, r * 0.8);
      ctx.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.4);
      ctx.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.8);
      ctx.fillStyle = "#FF5C8A";
    } else if (name === "flower") {
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5;
        ctx.moveTo(Math.cos(a) * r * 0.55 + r * 0.42, Math.sin(a) * r * 0.55);
        ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.42, 0, Math.PI * 2);
      }
      ctx.fillStyle = "#FF9EC4";
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "#FFD23F";
    } else {
      // bolt
      ctx.moveTo(r * 0.2, -r); ctx.lineTo(-r * 0.6, r * 0.1); ctx.lineTo(0, r * 0.1);
      ctx.lineTo(-r * 0.2, r); ctx.lineTo(r * 0.6, -r * 0.15); ctx.lineTo(0, -r * 0.15); ctx.closePath();
      ctx.fillStyle = "#FFD23F";
    }
    ctx.fill();
    ctx.stroke();
  }

  function drawRevealParticles(p, ctx, s, reveal, cx, yAt, bodyW, bodyH) {
    if (reveal && reveal.t < 2.4 && p.frameCount % 2 === 0) {
      const n = reveal.kind === "sparkle" ? 4 : 2;
      for (let i = 0; i < n; i++) {
        particles.push({
          kind: reveal.kind,
          x: cx + (Math.random() - 0.5) * bodyW * 1.3,
          y: yAt(Math.random()),
          vx: (Math.random() - 0.5) * 1.2,
          vy: -0.6 - Math.random() * 1.4,
          life: 1,
        });
      }
    }
    particles = particles.filter((q) => (q.life -= 0.012) > 0);
    for (const q of particles) {
      q.x += q.vx; q.y += q.vy;
      ctx.globalAlpha = Math.max(0, q.life);
      if (q.kind === "bake") {
        ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 6; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.quadraticCurveTo(q.x + 8 * Math.sin(q.life * 9), q.y - 10, q.x, q.y - 20); ctx.stroke();
      } else if (q.kind === "freeze") {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath(); ctx.arc(q.x, q.y, 3, 0, Math.PI * 2); ctx.fill();
      } else if (q.kind === "fire") {
        ctx.fillStyle = q.life > 0.5 ? "#FFD23F" : "#FF7A1A";
        ctx.beginPath(); ctx.arc(q.x, q.y, 3 + q.life * 4, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#FFD23F";
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.life * 6);
        ctx.fillRect(-1.5, -7, 3, 14); ctx.fillRect(-7, -1.5, 14, 3);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  const instance = new p5(sketch, container);
  const ro = new ResizeObserver(() => instance.windowResized());
  ro.observe(container);
  return {
    remove() {
      ro.disconnect();
      instance.remove();
    },
  };
}
