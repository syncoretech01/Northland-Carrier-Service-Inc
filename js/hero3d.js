/* ═══════════════════════════════════════════════════════════════
   Hero — Three.js aggregate field. Hundreds of instanced rocks
   drifting in warm light; mouse parallax; scroll-driven zoom.
   ═══════════════════════════════════════════════════════════════ */
import * as THREE from "three";

// Position-hashed displacement keeps shared (non-indexed) vertices in agreement,
// so the rock reads as a solid lump rather than a shattered shell.
function rockGeometry(seed, detail = 1) {
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  const noise = (x, y, z) =>
    Math.sin(x * 2.1 + seed) * 0.5 + Math.sin(y * 3.3 + seed * 1.7) * 0.3 + Math.sin(z * 2.7 + x * 1.3 + seed * 0.4) * 0.2;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = 1 + noise(v.x, v.y, v.z) * 0.28;
    v.multiplyScalar(n);
    pos.setXYZ(i, v.x, v.y * 0.82, v.z * 1.05);
  }
  geo.computeVertexNormals();
  return geo;
}

export function initHero(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xF3EFE6, 14, 42);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const camBase = new THREE.Vector3(0, 1.2, 20);
  camera.position.copy(camBase);

  // Lights — warm key, cool fill, soft hemisphere
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0xd9d0bf, 1.1));
  const key = new THREE.DirectionalLight(0xffe2c8, 2.2);
  key.position.set(6, 10, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf26a1b, 1.4);
  rim.position.set(-10, 4, -6);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xc8d3e6, 0.6);
  fill.position.set(-4, -6, 10);
  scene.add(fill);

  const palette = [
    new THREE.Color(0xC8BEA8), new THREE.Color(0xB5AA92), new THREE.Color(0x9F9683),
    new THREE.Color(0x7C7466), new THREE.Color(0xE2DAC7), new THREE.Color(0x5A5650),
    new THREE.Color(0xF26A1B), new THREE.Color(0x2B2F36)
  ];
  const weights = [3, 3, 3, 2, 3, 2, 1, 1];
  const pickColor = (r) => {
    const total = weights.reduce((a, b) => a + b, 0);
    let t = r * total;
    for (let i = 0; i < palette.length; i++) { t -= weights[i]; if (t <= 0) return palette[i]; }
    return palette[0];
  };

  const geos = [rockGeometry(7, 1), rockGeometry(19, 1), rockGeometry(41, 2)];
  const material = new THREE.MeshStandardMaterial({ roughness: 0.82, metalness: 0.08, flatShading: true });
  const groups = [];
  const dummy = new THREE.Object3D();

  const isMobile = window.innerWidth < 800;
  const COUNT = isMobile ? 140 : 300;

  geos.forEach((geo, gi) => {
    const count = Math.floor(COUNT / geos.length);
    const mesh = new THREE.InstancedMesh(geo, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const data = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      // wide flowing band that keeps the centre clear for the headline
      const x = (Math.random() - 0.5) * 48;
      const yBand = Math.random() > 0.5 ? 1 : -1;
      const y = yBand * (2.5 + Math.random() * 7) + (Math.random() - 0.5) * 2;
      const z = -Math.random() * 30 + 4;
      const depthT = THREE.MathUtils.clamp((z + 26) / 30, 0, 1);
      const scale = (0.1 + Math.random() * 0.4) * (0.5 + depthT * 0.9) * (Math.random() > 0.95 ? 2.2 : 1);
      data.push({
        x, y, z, scale,
        rx: Math.random() * Math.PI, ry: Math.random() * Math.PI, rz: Math.random() * Math.PI,
        vx: (Math.random() * 0.4 + 0.2) * 0.35, vr: (Math.random() - 0.5) * 0.4,
        phase: Math.random() * Math.PI * 2, amp: 0.2 + Math.random() * 0.6
      });
      mesh.setColorAt(i, pickColor(r));
    }
    mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
    groups.push({ mesh, data });
  });

  // Large hero boulders framing the composition
  const boulderMat = new THREE.MeshStandardMaterial({ color: 0xE2DAC7, roughness: 0.9, metalness: 0.05, flatShading: true });
  const boulders = [];
  [[-11, -5.5, 4, 2.6], [11.5, 5.2, 0, 1.9], [9, -6.5, 6, 1.5]].forEach(([x, y, z, s], i) => {
    const m = new THREE.Mesh(rockGeometry(101 + i * 13, 3), boulderMat);
    m.position.set(x, y, z);
    m.scale.setScalar(s);
    m.rotation.set(i, i * 0.7, i * 0.3);
    scene.add(m);
    boulders.push(m);
  });

  // Amber accent: a slender ring that reads as a haul route
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(9.5, 0.035, 8, 200),
    new THREE.MeshBasicMaterial({ color: 0xF26A1B, transparent: true, opacity: 0.55 })
  );
  ring.rotation.x = Math.PI / 2.4;
  ring.position.set(2, -2, -4);
  scene.add(ring);

  // Interaction state
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollT = 0;   // 0..1 hero scroll progress
  let running = true;
  let visible = true;

  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 800 ? 50 : 38;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
  io.observe(canvas);

  const clock = new THREE.Clock();
  let intro = 0; // entrance progress 0..1

  function render() {
    if (!running) return;
    requestAnimationFrame(render);
    if (!visible) return;

    const t = clock.getElapsedTime();
    const dt = Math.min(clock.getDelta(), 0.05) || 0.016;
    intro = Math.min(1, intro + 0.012);
    const introEase = 1 - Math.pow(1 - intro, 3);

    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;

    groups.forEach(({ mesh, data }) => {
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        d.x += d.vx * 0.016;
        if (d.x > 23) d.x = -23;
        const explode = scrollT * 1.6;
        dummy.position.set(
          d.x + d.x * explode * 0.5,
          d.y + Math.sin(t * 0.6 + d.phase) * d.amp * 0.3 + d.y * explode * 0.4,
          d.z + scrollT * 10
        );
        dummy.rotation.set(d.rx + t * d.vr, d.ry + t * d.vr * 0.7, d.rz);
        const s = d.scale * introEase;
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    });

    boulders.forEach((b, i) => {
      b.rotation.y += 0.0015 * (i + 1);
      b.rotation.x += 0.0008;
      b.position.y += Math.sin(t * 0.5 + i) * 0.0015;
    });
    ring.rotation.z = t * 0.05;

    // Camera: parallax + immersive scroll zoom
    const zoom = scrollT * scrollT;
    camera.position.x = camBase.x + mouse.x * 1.4;
    camera.position.y = camBase.y - mouse.y * 0.9 - scrollT * 2;
    camera.position.z = camBase.z - zoom * 14 + (1 - introEase) * 8;
    camera.lookAt(mouse.x * 0.6, -0.4 - scrollT * 3, -6);
    camera.rotation.z = mouse.x * 0.02;

    renderer.render(scene, camera);
  }
  render();

  return {
    setScroll(t) { scrollT = THREE.MathUtils.clamp(t, 0, 1); },
    destroy() { running = false; renderer.dispose(); }
  };
}
