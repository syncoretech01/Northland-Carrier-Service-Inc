/* ═══════════════════════════════════════════════════════════════
   Custom cursor + magnetic elements + 3D tilt cards
   ═══════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { animate } from "motion";

export const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

export function initCursor() {
  if (isTouch) return;
  document.body.classList.add("has-cursor");

  const cursor = document.getElementById("cursor");
  const dot = cursor.querySelector(".cursor__dot");
  const ring = cursor.querySelector(".cursor__ring");
  const label = cursor.querySelector(".cursor__label");

  const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
  const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
  const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" });
  const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });

  // Stay hidden until the pointer actually enters, so the ring never sits at (0,0)
  cursor.classList.add("-hidden");
  let primed = false;
  window.addEventListener("pointermove", (e) => {
    if (!primed) {
      primed = true;
      gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
      cursor.classList.remove("-hidden");
    }
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
  }, { passive: true });

  document.addEventListener("mouseleave", () => cursor.classList.add("-hidden"));
  document.addEventListener("mouseenter", () => cursor.classList.remove("-hidden"));

  const modes = { "-sm": { scale: 1.6, text: "" }, "-view": { scale: 2.6, text: "View" }, "-drag": { scale: 2.6, text: "Drag" } };
  const setMode = (mode) => {
    cursor.classList.remove("-sm", "-view", "-drag");
    if (mode && modes[mode]) {
      cursor.classList.add(mode);
      label.textContent = modes[mode].text;
      gsap.to(ring, { scale: modes[mode].scale, duration: 0.5, ease: "expo.out" });
      gsap.to(dot, { scale: mode === "-sm" ? 0 : 0, duration: 0.3 });
    } else {
      gsap.to(ring, { scale: 1, duration: 0.5, ease: "expo.out" });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    }
  };

  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest("[data-cursor]");
    setMode(t ? t.dataset.cursor : null);
  });
  document.addEventListener("pointerout", (e) => {
    const t = e.target.closest("[data-cursor]");
    if (t && !t.contains(e.relatedTarget)) setMode(null);
  });

  document.addEventListener("pointerdown", () => gsap.to(ring, { scale: "-=0.3", duration: 0.2 }));
  document.addEventListener("pointerup", () => gsap.to(ring, { scale: "+=0.3", duration: 0.4, ease: "expo.out" }));
}

/* Magnetic buttons — Motion springs pull the element toward the pointer */
export function initMagnetic() {
  if (isTouch) return;
  document.querySelectorAll(".magnetic").forEach((el) => {
    const strength = 0.35;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      animate(el, { x, y }, { type: "spring", stiffness: 260, damping: 22, mass: 0.6 });
    });
    el.addEventListener("pointerleave", () => {
      animate(el, { x: 0, y: 0 }, { type: "spring", stiffness: 180, damping: 14, mass: 0.8 });
    });
  });
}

/* 3D tilt — perspective card rotation with glare tracking */
export function initTilt() {
  if (isTouch) return;
  document.querySelectorAll(".tilt").forEach((card) => {
    const inner = card.querySelector(".tilt__inner");
    const rx = gsap.quickTo(inner, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(inner, "rotationY", { duration: 0.6, ease: "power3" });
    const sc = gsap.quickTo(inner, "scale", { duration: 0.6, ease: "power3" });
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * 16);
      rx((0.5 - py) * 14);
      sc(1.025);
      inner.style.setProperty("--gx", `${px * 100}%`);
      inner.style.setProperty("--gy", `${py * 100}%`);
    });
    card.addEventListener("pointerleave", () => { rx(0); ry(0); sc(1); });
  });
}
