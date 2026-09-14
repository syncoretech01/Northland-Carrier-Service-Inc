/* ═══════════════════════════════════════════════════════════════
   Fleet — 3D ring carousel. Drag, arrows, keys, gentle autoplay.
   ═══════════════════════════════════════════════════════════════ */
import gsap from "gsap";

export function initFleetSlider() {
  const stage = document.getElementById("fleetStage");
  const ring = document.getElementById("fleetRing");
  const cards = [...ring.querySelectorAll(".fleet__card")];
  const prev = document.getElementById("fleetPrev");
  const next = document.getElementById("fleetNext");
  const indexEl = document.getElementById("fleetIndex");
  const n = cards.length;
  const step = 360 / n;

  const state = { rot: 0, radius: 0 };
  let dragging = false, startX = 0, startRot = 0, lastX = 0, velocity = 0, idleTimer;

  function layout() {
    const w = cards[0].offsetWidth;
    state.radius = (w / 2) / Math.tan(Math.PI / n) + Math.max(40, w * 0.12);
    cards.forEach((c, i) => {
      c.style.transform = `rotateY(${i * step}deg) translateZ(${state.radius}px)`;
    });
    apply();
  }

  function apply() {
    ring.style.transform = `translateZ(${-state.radius}px) rotateY(${state.rot}deg)`;
    cards.forEach((c, i) => {
      const a = ((i * step + state.rot) % 360 + 360) % 360;
      const facing = Math.cos((a * Math.PI) / 180); // 1 = front, -1 = back
      c.classList.toggle("is-back", facing < 0.1);
      c.style.opacity = facing < -0.35 ? 0 : 1;
      c.style.pointerEvents = facing < -0.35 ? "none" : "auto";
    });
    const active = ((Math.round(-state.rot / step) % n) + n) % n;
    indexEl.textContent = String(active + 1).padStart(2, "0");
  }

  function snapTo(rot, dur = 1.2) {
    gsap.to(state, { rot, duration: dur, ease: "expo.out", onUpdate: apply, overwrite: true });
  }
  function go(dir) {
    const target = Math.round(state.rot / step) * step - dir * step;
    snapTo(target);
    resetIdle();
  }

  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  window.addEventListener("keydown", (e) => {
    const r = stage.getBoundingClientRect();
    if (r.top > window.innerHeight || r.bottom < 0) return;
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  });

  stage.addEventListener("pointerdown", (e) => {
    dragging = true; startX = lastX = e.clientX; startRot = state.rot; velocity = 0;
    gsap.killTweensOf(state);
    stage.setPointerCapture(e.pointerId);
    stage.style.cursor = "grabbing";
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    velocity = e.clientX - lastX; lastX = e.clientX;
    state.rot = startRot + (e.clientX - startX) * 0.22;
    apply();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    stage.style.cursor = "";
    const projected = state.rot + velocity * 4;
    snapTo(Math.round(projected / step) * step, 1.4);
    resetIdle();
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);
  stage.addEventListener("pointerleave", release);

  // Slow autoplay when idle
  let auto;
  function startAuto() {
    clearInterval(auto);
    auto = setInterval(() => { if (!dragging) go(1); }, 4200);
  }
  function resetIdle() { clearInterval(auto); clearTimeout(idleTimer); idleTimer = setTimeout(startAuto, 6000); }
  stage.addEventListener("pointerenter", () => clearInterval(auto));
  stage.addEventListener("pointerleave", resetIdle);

  window.addEventListener("resize", layout);
  layout();
  startAuto();

  // Entrance: fan the ring in
  gsap.from(state, {
    rot: -180, duration: 2.2, ease: "expo.out", onUpdate: apply,
    scrollTrigger: { trigger: stage, start: "top 80%", once: true }
  });
}
