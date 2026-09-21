import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = selector => document.querySelector(selector);
const stage = $('#stage');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 700px)');
const state = { expansion: 0, target: 0, selected: null, hovered: null, touch: false, view: 0, alive: true, fallback: false };
const descriptions = {
  barrel: ['Barrel', 'The hollow barrel defines the exterior through stepped contours, continuous bevels, and grip texture. During expansion it moves backward along the axis.'],
  rear: ['Rear lens', 'The smaller biconvex lens retains curved surfaces and edge thickness. Shape and color are schematic, without specific glass or optical parameters.'],
  spacer: ['Spacer', 'This hollow ring maintains axial spacing between internal parts. Its opening, width, and position distinguish it from the lenses.'],
  front: ['Front lens', 'The larger curved lens sits behind the front opening. Soft gray-green reflections reveal curvature without simulating coatings or light paths.'],
  retainer: ['Retainer', 'A narrow front ring illustrates axial retention. Its profile and opening remain legible; threads and manufacturing tolerances are omitted.'],
};
const listeners = new AbortController();
const geometries = new Set(), materials = new Set(), parts = new Map(), picks = [], pointers = new Map();
const ownGeometry = value => (geometries.add(value), value);
const ownMaterial = value => (materials.add(value), value);
const on = (element, event, callback) => element.addEventListener(event, callback, { signal: listeners.signal });
const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
const views = [[6.9, 3.7, 8.5], [3.4, 2.4, 11.5], [9.7, 1.5, 4.8]];
let scene, camera, renderer, controls, environmentTarget, observer, root, axis, raf = 0, tween = null, renderCount = 0;

function material(color, metalness, roughness) {
  return ownMaterial(new THREE.MeshStandardMaterial({ color, metalness, roughness }));
}
function lathe(profile, surface, segments = 96) {
  const geometry = ownGeometry(new THREE.LatheGeometry(profile.map(([radius, x]) => new THREE.Vector2(radius, x)), segments));
  geometry.rotateZ(-Math.PI / 2);
  return new THREE.Mesh(geometry, surface);
}
function ring(inner, outer, width, surface, bevel = .025) {
  return lathe([[inner, -width / 2], [outer - bevel, -width / 2], [outer, -width / 2 + bevel], [outer, width / 2 - bevel], [outer - bevel, width / 2], [inner, width / 2], [inner, -width / 2]], surface);
}
function lens(radius, thickness, surface) {
  const points = [], edge = .052;
  for (let i = 0; i <= 32; i++) { const t = i / 32; points.push([radius * t, -edge - (thickness / 2 - edge) * (1 - t * t)]); }
  for (let i = 32; i >= 0; i--) { const t = i / 32; points.push([radius * t, edge + (thickness / 2 - edge) * (1 - t * t)]); }
  return lathe(points, surface);
}
function part(id, assembled, expanded) {
  const group = new THREE.Group();
  group.userData = { id, assembled, expanded };
  root.add(group); parts.set(id, group);
  return group;
}
function add(group, mesh, x = 0) {
  mesh.position.x = x; group.add(mesh); picks.push(mesh);
  return mesh;
}
function init() {
  scene = new THREE.Scene();
  root = new THREE.Group(); scene.add(root);
  camera = new THREE.OrthographicCamera(-4, 4, 3, -3, .1, 70);
  camera.position.fromArray(views[0]); camera.lookAt(0, 0, 0);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.append(renderer.domElement);
  const room = new RoomEnvironment(), pmrem = new THREE.PMREMGenerator(renderer);
  environmentTarget = pmrem.fromScene(room, .04);
  scene.environment = environmentTarget.texture; scene.environmentIntensity = .95;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xf4f6e8, 0x849285, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 4.2); key.position.set(2, 7, 8); scene.add(key);
  const fill = new THREE.DirectionalLight(0xccd9d3, 2.1); fill.position.set(-4, 2, -6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffe8c2, 1.7); rim.position.set(6, -2, -2); scene.add(rim);
  const graphite = material(0x343d38, .88, .32);
  const grip = material(0x26322c, .67, .46);
  const edge = material(0x8b9385, .88, .27);
  const bronze = material(0x89785a, .8, .3);
  const rearGlass = ownMaterial(new THREE.MeshPhysicalMaterial({ color: 0x94b6a7, metalness: .14, roughness: .13, clearcoat: 1, clearcoatRoughness: .14 }));
  const frontGlass = ownMaterial(new THREE.MeshPhysicalMaterial({ color: 0x5c897b, metalness: .35, roughness: .12, clearcoat: 1, clearcoatRoughness: .1 }));
  const barrel = part('barrel', -.22, -3.15);
  add(barrel, lathe([[.93, -1.36], [1.04, -1.36], [1.11, -1.29], [1.11, -1.04], [1.18, -.98], [1.18, .62], [1.24, .69], [1.24, .87], [1.18, .94], [1.035, .94], [1.035, -.85], [.93, -.93], [.93, -1.36]], graphite));
  // Grip grooves belong to the barrel, rather than becoming additional semantic parts.
  for (let i = 0; i < 23; i++) add(barrel, ring(1.166, 1.199, .026, grip, .007), -.76 + i * .043);
  add(barrel, ring(1.10, 1.18, .055, edge, .014), -1.01);
  add(barrel, ring(1.16, 1.20, .045, bronze, .013), .28);
  add(barrel, ring(1.17, 1.245, .07, edge, .02), .70);
  const rear = part('rear', -.99, -.90);
  add(rear, lens(.86, .42, rearGlass)); add(rear, ring(.843, .893, .12, edge));
  const spacer = part('spacer', -.37, .83);
  add(spacer, ring(.77, .975, .29, graphite)); add(spacer, ring(.92, .989, .045, edge, .013), -.11);
  const front = part('front', .42, 2.62);
  add(front, lens(1.012, .58, frontGlass)); add(front, ring(.998, 1.037, .11, bronze));
  const retainer = part('retainer', .85, 4.41);
  add(retainer, ring(.925, 1.239, .24, graphite, .035));
  add(retainer, ring(1.184, 1.247, .06, edge, .018), .085);
  add(retainer, ring(.924, .959, .09, bronze, .018), .075);
  for (const group of parts.values()) group.traverse(object => {
    if (!object.isMesh) return;
    object.material = ownMaterial(object.material.clone());
    object.userData.baseColor = object.material.color.clone();
  });
  axis = new THREE.Line(ownGeometry(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-4.8, 0, 0), new THREE.Vector3(4.9, 0, 0)])), ownMaterial(new THREE.LineDashedMaterial({ color: 0x6d7e6c, transparent: true, opacity: 0, dashSize: .045, gapSize: .12 })));
  axis.computeLineDistances(); root.add(axis);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false; controls.enablePan = false; controls.enableZoom = false;
  controls.minPolarAngle = .23; controls.maxPolarAngle = Math.PI * .80;
  controls.rotateSpeed = .68;
  controls.addEventListener('change', invalidate);
  observer = new ResizeObserver(resize); observer.observe(stage);
  on(renderer.domElement, 'pointerdown', down);
  on(renderer.domElement, 'pointermove', move);
  on(renderer.domElement, 'pointerup', up);
  on(renderer.domElement, 'pointercancel', cancel);
  on(renderer.domElement, 'lostpointercapture', cancel);
  on(renderer.domElement, 'pointerleave', () => { state.hovered = null; paint(); });
  on(renderer.domElement, 'webglcontextlost', event => { event.preventDefault(); fallback('The 3D view was interrupted. The 2D assembly and part details remain available. Refresh to reload.'); });
  on(window, 'blur', () => { pointers.clear(); state.hovered = null; paint(); });
  on(document, 'visibilitychange', () => { pointers.clear(); state.hovered = null; if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0; } else invalidate(); });
  on(narrow, 'change', () => { syncTouch(); resize(); });
  on(reduced, 'change', () => { if (reduced.matches && tween) { state.expansion = state.target; tween = null; positions(); sync(); } });
  $('#fallback').hidden = true;
  syncTouch(); resize(); positions(); sync();
}
function resize() {
  if (!state.alive || state.fallback) return;
  const { width, height } = stage.getBoundingClientRect();
  if (!width || !height) return;
  root.rotation.z = narrow.matches ? -.64 : -.10;
  renderer.setSize(width, height, false);
  fit(); invalidate();
}
function fit() {
  if (!camera || !stage.clientHeight) return;
  const aspect = stage.clientWidth / stage.clientHeight;
  const fraction = state.expansion;
  const height = narrow.matches ? 4.7 + fraction * 4.9 : Math.max(4.8 + fraction * 1.5, (4.6 + fraction * 5.7) / aspect);
  camera.left = -height * aspect / 2; camera.right = height * aspect / 2;
  camera.top = height / 2; camera.bottom = -height / 2;
  camera.updateProjectionMatrix();
}
function positions() {
  for (const group of parts.values()) group.position.x = THREE.MathUtils.lerp(group.userData.assembled, group.userData.expanded, state.expansion);
  axis.material.opacity = .3 * state.expansion;
  fit(); invalidate();
}
function sync() {
  $('#spread').value = Math.round(state.expansion * 100);
  $('#amount').value = `${Math.round(state.expansion * 100)}%`;
  for (const button of document.querySelectorAll('[data-mode]')) button.setAttribute('aria-pressed', String(button.dataset.mode === (state.target > .5 ? 'expanded' : 'exterior')));
  for (const button of document.querySelectorAll('[data-part]')) {
    button.setAttribute('aria-pressed', String(button.dataset.part === state.selected));
    button.dataset.hovered = String(button.dataset.part === state.hovered);
  }
  const detail = descriptions[state.selected];
  $('#detail-title').textContent = detail?.[0] ?? 'Start with the whole';
  $('#detail-text').textContent = detail?.[1] ?? 'Steps, grip texture, and the front opening define the whole. Select a part to reveal the interior, or use the slider to control expansion.';
  $('#clear').disabled = !state.selected;
}
function paint() {
  for (const [id, group] of parts) group.traverse(object => {
    if (!object.isMesh) return;
    object.material.color.copy(object.userData.baseColor);
    object.material.emissive.set(id === state.selected ? 0x577048 : id === state.hovered ? 0x384d38 : 0x000000);
    object.material.emissiveIntensity = id === state.selected ? .29 : .16;
  });
  if (renderer) renderer.domElement.style.cursor = state.hovered ? 'pointer' : 'grab';
  sync(); invalidate();
}
function expand(target, announce = true) {
  state.target = target;
  if (reduced.matches) { state.expansion = target; tween = null; positions(); }
  else tween = { from: state.expansion, to: target, start: performance.now(), duration: 650 * Math.max(.35, Math.abs(target - state.expansion)) };
  sync(); invalidate();
  if (announce) $('#status').textContent = target ? 'Expanded along the shared axis' : 'Exterior restored';
}
function select(id, reveal = false) {
  state.selected = id;
  if (id && reveal && state.target < .8 && !state.fallback) expand(1, false);
  $('#status').textContent = id ? `Selected ${descriptions[id][0]}` : state.fallback ? '2D alternative' : 'Ready to explore · Still by default';
  paint();
}
function hit(event) {
  if (state.fallback) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
  scene.updateMatrixWorld(true); raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(picks, false)[0]?.object.parent.userData.id ?? null;
}
function down(event) {
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, moved: false });
  if (pointers.size > 1) for (const tracked of pointers.values()) tracked.moved = true;
}
function move(event) {
  const tracked = pointers.get(event.pointerId);
  if (tracked && Math.hypot(event.clientX - tracked.x, event.clientY - tracked.y) > 5) tracked.moved = true;
  if (event.pointerType === 'mouse' && !pointers.size) { state.hovered = hit(event); paint(); }
}
function up(event) {
  const tracked = pointers.get(event.pointerId); pointers.delete(event.pointerId);
  if (!tracked || tracked.moved || Math.hypot(event.clientX - tracked.x, event.clientY - tracked.y) > 5) return;
  const id = hit(event); select(state.selected === id ? null : id);
}
function cancel(event) { pointers.delete(event.pointerId); state.hovered = null; paint(); }
function syncTouch() {
  controls.enabled = !narrow.matches || state.touch;
  renderer.domElement.style.touchAction = controls.enabled ? 'none' : 'pan-y';
  $('#gesture').textContent = narrow.matches ? state.touch ? 'Drag to orbit · Tap a part' : 'Scroll the page · Tap a part' : 'Drag to inspect · Select a visible part';
  $('#touch').setAttribute('aria-pressed', String(state.touch));
  $('#touch').textContent = state.touch ? 'Disable touch rotation' : 'Enable touch rotation';
}
function view(index) {
  state.view = index;
  camera.position.fromArray(views[index]); controls.target.set(0, 0, 0); camera.up.set(0, 1, 0);
  controls.update(); invalidate();
}
function reset() {
  state.touch = false; state.hovered = null;
  view(0); syncTouch(); select(null); expand(0);
}
function invalidate() {
  if (state.alive && !state.fallback && !document.hidden && !raf) raf = requestAnimationFrame(render);
}
function render(now) {
  raf = 0;
  if (!state.alive || state.fallback) return;
  if (tween) {
    const t = Math.min(1, (now - tween.start) / tween.duration);
    const ease = t * t * (3 - 2 * t);
    state.expansion = THREE.MathUtils.lerp(tween.from, tween.to, ease);
    if (t === 1) tween = null;
    positions(); sync();
  }
  renderer.render(scene, camera); renderCount++;
  if (tween) invalidate();
}
function fallback(message) {
  state.fallback = true; tween = null;
  if (raf) cancelAnimationFrame(raf); raf = 0;
  if (controls) controls.enabled = false;
  if (renderer) {
    renderer.domElement.hidden = true;
    renderer.domElement.style.display = 'none';
  }
  $('#fallback').hidden = false; $('#fallback-message').textContent = message;
  $('#status').textContent = '2D alternative';
  for (const element of document.querySelectorAll('[data-mode],#spread,#reset,#view,#touch')) element.disabled = true;
}
function dispose() {
  if (!state.alive) return;
  state.alive = false; tween = null;
  if (raf) cancelAnimationFrame(raf); raf = 0;
  listeners.abort(); observer?.disconnect(); controls?.dispose();
  for (const geometry of geometries) geometry.dispose();
  for (const surface of materials) surface.dispose();
  environmentTarget?.dispose();
  if (scene) scene.environment = null;
  renderer?.dispose(); renderer?.domElement.remove(); pointers.clear();
}
for (const button of document.querySelectorAll('[data-mode]')) on(button, 'click', () => { if (button.dataset.mode === 'exterior') select(null); expand(button.dataset.mode === 'expanded' ? 1 : 0); });
for (const button of document.querySelectorAll('[data-part]')) on(button, 'click', () => select(button.dataset.part === state.selected ? null : button.dataset.part, true));
on($('#spread'), 'input', event => { tween = null; state.expansion = state.target = Number(event.target.value) / 100; positions(); sync(); });
on($('#spread'), 'change', () => { $('#status').textContent = `Expanded ${Math.round(state.expansion * 100)}%`; });
on($('#clear'), 'click', () => select(null));
on($('#reset'), 'click', reset);
on($('#view'), 'click', () => { view((state.view + 1) % views.length); $('#status').textContent = `View ${state.view + 1} / ${views.length}`; });
on($('#touch'), 'click', () => { state.touch = !state.touch; syncTouch(); });
try { init(); $('#status').textContent = 'Ready to explore · Still by default'; }
catch (error) { fallback('3D is unavailable in this browser. Explore the 2D assembly and part details instead.'); console.info('3D unavailable:', error.message); }
on(window, 'pagehide', dispose);
if (new URLSearchParams(location.search).has('qa')) window.productQA = {
  state: () => ({ ...state, revision: THREE.REVISION, renderCount, animating: !!tween, positions: Object.fromEntries([...parts].map(([id, group]) => [id, group.position.x])), renderer: renderer ? { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles } : null }),
  project: id => { const group = parts.get(id), point = new THREE.Vector3(0, id === 'barrel' || id === 'spacer' || id === 'retainer' ? .98 : 0, 0); group.localToWorld(point); point.project(camera); const rect = renderer.domElement.getBoundingClientRect(); return { x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 }; },
  loseContext: () => renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext(), dispose,
};
