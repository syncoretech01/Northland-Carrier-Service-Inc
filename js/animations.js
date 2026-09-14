/* ═══════════════════════════════════════════════════════════════
   Scroll & entrance animations — GSAP + ScrollTrigger + SplitText
   ═══════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { textureDataURL } from "./textures.js";
import { isTouch } from "./cursor.js";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ───────────── Hero entrance (called after preloader) ───────────── */
export function heroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to(".hero__word", { y: 0, duration: 1.4, stagger: 0.07 }, 0)
    .to(".hero__eyebrow", { opacity: 1, duration: 1, stagger: 0.1 }, 0.5)
    .to("#heroLede", { opacity: 1, y: 0, duration: 1.2 }, 0.7)
    .to("#heroCta", { opacity: 1, duration: 1.2 }, 0.85)
    .to(".hero__chips .chip", { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 1)
    .to("#heroScroll", { opacity: 1, duration: 1 }, 1.3);
  return tl;
}

/* ───────────── Hero scroll: parallax + 3D zoom hook ───────────── */
export function heroScroll(hero3d) {
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
    onUpdate: (self) => hero3d && hero3d.setScroll(self.progress)
  });
  gsap.to(".hero__title", {
    yPercent: 30, opacity: 0.1, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero__bottom, .hero__chips", {
    yPercent: 60, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true }
  });
}

/* ───────────── Generic reveals ───────────── */
function reveals() {
  document.querySelectorAll(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  document.querySelectorAll(".split-lines").forEach((el) => {
    const split = new SplitText(el, { type: "lines", mask: "lines", linesClass: "line" });
    gsap.from(split.lines, {
      yPercent: 110, duration: 1.3, stagger: 0.09, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true }
    });
  });

  gsap.utils.toArray(".service-card").forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 1.3, ease: "expo.out", delay: (i % 3) * 0.1,
      scrollTrigger: { trigger: card, start: "top 90%", once: true }
    });
  });
}

/* ───────────── Counters ───────────── */
function counters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(obj, {
        v: target, duration: 2.2, ease: "power3.out",
        onUpdate: () => { el.textContent = obj.v.toFixed(decimals) + suffix; }
      })
    });
  });
}

/* ───────────── Manifesto: word-by-word storytelling + parallax ───────────── */
function manifesto() {
  const text = document.getElementById("manifestoText");
  const split = new SplitText(text, { type: "words", wordsClass: "word" });
  gsap.to(split.words, {
    color: "#15171B", stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: text, start: "top 78%", end: "bottom 45%", scrub: 0.6 }
  });

  document.querySelectorAll(".parallax-img").forEach((fig) => {
    const speed = parseFloat(fig.dataset.speed || "0.1");
    gsap.to(fig, {
      yPercent: -speed * 100, ease: "none",
      scrollTrigger: { trigger: ".manifesto", start: "top bottom", end: "bottom top", scrub: true }
    });
    gsap.to(fig.querySelector("img"), {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true }
    });
  });
}

/* ───────────── Materials: horizontal parallax scroll ───────────── */
function materials() {
  const section = document.querySelector(".materials");
  const track = document.getElementById("materialsTrack");
  const progress = document.getElementById("materialsProgress");
  const distance = () => track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft);

  const tween = gsap.to(track, {
    x: () => -distance(), ease: "none",
    scrollTrigger: {
      trigger: section, start: "top top", end: () => "+=" + distance() * (isTouch ? 0.9 : 1.1),
      pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: (self) => { progress.style.width = self.progress * 100 + "%"; }
    }
  });

  // Inner image parallax runs against the horizontal container animation
  document.querySelectorAll(".mat-panel__media canvas").forEach((c) => {
    gsap.fromTo(c, { xPercent: -18 }, {
      xPercent: 0, ease: "none",
      scrollTrigger: { trigger: c.closest(".mat-panel"), containerAnimation: tween, start: "left right", end: "right left", scrub: true }
    });
  });
  document.querySelectorAll(".mat-panel__body").forEach((b) => {
    gsap.from(b, {
      y: 40, opacity: 0, ease: "power2.out",
      scrollTrigger: { trigger: b.closest(".mat-panel"), containerAnimation: tween, start: "left 90%", end: "left 55%", scrub: true }
    });
  });
}

/* ───────────── Immersive zoom ───────────── */
function zoom() {
  const frame = document.getElementById("zoomFrame");
  const img = frame.querySelector("img");
  const overlay = frame.querySelector(".zoom__overlay");
  const before = document.getElementById("zoomBefore");
  const after = document.getElementById("zoomAfter");

  const tl = gsap.timeline({
    scrollTrigger: { trigger: ".zoom", start: "top top", end: "+=220%", pin: true, scrub: 1, anticipatePin: 1 }
  });
  tl.to(frame, { width: "100vw", height: "100vh", top: 0, borderRadius: 0, duration: 1, ease: "power2.inOut" }, 0)
    .to(img, { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
    .to(before, { opacity: 0, y: -60, duration: 0.4 }, 0.1)
    .to(overlay, { backgroundColor: "rgba(15,17,20,0.58)", duration: 0.6 }, 0.5)
    .fromTo(after, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5 }, 0.75)
    .to(img, { scale: 1.12, duration: 0.6, ease: "none" }, 1);
}

/* ───────────── Exploded truck ───────────── */
export function exploded(truck) {
  const bar = document.getElementById("explodedBar");
  ScrollTrigger.create({
    trigger: ".exploded", start: "top top", end: "+=200%", pin: true, scrub: 0.8, anticipatePin: 1,
    onUpdate: (self) => {
      truck && truck.setProgress(self.progress);
      bar.style.setProperty("--p", self.progress * 100 + "%");
    }
  });
  gsap.from(".exploded__head > *", {
    y: 40, opacity: 0, duration: 1.2, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".exploded", start: "top 70%", once: true }
  });
}

/* ───────────── Process: layer transformation (stacking cards) ───────────── */
function process() {
  const cards = gsap.utils.toArray(".pcard");
  cards.forEach((card, i) => {
    const inner = card.querySelector(".pcard__inner");
    gsap.from(inner, {
      y: 80, opacity: 0, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: card, start: "top 85%", once: true }
    });
    if (i === cards.length - 1) return;
    gsap.to(inner, {
      scale: 0.9 - (cards.length - 1 - i) * 0.015, yPercent: -4, filter: "brightness(0.85)", ease: "none",
      scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 100px", scrub: true }
    });
  });
}

/* ───────────── Sectors: hover reveal floating image ───────────── */
function sectors() {
  if (isTouch) return;
  const list = document.getElementById("sectorsList");
  const float = document.getElementById("sectorsFloat");
  const img = float.querySelector("img");
  const container = float.parentElement;
  const x = gsap.quickTo(float, "x", { duration: 0.6, ease: "power3" });
  const y = gsap.quickTo(float, "y", { duration: 0.6, ease: "power3" });
  const rot = gsap.quickTo(float, "rotation", { duration: 0.8, ease: "power3" });
  let lastX = 0;

  img.addEventListener("error", () => { img.src = textureDataURL(img.dataset.fb || "gravel", 900, 600); });

  list.querySelectorAll(".sector").forEach((row) => {
    row.addEventListener("pointerenter", () => {
      img.dataset.fb = row.dataset.fallback;
      img.src = row.dataset.img;
      gsap.to(float, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
    });
    row.addEventListener("pointerleave", () => {
      gsap.to(float, { opacity: 0, scale: 0.8, duration: 0.5, ease: "expo.out" });
    });
  });
  list.addEventListener("pointermove", (e) => {
    const r = container.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    x(px - 160 + 40); y(py - 110);
    rot(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.4));
    lastX = e.clientX;
  });
}

/* ───────────── Voices: vertical columns slider ───────────── */
function voices() {
  const cols = document.querySelectorAll(".voices__col");
  cols.forEach((col) => {
    const dir = parseFloat(col.dataset.dir || "-1");
    gsap.fromTo(col, { yPercent: dir < 0 ? 0 : -32 }, {
      yPercent: dir < 0 ? -32 : 0, ease: "none",
      scrollTrigger: { trigger: ".voices__cols", start: "top bottom", end: "bottom top", scrub: 0.8 }
    });
  });
}

/* ───────────── Footer & progress bar ───────────── */
function footer() {
  gsap.to(".footer__big span", {
    y: 0, opacity: 1, duration: 1.6, ease: "expo.out",
    scrollTrigger: { trigger: ".footer__big", start: "top 95%", once: true }
  });
  gsap.to("#scrollProgress i", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 }
  });
  document.getElementById("year").textContent = new Date().getFullYear();
}

/* ───────────── Quote form ───────────── */
function form() {
  const f = document.getElementById("quoteForm");
  const success = document.getElementById("formSuccess");
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    f.querySelectorAll("[required]").forEach((input) => {
      const field = input.closest(".field");
      const valid = input.type === "email" ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value) : input.value.trim().length > 0;
      field.classList.toggle("is-error", !valid);
      if (!valid) { ok = false; gsap.fromTo(field, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }); }
    });
    if (!ok) return;
    const btn = f.querySelector('button[type="submit"] span');
    btn.textContent = "Sending…";
    setTimeout(() => {
      success.classList.add("is-visible");
      gsap.from(success.children, { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.out" });
      btn.textContent = "Send Request";
      f.reset();
    }, 900);
  });
  f.querySelectorAll("input, select, textarea").forEach((i) => i.addEventListener("input", () => i.closest(".field").classList.remove("is-error")));
}

export function initAnimations() {
  reveals();
  counters();
  manifesto();
  materials();
  zoom();
  process();
  sectors();
  voices();
  footer();
  form();
}

export { ScrollTrigger, gsap };
