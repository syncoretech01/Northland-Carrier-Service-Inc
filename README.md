# Northland Carrier Service Inc. — Website

Premium single-page site for a construction materials hauling company (Jamestown, NY).

## Run locally

```
node serve.js
```

Then open **http://localhost:8787**. No build step and no `npm install` — libraries load from CDN via an import map.

## Stack

- **Three.js** — hero aggregate field (instanced rocks, scroll-driven zoom, mouse parallax) and the scroll-exploded dump truck with projected HTML labels
- **GSAP + ScrollTrigger + SplitText** — entrance reveals, horizontal materials scroll, immersive zoom, stacking process cards, vertical column slider, counters
- **Lenis** — smooth scrolling, synced to the GSAP ticker
- **Motion** — spring-based magnetic buttons
- Procedural canvas textures (`js/textures.js`) for every material — no image dependency, and they double as fallbacks for any remote photo that fails to load

## Structure

```
index.html          all sections
css/base.css        tokens, reset, type scale
css/components.css  preloader, cursor, nav, menu, buttons, tilt cards, form
css/sections.css    per-section layout + responsive rules
js/main.js          entry — Lenis, preloader, scene bootstrapping
js/animations.js    all ScrollTrigger-driven sections
js/hero3d.js        Three.js hero
js/truck3d.js       Three.js exploded truck
js/slider3d.js      3D fleet ring carousel
js/cursor.js        custom cursor, magnetic, 3D tilt
js/nav.js           nav states, mobile menu, anchor scrolling
js/textures.js      procedural material textures
serve.js            zero-dependency static server (port 8787)
```

## Notes

- The quote form validates and shows a success state client-side; wire `#quoteForm` to a backend or form service to receive submissions.
- Photos are served from Unsplash; swap in company photography by replacing the `src` / `data-img` URLs in `index.html`.
