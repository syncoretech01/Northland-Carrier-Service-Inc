/* ═══════════════════════════════════════════════════════════════
   Northland Carrier Service — entry point
   Lenis smooth scroll · GSAP ScrollTrigger · Three.js scenes
   ═══════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { initTextures } from "./textures.js?v=3";
import { initCursor, initMagnetic, initTilt } from "./cursor.js?v=3";
import { initNav } from "./nav.js?v=3";
import { runPreloader } from "./preloader.js?v=3";
import { initHero } from "./hero3d.js?v=3";
import { initTruck } from "./truck3d.js?v=3";
import { initFleetSlider } from "./slider3d.js?v=3";
import { initAnimations, heroEntrance, heroScroll, exploded } from "./animations.js?v=3";

gsap.registerPlugin(ScrollTrigger);

// ─── Smooth scroll ───
const lenis = new Lenis({
  lerp: 0.085,
  wheelMultiplier: 0.95,
  touchMultiplier: 1.4,
  smoothWheel: true,
  syncTouch: false
});
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
window.scrollTo(0, 0);
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

// ─── Static setup that does not depend on fonts ───
initTextures();
initCursor();
initMagnetic();
initTilt();

let hero3d = null, truck3d = null;
try {
  hero3d = initHero(document.getElementById("heroCanvas"));
  truck3d = initTruck(document.getElementById("truckCanvas"), document.getElementById("truckLabels"));
} catch (err) {
  console.warn("WebGL unavailable — 3D scenes disabled.", err);
}

// ─── Font-dependent setup (SplitText needs final metrics) ───
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
const minWait = new Promise((r) => setTimeout(r, 400));

Promise.all([fontsReady, minWait]).then(() => {
  initAnimations();
  heroScroll(hero3d);
  exploded(truck3d);
  initFleetSlider();
  initNav(lenis); // after all pins exist so nav theming can target pin-spacers
  ScrollTrigger.refresh();
});

// ─── Preloader → hero entrance ───
runPreloader().then(() => {
  lenis.start();
  heroEntrance();
  ScrollTrigger.refresh();
});

// Keep pinned sections accurate after late layout shifts (fonts, images, textures)
window.addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 300));
