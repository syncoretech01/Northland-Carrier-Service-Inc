/* ═══════════════════════════════════════════════════════════════
   Exploded truck — a tri-axle dump built from primitives. Scroll
   progress separates each assembly along its explode vector and
   HTML labels are projected onto the parts in screen space.
   ═══════════════════════════════════════════════════════════════ */
import * as THREE from "three";

const M = {
  amber: new THREE.MeshStandardMaterial({ color: 0xF26A1B, roughness: 0.45, metalness: 0.15 }),
  amberDark: new THREE.MeshStandardMaterial({ color: 0xC9500E, roughness: 0.5, metalness: 0.15 }),
  ink: new THREE.MeshStandardMaterial({ color: 0x1B1D21, roughness: 0.7, metalness: 0.3 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xB9BDC4, roughness: 0.35, metalness: 0.7 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x8FB6D6, roughness: 0.1, metalness: 0.6, transparent: true, opacity: 0.85 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x0E0F11, roughness: 0.95, metalness: 0.0 }),
  rim: new THREE.MeshStandardMaterial({ color: 0xD8DBE0, roughness: 0.3, metalness: 0.8 }),
  bed: new THREE.MeshStandardMaterial({ color: 0x3A3F47, roughness: 0.55, metalness: 0.45 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xE8EAEE, roughness: 0.15, metalness: 0.95 })
};

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}
function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 28) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  return m;
}

function wheel(x, z) {
  const g = new THREE.Group();
  const tire = cyl(0.62, 0.62, 0.42, M.rubber, 0, 0, 0, 36);
  tire.rotation.x = Math.PI / 2;
  const rim = cyl(0.36, 0.36, 0.44, M.rim, 0, 0, 0, 24);
  rim.rotation.x = Math.PI / 2;
  const hub = cyl(0.12, 0.12, 0.5, M.ink, 0, 0, 0, 16);
  hub.rotation.x = Math.PI / 2;
  g.add(tire, rim, hub);
  g.position.set(x, 0.62, z);
  return g;
}

export function initTruck(canvas, labelsRoot) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2b2f36, 1.4));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.4);
  key.position.set(6, 10, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8; key.shadow.camera.right = 8;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.0005;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xF26A1B, 1.2);
  rim.position.set(-8, 3, -6);
  scene.add(rim);

  // Ground shadow catcher
  const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.35 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);
  const groundRing = new THREE.Mesh(new THREE.RingGeometry(6.2, 6.25, 96), new THREE.MeshBasicMaterial({ color: 0xF26A1B, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.y = 0.005;
  scene.add(groundRing);

  const truck = new THREE.Group();
  scene.add(truck);

  const parts = {};
  const register = (name, group, home, explode) => {
    group.position.copy(home);
    group.userData = { home: home.clone(), explode: explode.clone() };
    group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    truck.add(group);
    parts[name] = group;
  };

  // ─── Chassis ───
  {
    const g = new THREE.Group();
    g.add(box(6.6, 0.28, 0.5, M.ink, 0, 0, 0.7));
    g.add(box(6.6, 0.28, 0.5, M.ink, 0, 0, -0.7));
    for (let x = -2.8; x <= 2.8; x += 1.4) g.add(box(0.2, 0.22, 1.9, M.ink, x, 0, 0));
    // fuel tanks
    const t1 = cyl(0.3, 0.3, 1.6, M.steel, 0.6, -0.15, 1.15); t1.rotation.z = Math.PI / 2;
    const t2 = cyl(0.3, 0.3, 1.6, M.steel, 0.6, -0.15, -1.15); t2.rotation.z = Math.PI / 2;
    g.add(t1, t2);
    // rear bumper & lights
    g.add(box(0.12, 0.3, 2.3, M.steel, -3.35, -0.05, 0));
    g.add(box(0.05, 0.12, 0.3, M.amber, -3.42, 0.05, 0.9));
    g.add(box(0.05, 0.12, 0.3, M.amber, -3.42, 0.05, -0.9));
    register("chassis", g, new THREE.Vector3(0, 0.95, 0), new THREE.Vector3(0, -0.35, 0));
  }

  // ─── Cab ───
  {
    const g = new THREE.Group();
    g.add(box(1.5, 1.6, 2.1, M.amber, 0, 0.8, 0));
    const wind = box(0.06, 0.75, 1.75, M.glass, 0.76, 1.05, 0);
    g.add(wind);
    g.add(box(0.5, 0.6, 0.06, M.glass, -0.15, 1.05, 1.06));
    g.add(box(0.5, 0.6, 0.06, M.glass, -0.15, 1.05, -1.06));
    g.add(box(1.5, 0.08, 2.14, M.amberDark, 0, 1.63, 0)); // roof rail
    // mirrors
    g.add(box(0.06, 0.4, 0.2, M.ink, 0.6, 1.0, 1.25));
    g.add(box(0.06, 0.4, 0.2, M.ink, 0.6, 1.0, -1.25));
    // step
    g.add(box(0.8, 0.06, 0.3, M.steel, 0, -0.1, 1.15));
    g.add(box(0.8, 0.06, 0.3, M.steel, 0, -0.1, -1.15));
    register("cab", g, new THREE.Vector3(1.75, 1.1, 0), new THREE.Vector3(0.5, 1.35, 0));
  }

  // ─── Hood / engine ───
  {
    const g = new THREE.Group();
    g.add(box(1.4, 1.0, 1.9, M.amber, 0, 0.5, 0));
    g.add(box(0.1, 0.8, 1.5, M.chrome, 0.72, 0.42, 0)); // grille
    for (let i = -0.55; i <= 0.55; i += 0.22) g.add(box(0.02, 0.7, 0.05, M.ink, 0.78, 0.42, i));
    g.add(box(0.12, 0.28, 2.05, M.steel, 0.7, -0.05, 0)); // bumper
    g.add(box(0.06, 0.18, 0.28, M.chrome, 0.78, 0.55, 0.75)); // headlights
    g.add(box(0.06, 0.18, 0.28, M.chrome, 0.78, 0.55, -0.75));
    // engine block hint (visible when exploded)
    g.add(box(0.9, 0.5, 0.9, M.ink, -0.05, 0.2, 0));
    register("hood", g, new THREE.Vector3(3.2, 1.1, 0), new THREE.Vector3(1.9, 0.35, 0));
  }

  // ─── Dump bed ───
  {
    const g = new THREE.Group();
    const L = 4.2, W = 2.3, H = 1.5;
    g.add(box(L, 0.12, W, M.bed, 0, 0, 0)); // floor
    g.add(box(L, H, 0.08, M.bed, 0, H / 2, W / 2)); // sides
    g.add(box(L, H, 0.08, M.bed, 0, H / 2, -W / 2));
    g.add(box(0.08, H + 0.35, W, M.bed, L / 2, (H + 0.35) / 2, 0)); // headboard (front)
    g.add(box(0.08, H, W, M.bed, -L / 2, H / 2, 0)); // tailgate
    // ribs
    for (let x = -1.6; x <= 1.6; x += 0.8) {
      g.add(box(0.1, H, 0.06, M.steel, x, H / 2, W / 2 + 0.06));
      g.add(box(0.1, H, 0.06, M.steel, x, H / 2, -W / 2 - 0.06));
    }
    // top rails
    g.add(box(L, 0.08, 0.14, M.steel, 0, H, W / 2));
    g.add(box(L, 0.08, 0.14, M.steel, 0, H, -W / 2));
    // load — a mound of aggregate
    const load = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xB5AA92, roughness: 1, flatShading: true }));
    load.scale.set(1.9, 0.9, 1.05);
    load.position.set(0, 0.55, 0);
    g.add(load);
    // hoist cylinder
    const hoist = cyl(0.12, 0.12, 1.2, M.chrome, 1.6, -0.5, 0); hoist.rotation.z = 0.25;
    g.add(hoist);
    register("bed", g, new THREE.Vector3(-1.2, 1.15, 0), new THREE.Vector3(-1.1, 1.7, 0));
  }

  // ─── Wheels (each side explodes outward) ───
  {
    const gL = new THREE.Group(), gR = new THREE.Group();
    [2.9, -1.05, -2.35].forEach((x) => { gL.add(wheel(x, 1.05)); gR.add(wheel(x, -1.05)); });
    // axles
    [2.9, -1.05, -2.35].forEach((x) => {
      const a = cyl(0.08, 0.08, 2.1, M.steel, x, 0.62, 0); a.rotation.x = Math.PI / 2; gL.add(a);
    });
    register("wheelsL", gL, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.45, 1.8));
    register("wheelsR", gR, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.45, -1.8));
  }

  // ─── Exhaust stacks ───
  {
    const g = new THREE.Group();
    const s1 = cyl(0.09, 0.09, 2.1, M.chrome, 0, 1.05, 1.15);
    const s2 = cyl(0.09, 0.09, 2.1, M.chrome, 0, 1.05, -1.15);
    const c1 = cyl(0.14, 0.14, 0.4, M.chrome, 0, 1.9, 1.15);
    const c2 = cyl(0.14, 0.14, 0.4, M.chrome, 0, 1.9, -1.15);
    g.add(s1, s2, c1, c2);
    register("stack", g, new THREE.Vector3(1.0, 1.2, 0), new THREE.Vector3(0.3, 2.0, 0));
  }

  // Label anchor: which part + local offset
  const anchors = {
    cab: { part: "cab", offset: new THREE.Vector3(0, 1.9, 0) },
    hood: { part: "hood", offset: new THREE.Vector3(0.9, 1.1, 0) },
    bed: { part: "bed", offset: new THREE.Vector3(-0.8, 1.9, 0) },
    chassis: { part: "chassis", offset: new THREE.Vector3(-0.4, -0.5, 0) },
    wheels: { part: "wheelsL", offset: new THREE.Vector3(-1.7, 0.2, 1.4) },
    stack: { part: "stack", offset: new THREE.Vector3(0, 2.3, 1.15) }
  };
  const labels = {};
  labelsRoot.querySelectorAll(".tlabel").forEach((el) => { labels[el.dataset.part] = el; });

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let progress = 0;
  let visible = false;
  let running = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 800 ? 46 : 32;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const clock = new THREE.Clock();
  const tmp = new THREE.Vector3();
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function render() {
    if (!running) return;
    requestAnimationFrame(render);
    if (!visible) return;

    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    const p = ease(progress);
    Object.values(parts).forEach((g) => {
      const { home, explode } = g.userData;
      g.position.set(home.x + explode.x * p, home.y + explode.y * p, home.z + explode.z * p);
    });
    parts.hood.rotation.z = -0.2 * p;
    parts.bed.rotation.z = 0.08 * p;

    truck.rotation.y = -0.55 + progress * 1.1 + mouse.x * 0.18 + Math.sin(t * 0.35) * 0.04;
    truck.position.y = -0.2 + progress * 0.2;

    const w = canvas.clientWidth, h = canvas.clientHeight;
    const radius = (w < 800 ? 23 : 15) + p * (w < 800 ? 6 : 4.5);
    camera.position.set(Math.sin(0.35) * radius, 4.2 - mouse.y * 0.6 + p * 1.6, Math.cos(0.35) * radius);
    camera.lookAt(0, 1.1 + p * 0.6, 0);

    renderer.render(scene, camera);

    // Project labels
    const labelAlpha = Math.max(0, Math.min(1, (progress - 0.25) / 0.35));
    Object.entries(anchors).forEach(([name, a]) => {
      const el = labels[name];
      if (!el) return;
      const part = parts[a.part];
      tmp.copy(a.offset);
      part.localToWorld(tmp);
      tmp.project(camera);
      const x = (tmp.x * 0.5 + 0.5) * w;
      const y = (-tmp.y * 0.5 + 0.5) * h;
      el.style.transform = `translate(${x}px, ${y}px) translate(-10%, -50%) scale(${0.85 + labelAlpha * 0.15})`;
      el.style.opacity = labelAlpha;
    });
  }
  render();

  return {
    setProgress(v) { progress = Math.max(0, Math.min(1, v)); },
    destroy() { running = false; renderer.dispose(); }
  };
}
