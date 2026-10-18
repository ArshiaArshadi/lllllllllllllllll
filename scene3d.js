// Drinko — 3D hero scene (Three.js) with GSAP ScrollTrigger scroll animation.

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("scene3d");
const mobileQuery = matchMedia("(max-width: 760px)");
const isMobile = mobileQuery.matches;
const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// if the browser drops the WebGL context (can happen on device emulation),
// restore it instead of leaving a blank canvas
canvas.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  setTimeout(() => { try { renderer.forceContextRestore(); } catch (err) {} }, 60);
});

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();

// warm caramel-beige radial background with a soft center glow
function gradientTexture(stops) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(256, 210, 40, 256, 256, 360);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
scene.background = gradientTexture([
  [0, "#e8c495"], [0.45, "#c99a63"], [0.8, "#9a6b38"], [1, "#6f4a26"],
]);
scene.fog = new THREE.Fog(0x9a6b38, 11, 30);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 10);
const lookTarget = new THREE.Object3D();
lookTarget.position.set(0.9, 0.0, 0);
scene.add(lookTarget);

// soft studio environment for glass reflections
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---- lights ----
scene.add(new THREE.AmbientLight(0xffe4c0, 0.55));
const key = new THREE.DirectionalLight(0xffd9a8, 1.7);
key.position.set(4, 7, 4);
scene.add(key);
const glow = new THREE.PointLight(0xffb765, 26, 18);
glow.position.set(-1.6, 1.2, 2.4);
scene.add(glow);
const rim = new THREE.DirectionalLight(0xffcf9e, 0.9);
rim.position.set(-3, 3, -4);
scene.add(rim);

// ---- canvas texture helpers ----
function canvasTexture(size, draw) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// latte-art heart on the foam
const latteArtTex = canvasTexture(512, (ctx, s) => {
  ctx.fillStyle = "#f4e3c6";
  ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); ctx.fill();
  // rosetta/heart
  ctx.fillStyle = "#b97e42";
  ctx.beginPath();
  ctx.moveTo(s / 2, s * 0.24);
  ctx.bezierCurveTo(s * 0.62, s * 0.36, s * 0.6, s * 0.52, s / 2, s * 0.68);
  ctx.bezierCurveTo(s * 0.4, s * 0.52, s * 0.38, s * 0.36, s / 2, s * 0.24);
  ctx.fill();
  ctx.strokeStyle = "#f4e3c6";
  ctx.lineWidth = s * 0.035;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(s / 2, s * (0.4 + i * 0.07), s * (0.14 - i * 0.03), Math.PI * 0.15, Math.PI * 0.85, true);
    ctx.stroke();
  }
});

// layered latte body
const latteBodyTex = canvasTexture(256, (ctx, s) => {
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, "#f2dcae");   // foam
  g.addColorStop(0.18, "#e8c48c");
  g.addColorStop(0.45, "#c98d4e"); // coffee
  g.addColorStop(0.75, "#b47a3e");
  g.addColorStop(1, "#e9d7b8");   // milk at the bottom
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
});

// coffee bean
function beanTexture(blur) {
  return canvasTexture(128, (ctx, s) => {
    ctx.filter = blur ? "blur(5px)" : "none";
    const g = ctx.createRadialGradient(s * 0.4, s * 0.35, 4, s / 2, s / 2, s * 0.5);
    g.addColorStop(0, "#8a5a30");
    g.addColorStop(0.7, "#4c2e14");
    g.addColorStop(1, "#33200e");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(s / 2, s / 2, s * 0.46, s * 0.32, Math.PI / 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#6b4423";
    ctx.lineWidth = s * 0.05;
    ctx.beginPath();
    ctx.moveTo(s * 0.2, s * 0.62);
    ctx.quadraticCurveTo(s / 2, s * 0.42, s * 0.8, s * 0.56);
    ctx.stroke();
  });
}
const beanTex = beanTexture(false);
const beanTexBlur = beanTexture(true);

// ---- the mug ----
const mug = new THREE.Group();
mug.position.set(isMobile ? 0 : 1.5, -0.35, 0);
scene.add(mug);

function layoutForViewport() {
  const mobile = mobileQuery.matches;
  mug.position.x = mobile ? 0 : 1.5;
  splashGroup.position.x = mobile ? 0 : 1.5;
  lookTarget.position.x = mobile ? 0 : 0.9;
}

const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, transmission: 1, thickness: 0.25, roughness: 0.06,
  ior: 1.45, clearcoat: 1, transparent: true, side: THREE.DoubleSide,
});

const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.6, 1.75, 48, 1, true), glassMat);
mug.add(glass);
const glassBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.06, 48), glassMat);
glassBase.position.y = -0.84;
mug.add(glassBase);

const latte = new THREE.Mesh(
  new THREE.CylinderGeometry(0.5, 0.47, 1.5, 48),
  new THREE.MeshPhysicalMaterial({ map: latteBodyTex, roughness: 0.35, clearcoat: 0.6 })
);
latte.position.y = -0.02;
mug.add(latte);

const foam = new THREE.Mesh(
  new THREE.CircleGeometry(0.5, 48),
  new THREE.MeshStandardMaterial({ map: latteArtTex, roughness: 0.5 })
);
foam.rotation.x = -Math.PI / 2;
foam.position.y = 0.76;
mug.add(foam);

const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.055, 14, 40, Math.PI * 1.35), glassMat);
handle.position.set(0.68, 0.15, 0);
handle.rotation.z = -Math.PI * 0.62;
mug.add(handle);

// glowing gold ellipse under the mug
const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9a24b, metalness: 1, roughness: 0.28 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.035, 10, 64), goldMat);
ring.rotation.x = Math.PI / 2;
ring.scale.y = 1; ring.scale.x = 1; ring.scale.z = 0.45;
ring.position.y = -0.95;
mug.add(ring);
const glowDiscTex = canvasTexture(256, (ctx, s) => {
  const g = ctx.createRadialGradient(s / 2, s / 2, 8, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,214,150,0.85)");
  g.addColorStop(0.5, "rgba(255,190,120,0.30)");
  g.addColorStop(1, "rgba(255,190,120,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
const glowDisc = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshBasicMaterial({ map: glowDiscTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 })
);
glowDisc.rotation.x = -Math.PI / 2;
glowDisc.position.y = -1.0;
mug.add(glowDisc);

// ---- milk splash ----
function splashCurve() {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const a = Math.PI * (0.2 + t * 1.1);
    pts.push(new THREE.Vector3(Math.cos(a) * 1.35, Math.sin(t * Math.PI) * 1.05, -Math.sin(a) * 0.7 - 0.4));
  }
  return new THREE.CatmullRomCurve3(pts);
}
const splashMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.22, transmission: 0.35, thickness: 0.4, clearcoat: 1 });
const splash = new THREE.Mesh(new THREE.TubeGeometry(splashCurve(), 64, 0.055, 12), splashMat);
const splashGroup = new THREE.Group();
splashGroup.position.set(isMobile ? 0 : 1.5, -0.3, -0.2);
splashGroup.add(splash);
for (let i = 0; i < 6; i++) {
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.045 + Math.random() * 0.035, 10, 10), splashMat);
  const a = Math.PI * (0.25 + Math.random() * 1.0);
  drop.position.set(Math.cos(a) * 1.45, Math.random() * 1.1, -Math.sin(a) * 0.8 - 0.4);
  splashGroup.add(drop);
}
scene.add(splashGroup);

// ---- golden caramel ribbon swirling around the mug ----
function ribbonCurve() {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const a = t * Math.PI * 2.3 + 0.8;
    pts.push(new THREE.Vector3(Math.cos(a) * (0.95 + 0.25 * Math.sin(t * Math.PI * 2)), -0.7 + t * 1.9, Math.sin(a) * (0.95 + 0.25 * Math.sin(t * Math.PI * 2))));
  }
  return new THREE.CatmullRomCurve3(pts);
}
const ribbon = new THREE.Mesh(new THREE.TubeGeometry(ribbonCurve(), 96, 0.05, 10), goldMat);
ribbon.position.y = -0.1;
mug.add(ribbon);

// ---- floating coffee beans (different depths) ----
const beans = [];
const beanGeo = new THREE.PlaneGeometry(1, 1);
function addBean(x, y, z, scale, blurred, opacity) {
  const mat = new THREE.MeshBasicMaterial({ map: blurred ? beanTexBlur : beanTex, transparent: true, depthWrite: false, opacity });
  const m = new THREE.Mesh(beanGeo, mat);
  m.position.set(x, y, z);
  m.scale.setScalar(scale);
  m.rotation.z = Math.random() * Math.PI * 2;
  m.userData = { baseY: y, phase: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.4 };
  scene.add(m);
  beans.push(m);
  return m;
}
// background beans (small, sharp-ish)
const beanCount = isMobile ? 12 : 22;
for (let i = 0; i < beanCount; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 2.4 + Math.random() * 3.4;
  addBean(
    Math.cos(a) * r * 0.9,
    (Math.random() - 0.45) * 3.2,
    -2 - Math.random() * 5,
    0.16 + Math.random() * 0.22,
    false,
    0.95
  );
}
// big blurred beans in front (close to camera)
const frontBeans = isMobile ? 3 : 6;
for (let i = 0; i < frontBeans; i++) {
  const side = i % 2 === 0 ? -1 : 1;
  addBean(
    side * (1.6 + Math.random() * 2.2),
    (Math.random() - 0.5) * 2.6 - 0.4,
    2.4 + Math.random() * 2.4,
    0.7 + Math.random() * 0.4,
    true,
    0.85
  );
}

// ---- glass ice cubes ----
const iceMat = new THREE.MeshPhysicalMaterial({
  color: 0xf2faff, transmission: 1, roughness: 0.03, thickness: 1.1,
  ior: 1.31, clearcoat: 1, transparent: true, envMapIntensity: 2.4, specularIntensity: 1,
});
const iceGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const cubes = [];
const cubeSpec = isMobile
  ? [[-1.6, 0.6, 1.4], [1.9, 1.5, 0.4], [-2.1, -0.9, 0.2], [1.2, -1.4, 2.0]]
  : [[-1.9, 1.3, 0.6], [2.4, 1.7, -0.4], [-2.6, -0.9, 0.2], [1.9, -1.5, 1.8], [-1.1, 2.0, 2.2], [2.8, 0.2, 2.6], [-3.2, 0.9, -1.2]];
cubeSpec.forEach(([x, y, z], i) => {
  const c = new THREE.Mesh(iceGeo, iceMat);
  c.position.set(x + (isMobile ? 0 : 0.8), y, z);
  c.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
  c.scale.setScalar(0.001); // fly in on scroll
  c.userData = { baseY: y, phase: Math.random() * Math.PI * 2, spin: 0.3 + Math.random() * 0.4 };
  scene.add(c);
  cubes.push(c);
});

// ---- steam ----
const steamTex = canvasTexture(64, (ctx, s) => {
  const g = ctx.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,248,238,0.9)");
  g.addColorStop(1, "rgba(255,248,238,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
const steam = [];
const steamCount = isMobile ? 8 : 14;
for (let i = 0; i < steamCount; i++) {
  const mat = new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(mat);
  s.position.set(mug.position.x + (Math.random() - 0.5) * 0.5, 0.7 + Math.random() * 1.6, mug.position.z + 0.3);
  s.scale.setScalar(0.3 + Math.random() * 0.4);
  s.userData = { speed: 0.35 + Math.random() * 0.3, sway: Math.random() * Math.PI * 2 };
  scene.add(s);
  steam.push(s);
}

// ---- render loop ----
const clock = new THREE.Clock();
function tick() {
  const t = clock.getElapsedTime();
  mug.rotation.y = t * 0.28;
  ribbon.rotation.y = -t * 0.22;
  splashGroup.position.y = -0.3 + Math.sin(t * 0.7) * 0.05;
  splashGroup.rotation.y = Math.sin(t * 0.4) * 0.25;
  beans.forEach((b) => {
    b.position.y = b.userData.baseY + Math.sin(t * 0.55 + b.userData.phase) * 0.14;
    b.rotation.z += b.userData.spin * 0.004;
  });
  cubes.forEach((c) => {
    c.position.y = c.userData.baseY + Math.sin(t * 0.5 + c.userData.phase) * 0.16;
    c.rotation.y += 0.004; c.rotation.x += 0.002;
  });
  steam.forEach((s) => {
    s.position.y += s.userData.speed * 0.012;
    s.position.x = mug.position.x + Math.sin(t * 0.8 + s.userData.sway) * 0.18;
    if (s.position.y > 2.6) s.position.y = 0.7;
    s.material.opacity = 0.28 * Math.max(0, 1 - (s.position.y - 0.7) / 2.2);
  });
  camera.lookAt(lookTarget.position);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// ---- parallax on pointer (desktop) ----
if (!isMobile && !prefersReduced) {
  addEventListener("pointermove", (e) => {
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    const ny = (e.clientY / innerHeight - 0.5) * 2;
    gsap.to(camera.position, { x: nx * 0.35, y: 1.6 - ny * 0.25, duration: 1.2, ease: "power2.out", overwrite: "auto" });
  });
}

// ---- scroll animation: camera moves closer, objects fly in ----
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#home",
    start: "top top",
    end: "+=170%",
    scrub: 1,
    pin: true,
    anticipatePin: 1,
  },
});
tl.to(camera.position, { z: 6.4, y: 0.8, ease: "power1.inOut" }, 0)
  .to(lookTarget.position, { x: isMobile ? 0 : 1.2, ease: "power1.inOut" }, 0)
  // beans fly in from deep behind the mug
  .from(beans.map((b) => b.position), {
    z: (i, el) => el.z - (6 + (i % 4) * 2.5),
    ease: "power1.out",
    stagger: 0.012,
    duration: 0.7,
  }, 0.05)
  // ice cubes fly in toward the camera, growing
  .from(cubes.map((c) => c.scale), {
    x: 1, y: 1, z: 1,
    ease: "back.out(1.4)",
    stagger: 0.06,
    duration: 0.5,
  }, 0.35)
  // cubes drift closer as the camera advances
  .to(cubes.map((c) => c.position), {
    z: (i, el) => el.z + (i % 2 === 0 ? 1.6 : 1.0),
    ease: "power1.inOut",
    duration: 0.9,
  }, 0.3)
  // hero copy gently drifts up / fades while the camera pushes in
  .to(".hero-copy", { y: -60, opacity: 0, ease: "power1.in", duration: 0.35 }, 0.75)
  .to(mug.position, { y: -0.15, ease: "power1.inOut", duration: 0.9 }, 0.2);

// fade the whole scene in on load
gsap.from(camera.position, { z: 14, duration: 1.8, ease: "power2.out" });
gsap.from(canvas, { opacity: 0, duration: 1.2, ease: "power1.out" });

// ---- resize ----
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  layoutForViewport();
});
mobileQuery.addEventListener?.("change", layoutForViewport);
