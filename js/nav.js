/* ═══════════════════════════════════════════════════════════════
   Navigation — scrolled state, dark-section theming, mobile menu,
   smooth anchor scrolling through Lenis
   ═══════════════════════════════════════════════════════════════ */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initNav(lenis) {
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  const bg = menu.querySelectorAll(".menu__bg span");
  const links = menu.querySelectorAll(".menu__link span");
  const meta = menu.querySelector(".menu__meta");
  let open = false;

  ScrollTrigger.create({
    start: 40, end: "max",
    onUpdate: (self) => nav.classList.toggle("is-scrolled", self.scroll() > 40),
    onEnter: () => nav.classList.add("is-scrolled"),
    onLeaveBack: () => nav.classList.remove("is-scrolled")
  });

  // Invert nav colors while over dark sections
  // Dark theming: track every active dark region so toggles firing in any order stay correct.
  // Pinned sections live inside a pin-spacer whose height includes the scrub distance.
  const darkActive = new Set();
  const spacerOf = (el) => (el.parentElement && el.parentElement.classList.contains("pin-spacer") ? el.parentElement : el);
  const darkRegion = (trigger, start) => ScrollTrigger.create({
    trigger, start, end: "bottom 40px",
    onToggle: (self) => {
      self.isActive ? darkActive.add(self) : darkActive.delete(self);
      nav.classList.toggle("is-dark", darkActive.size > 0 || open);
    }
  });
  document.querySelectorAll(".materials, .exploded, .footer, .marquee").forEach((sec) => darkRegion(spacerOf(sec), "top 40px"));
  // The zoom section only turns dark once the frame has filled the viewport
  darkRegion(spacerOf(document.querySelector(".zoom")), "38% top");

  const tl = gsap.timeline({ paused: true })
    .set(menu, { visibility: "visible" })
    .to(bg, { scaleY: 1, duration: 0.8, stagger: 0.08, ease: "expo.inOut" })
    .to(links, { y: 0, duration: 0.9, stagger: 0.06, ease: "expo.out" }, "-=0.35")
    .to(meta, { opacity: 1, duration: 0.6 }, "-=0.5");

  const toggle = (force) => {
    open = typeof force === "boolean" ? force : !open;
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    if (open) { nav.classList.add("is-dark"); lenis.stop(); tl.timeScale(1).play(); }
    else { nav.classList.toggle("is-dark", darkActive.size > 0); lenis.start(); tl.timeScale(1.6).reverse(); }
  };
  burger.addEventListener("click", () => toggle());

  // Anchor links → Lenis smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (open) toggle(false);
      setTimeout(() => lenis.scrollTo(target, { offset: id === "#top" ? 0 : -20, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) }), open ? 500 : 0);
    });
  });
}
