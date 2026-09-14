/* ═══════════════════════════════════════════════════════════════
   Procedural material textures — concrete, asphalt, sand, gravel,
   crushed stone, fill dirt, topsoil, debris. Rendered to canvas.
   ═══════════════════════════════════════════════════════════════ */

// Deterministic PRNG so every texture renders identically each load
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function noiseLayer(ctx, w, h, rand, { alpha = 0.08, size = 2, count = 6000, colors = ["#000", "#fff"] }) {
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = alpha * (0.5 + rand());
    ctx.fillStyle = colors[Math.floor(rand() * colors.length)];
    const s = size * (0.5 + rand());
    ctx.fillRect(rand() * w, rand() * h, s, s);
  }
  ctx.globalAlpha = 1;
}

function vignette(ctx, w, h, strength = 0.45) {
  const g = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function polygon(ctx, cx, cy, r, sides, rand, jitter = 0.35) {
  ctx.beginPath();
  const rot = rand() * Math.PI * 2;
  for (let i = 0; i < sides; i++) {
    const a = rot + (i / sides) * Math.PI * 2;
    const rr = r * (1 - jitter + rand() * jitter * 2);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr * 0.8;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

const TEXTURES = {
  concrete(ctx, w, h) {
    const rand = rng(11);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#B9B6AE"); g.addColorStop(1, "#8F8C85");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    noiseLayer(ctx, w, h, rand, { alpha: 0.12, size: 2, count: 14000, colors: ["#6E6B66", "#D6D3CB", "#A19E97"] });
    // pitting
    for (let i = 0; i < 260; i++) {
      ctx.globalAlpha = 0.25 + rand() * 0.35;
      ctx.fillStyle = rand() > 0.5 ? "#5F5C57" : "#CFCBC2";
      ctx.beginPath(); ctx.arc(rand() * w, rand() * h, rand() * 3 + 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // form lines
    ctx.strokeStyle = "rgba(60,58,54,0.35)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, h * 0.62); ctx.lineTo(w, h * 0.6); ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h * 0.62 + 3); ctx.lineTo(w, h * 0.6 + 3); ctx.stroke();
    vignette(ctx, w, h, 0.4);
  },

  asphalt(ctx, w, h) {
    const rand = rng(23);
    ctx.fillStyle = "#26282B"; ctx.fillRect(0, 0, w, h);
    noiseLayer(ctx, w, h, rand, { alpha: 0.35, size: 2.4, count: 20000, colors: ["#0F1113", "#4A4D52", "#33363A", "#5B5E63"] });
    for (let i = 0; i < 1400; i++) {
      ctx.globalAlpha = 0.5 + rand() * 0.5;
      ctx.fillStyle = rand() > 0.7 ? "#6C6F74" : "#141618";
      polygon(ctx, rand() * w, rand() * h, 1.5 + rand() * 3, 5, rand, 0.4);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // lane stripe
    ctx.fillStyle = "rgba(242,106,27,0.85)";
    for (let x = -40; x < w; x += 110) ctx.fillRect(x, h * 0.78, 60, 6);
    vignette(ctx, w, h, 0.5);
  },

  sand(ctx, w, h) {
    const rand = rng(37);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#E1CBA3"); g.addColorStop(1, "#BFA47A");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    noiseLayer(ctx, w, h, rand, { alpha: 0.28, size: 1.6, count: 26000, colors: ["#8F7452", "#F3E3C4", "#C9AD84", "#A88B62"] });
    // ripples
    ctx.strokeStyle = "rgba(120,92,58,0.22)"; ctx.lineWidth = 3;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      const y = (i / 18) * h + rand() * 20;
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y + Math.sin((x + i * 50) * 0.02) * 12);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,240,210,0.35)"; ctx.lineWidth = 1.5;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      const y = (i / 18) * h + 6 + rand() * 20;
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y + Math.sin((x + i * 50) * 0.02) * 12);
      ctx.stroke();
    }
    vignette(ctx, w, h, 0.35);
  },

  gravel(ctx, w, h) {
    const rand = rng(41);
    ctx.fillStyle = "#6F675C"; ctx.fillRect(0, 0, w, h);
    const palette = ["#9E9486", "#B8AE9E", "#7B7268", "#C9C0B0", "#8A8175", "#D8CFBF", "#5E574E"];
    for (let i = 0; i < 2200; i++) {
      const r = 3 + rand() * 9;
      ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.ellipse(rand() * w, rand() * h, r, r * (0.6 + rand() * 0.4), rand() * Math.PI, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.35; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.ellipse(rand() * w, rand() * h, r * 0.4, r * 0.25, rand() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    vignette(ctx, w, h, 0.45);
  },

  stone(ctx, w, h) {
    const rand = rng(53);
    ctx.fillStyle = "#5B5F63"; ctx.fillRect(0, 0, w, h);
    const palette = ["#8B9096", "#A7ACB2", "#6B7075", "#C2C6CB", "#7C8187", "#9DA2A8", "#4F5357"];
    for (let i = 0; i < 1300; i++) {
      const r = 6 + rand() * 18;
      const x = rand() * w, y = rand() * h;
      ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
      polygon(ctx, x, y, r, 5 + Math.floor(rand() * 3), rand, 0.45);
      ctx.fill();
      ctx.strokeStyle = "rgba(20,22,25,0.45)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      polygon(ctx, x - r * 0.2, y - r * 0.25, r * 0.4, 4, rand, 0.3);
      ctx.fill();
    }
    vignette(ctx, w, h, 0.5);
  },

  dirt(ctx, w, h) {
    const rand = rng(67);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#8B6A47"); g.addColorStop(1, "#5E4630");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    noiseLayer(ctx, w, h, rand, { alpha: 0.3, size: 2.6, count: 22000, colors: ["#3E2C1B", "#A98A62", "#6F5439", "#C6A57C"] });
    for (let i = 0; i < 500; i++) {
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = rand() > 0.5 ? "#4A3521" : "#B69470";
      ctx.beginPath(); ctx.ellipse(rand() * w, rand() * h, 3 + rand() * 8, 2 + rand() * 5, rand() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    vignette(ctx, w, h, 0.5);
  },

  topsoil(ctx, w, h) {
    const rand = rng(71);
    ctx.fillStyle = "#3A2A1E"; ctx.fillRect(0, 0, w, h);
    noiseLayer(ctx, w, h, rand, { alpha: 0.35, size: 2.2, count: 24000, colors: ["#1F1510", "#5C4230", "#3F2E22", "#7A5A40", "#2A1D15"] });
    for (let i = 0; i < 380; i++) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = rand() > 0.6 ? "#6B8E3A" : "#8C6A48";
      ctx.beginPath(); ctx.ellipse(rand() * w, rand() * h, 2 + rand() * 6, 1 + rand() * 3, rand() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    vignette(ctx, w, h, 0.55);
  },

  debris(ctx, w, h) {
    const rand = rng(89);
    ctx.fillStyle = "#6A6560"; ctx.fillRect(0, 0, w, h);
    noiseLayer(ctx, w, h, rand, { alpha: 0.2, size: 2.5, count: 12000, colors: ["#3A3733", "#A8A39C", "#7D7872"] });
    const palette = ["#B03B2E", "#8E8A84", "#C9C2B6", "#5A5651", "#D9A066", "#3D3A36", "#A67A52"];
    for (let i = 0; i < 420; i++) {
      const x = rand() * w, y = rand() * h;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rand() * Math.PI);
      ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
      ctx.globalAlpha = 0.92;
      const rw = 10 + rand() * 60, rh = 4 + rand() * 18;
      ctx.fillRect(-rw / 2, -rh / 2, rw, rh);
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(-rw / 2, -rh / 2, rw, rh * 0.3);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    vignette(ctx, w, h, 0.5);
  }
};

export function paintTexture(canvas, name, w = 900, h = 1100) {
  const fn = TEXTURES[name] || TEXTURES.gravel;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  fn(ctx, w, h);
  return canvas;
}

const dataUrlCache = {};
export function textureDataURL(name, w = 1200, h = 900) {
  const key = `${name}-${w}x${h}`;
  if (!dataUrlCache[key]) {
    const c = document.createElement("canvas");
    paintTexture(c, name, w, h);
    dataUrlCache[key] = c.toDataURL("image/jpeg", 0.85);
  }
  return dataUrlCache[key];
}

export function initTextures() {
  document.querySelectorAll("canvas[data-texture]").forEach((c) => {
    paintTexture(c, c.dataset.texture, 720, 880);
  });

  // Image fallback — swap any failed remote photo for a procedural texture
  const applyFallback = (img) => {
    const name = img.dataset.fallback || "gravel";
    img.src = textureDataURL(name, 1200, 900);
    img.removeAttribute("data-fallback");
  };
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.src) applyFallback(img);
    img.addEventListener("error", () => applyFallback(img), { once: true });
  });
}
