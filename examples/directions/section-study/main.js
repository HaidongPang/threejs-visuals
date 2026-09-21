import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = (selector) => document.querySelector(selector);
const stage = $('#stage');
const state = { expansion: 0.24, selected: null, hovered: null, focused: false, side: false, ready: false };
const parts = new Map();
const pickMeshes = [];
const resources = new Set();
const listeners = new AbortController();
const raycaster = new THREE.Raycaster();
const pointers = new Map();
const metadata = {
  barrel: ['01 / Barrel', 'A stepped hollow housing. Pale cut faces reveal wall thickness, while the far surface preserves the barrel silhouette.'],
  rear: ['02 / Rear lens', 'A smaller biconvex profile. Center thickness and edge variation make the curved form readable.'],
  spacer: ['03 / Spacer', 'A hollow ring between the two lenses. Expansion follows the assembly axis without implying lateral displacement.'],
  front: ['04 / Front lens', 'A larger biconvex profile on the same axis as the rear lens. Curvature and dimensions do not represent a real optical design.'],
  retainer: ['05 / Retainer', 'A hollow front ring illustrates axial retention. The opening and step remain visible; threads and manufacturing tolerances are omitted.']
};
let renderer, scene, camera, environment, observer, pending = 0, alive = true, renders = 0;
const own = (resource) => (resources.add(resource), resource);
const on = (el, type, fn) => el.addEventListener(type, fn, { signal: listeners.signal });

function material(color, metalness = 0, roughness = 0.4) {
  return own(new THREE.MeshStandardMaterial({ color, metalness, roughness, side: THREE.DoubleSide }));
}

// Radius/axial profiles are revolved around X. Retain the far half (z <= 0).
// Explicit caps distinguish an intentional cut from an accidentally open mesh.
function section(group, profile, surface, cap) {
  const points = profile.map(([radius, axial]) => new THREE.Vector2(radius, axial));
  const geometry = own(new THREE.LatheGeometry(points, 80, Math.PI / 2, Math.PI));
  geometry.rotateZ(-Math.PI / 2);
  const body = new THREE.Mesh(geometry, surface);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  for (const sign of [-1, 1]) {
    const shape = new THREE.Shape();
    profile.forEach(([radius, axial], index) => index ? shape.lineTo(axial, sign * radius) : shape.moveTo(axial, sign * radius));
    const cut = new THREE.Mesh(own(new THREE.ShapeGeometry(shape)), cap);
    cut.position.z = 0.001;
    group.add(cut);
  }
}

function ringProfile(inner, outer, width) {
  return [[inner, -width / 2], [outer - 0.035, -width / 2], [outer, -width / 2 + 0.035], [outer, width / 2 - 0.035], [outer - 0.035, width / 2], [inner, width / 2], [inner, -width / 2]];
}

function lensProfile(radius, thickness) {
  const profile = [];
  for (let i = 0; i <= 28; i++) { const t = i / 28; profile.push([radius * t, -0.047 - (thickness / 2 - 0.047) * (1 - t * t)]); }
  for (let i = 28; i >= 0; i--) { const t = i / 28; profile.push([radius * t, 0.047 + (thickness / 2 - 0.047) * (1 - t * t)]); }
  return profile;
}

function part(id, origin, travel, profile, colors) {
  const group = new THREE.Group();
  group.userData = { id, origin, travel };
  section(group, profile, material(colors[0], colors[2], colors[3]), material(colors[1], 0.08, 0.48));
  group.traverse((object) => {
    if (!object.isMesh) return;
    object.userData.id = id;
    object.userData.baseColor = object.material.color.clone();
    pickMeshes.push(object);
  });
  parts.set(id, group);
  scene.add(group);
}

function initialize() {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-5, 5, 3, -3, 0.1, 50);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  environment = pmrem.fromScene(room, 0.035);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.8;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfffbeb, 0xa1afa2, 2.0));
  const key = new THREE.DirectionalLight(0xfff6e3, 3.3);
  key.position.set(-3, 7, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 5, bottom: -5 });
  key.shadow.normalBias = 0.025;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xd8e5df, 1.8);
  rim.position.set(5, 3, -5);
  scene.add(rim);
  const ground = new THREE.Mesh(own(new THREE.PlaneGeometry(100, 100)), own(new THREE.ShadowMaterial({ opacity: 0.09 })));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.36; ground.receiveShadow = true; scene.add(ground);
  part('barrel', -0.35, -1.1, [[1.03,-1.4],[1.23,-1.4],[1.29,-1.32],[1.29,-1.02],[1.22,-0.96],[1.22,0.9],[1.29,0.96],[1.29,1.19],[1.05,1.19],[1.05,-1.4]], [0x505e4b,0xc5b78c,0.68,0.34]);
  part('rear', -0.92, 1.05, lensProfile(0.94,0.47), [0x668580,0xa8c4b7,0.17,0.21]);
  part('spacer', -0.28, 1.7, ringProfile(0.78,1.025,0.30), [0x6d735f,0xc4bb96,0.67,0.31]);
  part('front', 0.49, 2.6, lensProfile(1.01,0.69), [0x53787c,0x98bbbc,0.22,0.18]);
  part('retainer', 1.07, 3.5, [[0.86,-0.14],[1.15,-0.14],[1.19,-0.10],[1.19,0.05],[1.12,0.05],[1.12,0.18],[0.86,0.18],[0.86,-0.14]], [0x9a805b,0xd2c6a6,0.72,0.3]);
  const axisGeometry = own(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-6,0,0.06),new THREE.Vector3(7,0,0.06)]));
  const axis = new THREE.Line(axisGeometry, own(new THREE.LineDashedMaterial({ color:0x969a88,dashSize:0.045,gapSize:0.095,transparent:true,opacity:0.45 })));
  axis.computeLineDistances(); scene.add(axis);
  on(renderer.domElement,'pointermove', pointerMove);
  on(renderer.domElement,'pointerdown', (e) => { pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,cancelled:false});if(pointers.size>1)for(const p of pointers.values())p.cancelled=true; });
  on(renderer.domElement,'pointerup', (e) => { const p=pointers.get(e.pointerId);pointers.delete(e.pointerId);if(p&&!p.cancelled&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<6) select(hit(e)); });
  on(renderer.domElement,'pointercancel', (e) => pointers.delete(e.pointerId));
  on(renderer.domElement,'pointerleave', () => {state.hovered=null;pointers.clear();paint();});
  on(window,'blur',()=>{pointers.clear();state.hovered=null;paint();});
  on(renderer.domElement,'webglcontextlost',(e)=>{e.preventDefault();fallback('The 3D context was lost. The fallback diagram and part details remain available. Refresh to retry.');});
  observer = new ResizeObserver(resize);
  observer.observe(stage);
  state.ready=true;
  $('#fallback').hidden=true;
  update();
}

function fit() {
  if(!state.ready)return;
  const width=stage.clientWidth,height=stage.clientHeight,aspect=width/height;
  const bounds=new THREE.Box3();
  if(state.focused&&state.selected) bounds.setFromObject(parts.get(state.selected));
  else for(const group of parts.values()) bounds.union(new THREE.Box3().setFromObject(group));
  const center=bounds.getCenter(new THREE.Vector3());
  const size=bounds.getSize(new THREE.Vector3());
  const viewWidth=Math.max(state.focused?3.3:5.9,size.x*1.25+size.z*0.24);
  const viewHeight=Math.max(4.05,viewWidth/aspect);
  camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;
  const target=new THREE.Vector3(center.x,0,-0.24);
  camera.position.copy(target).add(state.side?new THREE.Vector3(0,0,14):new THREE.Vector3(2.6,2.05,14));
  camera.lookAt(target);camera.updateProjectionMatrix();
}

function resize(){if(!state.ready)return;renderer.setSize(stage.clientWidth,stage.clientHeight,false);fit();invalidate();}
function update(){
  for(const group of parts.values())group.position.x=group.userData.origin+group.userData.travel*state.expansion;
  $('#amount').value=`${Math.round(state.expansion*100)}%`;
  $('#pose-description').textContent=state.expansion?`Expanded ${Math.round(state.expansion*100)}%`:'Assembled';
  $('#view-description').textContent=state.side?'Side section':'Angled section';
  $('#angled').setAttribute('aria-pressed',String(!state.side));$('#side').setAttribute('aria-pressed',String(state.side));
  fit();paint();
}

function paint(){
  for(const [id,group]of parts)group.traverse((object)=>{if(!object.isMesh)return;object.material.color.copy(object.userData.baseColor);object.material.emissive.set(id===state.selected?0x6c6b33:id===state.hovered?0x4b5233:0x000000);object.material.emissiveIntensity=id===state.selected?0.19:0.10;});
  for(const button of document.querySelectorAll('[data-part]')){button.setAttribute('aria-pressed',String(button.dataset.part===state.selected));button.dataset.hovered=String(button.dataset.part===state.hovered);}
  if(renderer)renderer.domElement.style.cursor=state.hovered?'pointer':'default';
  invalidate();
}

function select(id){
  state.selected=id===state.selected?null:id;state.focused=false;
  $('#detail-name').textContent=state.selected?metadata[state.selected][0]:'Follow the axis.';
  $('#detail-copy').textContent=state.selected?metadata[state.selected][1]:'Select a part or move the slider. The barrel moves back while the internal parts keep their order.';
  $('#focus').disabled=!state.selected||!state.ready;$('#focus').innerHTML='Focus part <span aria-hidden="true">↗</span>';
  fit();paint();
}

function hit(event){
  if(!state.ready)return null;
  const rect=renderer.domElement.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),camera);
  scene.updateMatrixWorld(true);
  return raycaster.intersectObjects(pickMeshes,false)[0]?.object.userData.id??null;
}

function pointerMove(event){
  const p=pointers.get(event.pointerId);if(p&&Math.hypot(event.clientX-p.x,event.clientY-p.y)>6)p.cancelled=true;
  if(event.pointerType==='mouse'&&!pointers.size){const id=hit(event);if(id!==state.hovered){state.hovered=id;paint();}}
}
function invalidate(){if(alive&&state.ready&&!document.hidden&&!pending)pending=requestAnimationFrame(()=>{pending=0;renderer.render(scene,camera);renders++;});}
function fallback(message){state.ready=false;if(pending)cancelAnimationFrame(pending);pending=0;if(renderer){renderer.domElement.setAttribute('hidden','');renderer.domElement.style.display='none';}$('#fallback').hidden=false;$('#fallback-message').textContent=message;for(const selector of ['#expansion','#angled','#side','#focus','#reset'])$(selector).disabled=true;}
function dispose(){if(!alive)return;alive=false;if(pending)cancelAnimationFrame(pending);listeners.abort();observer?.disconnect();for(const resource of resources)resource.dispose();environment?.dispose();scene?.traverse(o=>o.shadow?.dispose());renderer?.dispose();renderer?.domElement.remove();}

on($('#expansion'),'input',(e)=>{state.expansion=Number(e.target.value)/100;state.focused=false;$('#focus').innerHTML='Focus part <span aria-hidden="true">↗</span>';update();});
on($('#side'),'click',()=>{state.side=true;update();});on($('#angled'),'click',()=>{state.side=false;update();});
for(const button of document.querySelectorAll('[data-part]'))on(button,'click',()=>select(button.dataset.part));
on($('#focus'),'click',()=>{state.focused=!state.focused;$('#focus').innerHTML=state.focused?'Show all <span aria-hidden="true">↙</span>':'Focus part <span aria-hidden="true">↗</span>';fit();invalidate();});
on($('#reset'),'click',()=>{state.expansion=0.24;state.side=false;state.selected=null;state.hovered=null;state.focused=false;$('#expansion').value=24;select(null);update();});
on(document,'visibilitychange',()=>{pointers.clear();state.hovered=null;if(document.hidden&&pending){cancelAnimationFrame(pending);pending=0;}else paint();});
on(window,'pagehide',dispose);
try{initialize();}catch(error){fallback('This browser could not create the 3D section. The fallback diagram and part details remain available.');console.info('3D unavailable:',error.message);}
if(new URLSearchParams(location.search).has('qa'))window.sectionQA={
  state:()=>({...state,renders,revision:THREE.REVISION,info:renderer?JSON.parse(JSON.stringify(renderer.info.render)):null}),
  positions:()=>Object.fromEntries([...parts].map(([id,p])=>[id,p.position.x])),
  project:(id)=>{const group=parts.get(id);const radius=id==='barrel'?1.15:id==='spacer'?0.91:id==='retainer'?1.01:0.48;const p=new THREE.Vector3(group.position.x,radius,0.002).project(camera);const r=renderer.domElement.getBoundingClientRect();return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};},
  dispose
};
