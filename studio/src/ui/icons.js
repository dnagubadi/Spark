// Our own SVG icons (trusted markup). Journey icons match the design canvas.

const stroke = (size, body, extra = "") =>
  `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${body}</svg>`;

const JOURNEY_PATHS = {
  "change-it": '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  "hear-it": '<path d="M3 12h2l2-6 3 12 3-9 2 6 2-3h4"/>',
  "catch-it": '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
  "explore-it": '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  "build-it": '<rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><rect x="8" y="3" width="8" height="8" rx="1"/>',
};

export function journeyIcon(id, size = 22) {
  return stroke(size, JOURNEY_PATHS[id] || JOURNEY_PATHS["change-it"]);
}

export const plusIcon = (size = 56) => stroke(size, '<path d="M12 5v14M5 12h14"/>');

export function logo(size = 44) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 40 40"><path d="M6 22a14 14 0 0 1 28 0z" fill="#FF7A1A"/><path d="M6 22a14 14 0 0 0 28 0z" fill="#2F6FED"/><path d="M32 3l1.8 4.2L38 9l-4.2 1.8L32 15l-1.8-4.2L26 9l4.2-1.8z" fill="#FFD23F"/></svg>`;
}

export function friendlyFace() {
  return `<svg aria-hidden="true" width="140" height="120" viewBox="0 0 140 120"><path d="M20 76a50 50 0 0 1 100 0z" fill="#FF7A1A"/><path d="M20 76a50 50 0 0 0 100 0z" fill="#2F6FED"/><circle cx="54" cy="64" r="6" fill="#1B2A4A"/><circle cx="86" cy="64" r="6" fill="#1B2A4A"/><path d="M58 92q12-8 24 0" stroke="#FFF6EA" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M118 8l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFD23F"/></svg>`;
}

// Skeuomorphic Spark-Plug parts, drawn like the design's control strip.
let uid = 0;
export function knobSVG() {
  const id = `kn${++uid}`;
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const a = ((-135 + i * 27) * Math.PI) / 180;
    const x1 = (Math.sin(a) * 25).toFixed(1), y1 = (-Math.cos(a) * 25).toFixed(1);
    const x2 = (Math.sin(a) * 29).toFixed(1), y2 = (-Math.cos(a) * 29).toFixed(1);
    ticks.push(`<line class="tick" data-i="${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E3D3C3" stroke-width="2.5" stroke-linecap="round"/>`);
  }
  return `<svg aria-hidden="true" width="64" height="64" viewBox="-31 -31 62 62"><defs><radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.55" stop-color="#F1EAE2"/><stop offset="1" stop-color="#BDB1A4"/></radialGradient></defs>${ticks.join("")}<circle cx="0" cy="1.5" r="21.5" fill="#0F1A30"/><circle r="21" fill="#1B2A4A"/><circle r="19.5" fill="none" stroke="#33415C" stroke-width="3" stroke-dasharray="2.4 2.2"/><circle r="14.5" fill="url(#${id})"/><g class="needle"><line x1="0" y1="-5" x2="0" y2="-12.5" stroke="#1B2A4A" stroke-width="3.5" stroke-linecap="round"/></g></svg>`;
}

export function stickSVG() {
  const id = `js${++uid}`;
  return `<svg aria-hidden="true" width="72" height="60" viewBox="0 0 76 64"><defs><radialGradient id="${id}b" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#A9C4FF"/><stop offset="0.45" stop-color="#2F6FED"/><stop offset="1" stop-color="#1B3F99"/></radialGradient><linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#8A97B0"/><stop offset="0.5" stop-color="#EEF1F6"/><stop offset="1" stop-color="#8A97B0"/></linearGradient></defs><rect x="4" y="44" width="68" height="16" rx="8" fill="#1B2A4A"/><ellipse cx="38" cy="46" rx="32" ry="8" fill="#4A5874"/><ellipse cx="38" cy="46" rx="13" ry="4" fill="#1B2A4A"/><g class="stick-top"><rect x="35" y="22" width="6" height="25" rx="2" fill="url(#${id}s)"/><circle cx="38" cy="18" r="15" fill="url(#${id}b)"/><ellipse cx="32.5" cy="11.5" rx="5" ry="3" fill="#FFFFFF" opacity="0.75"/></g></svg>`;
}

export function capSVG(fill) {
  return `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="13" r="11" fill="#1B2A4A"/><circle cx="12" cy="11.5" r="8" fill="${fill}" stroke="#1B2A4A" stroke-opacity="0.3" stroke-width="1.5"/><ellipse cx="9.5" cy="8.5" rx="3" ry="1.8" fill="#FFFFFF" opacity="0.75"/></svg>`;
}
