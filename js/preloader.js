/* ═══════════════════════════════════════════════════════════════
   Preloader — counter, drawn logo, column curtain exit.
   Resolves when the curtain has cleared so the hero can enter.
   ═══════════════════════════════════════════════════════════════ */
import gsap from "gsap";

export function runPreloader() {
  const root = document.getElementById("preloader");
  const counter = document.querySelector("#preloaderCounter span");
  const bar = document.getElementById("preloaderBar");
  const status = document.getElementById("preloaderStatus");
  const cols = root.querySelectorAll(".preloader__cols span");
  const paths = root.querySelectorAll(".pl-path");
  const inner = root.querySelector(".preloader__inner");

  const statuses = ["Loading the fleet", "Checking tickets", "Tarping the load", "Routing dispatch", "Ready to roll"];
  const state = { n: 0 };

  return new Promise((resolve) => {
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });

    tl.to(paths, { strokeDashoffset: 0, duration: 1.4, stagger: 0.08, ease: "power2.inOut" }, 0)
      .to(state, {
        n: 100, duration: 1.8, ease: "power2.inOut",
        onUpdate() {
          const v = Math.round(state.n);
          counter.textContent = v;
          bar.style.width = v + "%";
          status.textContent = statuses[Math.min(statuses.length - 1, Math.floor(v / 22))];
        }
      }, 0.15)
      .to(inner, { yPercent: -30, opacity: 0, duration: 0.7, ease: "power3.in" }, "-=0.1")
      .to(cols, { scaleY: 0, transformOrigin: "top", duration: 1.1, stagger: 0.07, ease: "expo.inOut" }, "-=0.35")
      .add(() => resolve(), "-=0.6")
      .set(root, { display: "none" });
  });
}
