import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = (s) => document.querySelector(s);
const stage = $('#stage');
const state = { selected: null, hovered: null, focused: false, expansion: .35, view: 'cutaway', low: false, touch: false, alive: true, fallback: false };
const labels = {
  barrel: ['Barrel', 'A stepped hollow housing aligns the internal parts on one axis. The cutaway removes part of the shell to reveal the interior.'],
  rear: ['Rear lens', 'A smaller biconvex lens. Curved contours and solid thickness distinguish it from a floating flat disc.'],
  spacer: ['Spacer', 'A hollow ring maintains assembly spacing. Expansion is axial and preserves part order.'],
  front: ['Front lens', 'A larger biconvex lens. The muted green surface reveals curvature rather than representing specific glass or an optical coating.'],
  retainer: ['Retainer', 'A front ring illustrates axial retention with an open bore. Threads and manufacturing tolerances are omitted.']
};
const geometries = new Set(), materials = new Set();
const ownGeometry = (g) => (geometries.add(g), g);
const ownMaterial = (m) => (materials.add(m), m);
const listeners = new AbortController();
let renderer, controls, observer, envTarget, scene, camera, raf = 0, renderCount = 0;
let focusTween = null;
const parts = new Map(), picks = [], pointers = new Map();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const narrow = matchMedia('(max-width: 700px)');
const homePosition = new THREE.Vector3(8.6, 5.6, 10.5);
const homeTarget = new THREE.Vector3(.4, 0, 0);
let viewHeight = 6.6;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function on(el, event, fn) { el.addEventListener(event, fn, { signal: listeners.signal }); }
function fallback(reason) {
  state.fallback = true;
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  if (controls) controls.enabled = false;
  if (renderer) {
    renderer.domElement.hidden = true;
    renderer.domElement.style.display = 'none';
  }
  $('#fallback').hidden = false;
  $('#fallback-message').textContent = reason;
  $('#status').textContent = '2D alternative';
  for (const el of document.querySelectorAll('#explode,#focus,#reset,#cutaway,#exterior,#low-quality,#touch-toggle')) el.disabled = true;
}
function lathe(profile, mat, angle = Math.PI * 2, start = 0) {
  const g = ownGeometry(new THREE.LatheGeometry(profile.map(([r,x]) => new THREE.Vector2(r,x)), 80, start, angle));
  g.rotateZ(-Math.PI / 2);
  const mesh = new THREE.Mesh(g, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
function ring(inner, outer, width, mat) {
  return lathe([[inner,-width/2],[outer-.03,-width/2],[outer,-width/2+.03],[outer,width/2-.03],[outer-.03,width/2],[inner,width/2],[inner,-width/2]],mat);
}
function lens(radius, thickness, mat) {
  const profile = [];
  const rim = .065;
  for(let i=0;i<=24;i++) { const t=i/24; profile.push([radius*t,-rim-(thickness/2-rim)*(1-t*t)]); }
  for(let i=24;i>=0;i--) { const t=i/24; profile.push([radius*t,rim+(thickness/2-rim)*(1-t*t)]); }
  return lathe(profile, mat);
}
function makePart(id, base, offset) {
  const group = new THREE.Group();
  group.userData.id=id;
  group.userData.base=base;
  group.userData.offset=offset;
  group.userData.pickable=true;
  scene.add(group); parts.set(id,group);
  return group;
}
function add(group, mesh) { group.add(mesh); picks.push(mesh); return mesh; }
function material(color, metalness, roughness) {
  return ownMaterial(new THREE.MeshStandardMaterial({color,metalness,roughness}));
}
function createScene() {
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-5,5,3.3,-3.3,.1,80);
  camera.position.copy(homePosition); camera.lookAt(homeTarget);
  renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  envTarget=pmrem.fromScene(environment,.04);
  scene.environment=envTarget.texture;
  scene.environmentIntensity=.65;
  environment.dispose(); pmrem.dispose();
  const ambient=new THREE.HemisphereLight(0xf6f9ee,0x9bada3,2.0); scene.add(ambient);
  const key=new THREE.DirectionalLight(0xfffaf0,4.5); key.position.set(1,8,7); key.castShadow=true;
  key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-7;key.shadow.camera.right=7;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.035; scene.add(key);
  const fill=new THREE.DirectionalLight(0xd4e6de,1.8); fill.position.set(-5,2,-5); scene.add(fill);
  const ground=new THREE.Mesh(ownGeometry(new THREE.PlaneGeometry(200,200)),ownMaterial(new THREE.ShadowMaterial({opacity:.13})));
  ground.rotation.x=-Math.PI/2;ground.position.y=-1.45;ground.receiveShadow=true;scene.add(ground);
  const dark=material(0x354840,.75,.32), edge=material(0x8b9589,.82,.25), pale=material(0x99bab0,.12,.22), glass=material(0x669c8a,.28,.2), gold=material(0x9e8251,.78,.27);
  const profile=[[1.03,-1.38],[1.2,-1.38],[1.27,-1.25],[1.27,-.95],[1.2,-.89],[1.2,.77],[1.29,.83],[1.29,1.03],[1.05,1.03],[1.05,-1.38]];
  const barrel=makePart('barrel',-.35,-1.7);
  const cut=add(barrel,lathe(profile,dark,Math.PI*1.42,Math.PI*.1));cut.name='cut';
  const full=add(barrel,lathe(profile,dark));full.name='full';full.visible=false;
  // Exposed cut boundary caps close the intentional section; they are not floating panels.
  for(const a of [Math.PI*.1,Math.PI*1.52]) {
    const shape=new THREE.Shape();profile.forEach(([r,x],i)=>i?shape.lineTo(r,x):shape.moveTo(r,x));
    const cap=new THREE.Mesh(ownGeometry(new THREE.ShapeGeometry(shape)),edge);
    cap.rotation.y=Math.PI/2-a;cap.rotation.z=-Math.PI/2;
    // Use direct positions for the two radial cross-sections, keeping the lathe's coordinate convention.
    const pos=cap.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){const r=pos.getX(i),x=pos.getY(i);pos.setXYZ(i,x,-r*Math.sin(a),r*Math.cos(a));}
    cap.rotation.set(0,0,0);cap.geometry.computeVertexNormals();cap.material.side=THREE.DoubleSide;cap.name='cap';add(barrel,cap);
  }
  const rear=makePart('rear',-.70,.2);add(rear,lens(.90,.46,pale));add(rear,ring(.885,.922,.13,edge));
  const spacer=makePart('spacer',-.08,1.15);add(spacer,ring(.82,1.035,.32,dark));
  const front=makePart('front',.65,2.1);add(front,lens(1.0,.59,glass));add(front,ring(.989,1.025,.13,gold));
  const retainer=makePart('retainer',1.17,3.15);add(retainer,ring(.86,1.17,.25,edge));add(retainer,ring(1.12,1.19,.08,dark));
  const axis = new THREE.Line(ownGeometry(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5,0,0),new THREE.Vector3(6,0,0)])),ownMaterial(new THREE.LineDashedMaterial({color:0x85968b,dashSize:.08,gapSize:.1,transparent:true,opacity:.45})));
  axis.computeLineDistances();scene.add(axis);
  // Each mesh owns a material instance so temporary selection does not recolor another part.
  for(const part of parts.values()) part.traverse(o=>{if(o.isMesh){o.material=ownMaterial(o.material.clone());o.userData.baseColor=o.material.color.clone();}});
  controls=new OrbitControls(camera,renderer.domElement);
  controls.target.copy(homeTarget);controls.enableDamping=false;controls.enablePan=false;controls.minZoom=.55;controls.maxZoom=2.6;controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI*.73;controls.update();
  controls.addEventListener('change',invalidate);
  observer=new ResizeObserver(resize);observer.observe(stage);
  on(renderer.domElement,'webglcontextlost',(event)=>{event.preventDefault();fallback('The 3D context was lost. The 2D diagram and part details remain available. Refresh to recreate the view.');});
  on(renderer.domElement,'pointerdown',down);on(renderer.domElement,'pointermove',move);on(renderer.domElement,'pointerup',up);on(renderer.domElement,'pointercancel',cancel);on(renderer.domElement,'lostpointercapture',cancel);
  on(renderer.domElement,'pointerleave',()=>{state.hovered=null;paint();});
  on(window,'blur',()=>{pointers.clear();state.hovered=null;paint();});
  on(document,'visibilitychange',()=>{pointers.clear();state.hovered=null;if(document.hidden){focusTween=null;if(raf)cancelAnimationFrame(raf);raf=0;}else invalidate();});
  on(narrow,'change',()=>{syncTouch();resize();});
  on(reduced,'change',()=>{if(reduced.matches&&focusTween){camera.position.copy(focusTween.position);controls.target.copy(focusTween.target);camera.zoom=focusTween.zoom;focusTween=null;camera.updateProjectionMatrix();controls.update();invalidate();}});
  syncTouch();resize();updatePositions();
  $('#fallback').hidden=true;$('#status').textContent='Ready to explore · Still by default';
}
function syncTouch(){controls.enabled=!narrow.matches||state.touch;renderer.domElement.style.touchAction=controls.enabled?'none':'pan-y';$('#instructions').textContent=narrow.matches?(state.touch?'Drag to orbit · Pinch to zoom':'Scroll the page · Tap a part'):'Drag to orbit · Scroll to zoom · Click to select';}
function resize(){if(!state.alive||state.fallback)return;const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;const aspect=width/height;viewHeight=Math.max(6.4,9/aspect);camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;camera.updateProjectionMatrix();renderer.setSize(width,height,false);invalidate();}
function updatePositions(){for(const p of parts.values())p.position.x=p.userData.base+p.userData.offset*state.expansion;if(state.focused&&state.selected){const x=parts.get(state.selected).position.x;camera.position.x+=x-controls.target.x;controls.target.x=x;controls.update();}$('#amount').value=`${Math.round(state.expansion*100)}%`;invalidate();}
function paint(){for(const [id,part] of parts) part.traverse(o=>{if(o.isMesh){o.material.color.copy(o.userData.baseColor);o.material.emissive.set(id===state.selected?0x315d44:id===state.hovered?0x203c31:0x000000);o.material.emissiveIntensity=id===state.selected?.32:.16;}});for(const b of document.querySelectorAll('[data-part]')){b.setAttribute('aria-pressed',String(b.dataset.part===state.selected));b.dataset.hovered=String(b.dataset.part===state.hovered);}if(renderer)renderer.domElement.style.cursor=state.hovered?'pointer':'grab';invalidate();}
function select(id){focusTween=null;state.focused=false;state.selected=id;$('#detail-title').textContent=id?labels[id][0]:'Start with the whole';$('#detail-text').textContent=id?labels[id][1]:'Select a part to inspect its shape and position, or use the slider to expand the assembly step by step.';$('#focus').disabled=!id||state.fallback;$('#clear').disabled=!id;$('#status').textContent=id?`Selected ${labels[id][0]}`:state.fallback?'2D alternative':'Ready to explore · Still by default';paint();}
function hit(event){const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);scene.updateMatrixWorld(true);raycaster.setFromCamera(pointer,camera);const h=raycaster.intersectObjects(picks.filter(m=>m.visible),false)[0];return h?.object.parent.userData.id??null;}
function down(e){focusTween=null;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,moved:false});if(pointers.size>1)for(const p of pointers.values())p.moved=true;}
function move(e){const p=pointers.get(e.pointerId);if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)>5)p.moved=true;if(e.pointerType==='mouse'&&!pointers.size){state.hovered=hit(e);paint();}}
function up(e){const p=pointers.get(e.pointerId);pointers.delete(e.pointerId);if(p&&!p.moved&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<=5){const id=hit(e);select(id===state.selected?null:id);}}
function cancel(e){pointers.delete(e.pointerId);state.hovered=null;paint();}
function aim(target,position,zoom){focusTween=null;if(reduced.matches){controls.target.copy(target);camera.position.copy(position);camera.zoom=zoom;camera.updateProjectionMatrix();controls.update();invalidate();return;}focusTween={start:performance.now(),from:camera.position.clone(),fromTarget:controls.target.clone(),fromZoom:camera.zoom,position,target,zoom};invalidate();}
function reset(){state.expansion=.35;state.view='cutaway';state.hovered=null;$('#explode').value=35;setView('cutaway',false);select(null);updatePositions();aim(homeTarget.clone(),homePosition.clone(),1);}
function setView(view,moveCamera=true){state.focused=false;state.view=view;for(const child of parts.get('barrel').children)child.visible=child.name==='full'?view==='exterior':view==='cutaway';$('#cutaway').setAttribute('aria-pressed',String(view==='cutaway'));$('#exterior').setAttribute('aria-pressed',String(view==='exterior'));$('#view-caption').textContent=view==='cutaway'?'A cutaway reveals the interior':'Complete silhouette and outer surfaces';if(moveCamera)aim(homeTarget.clone(),view==='cutaway'?homePosition.clone():new THREE.Vector3(7,3.7,11),1);invalidate();}
function invalidate(){if(state.alive&&!state.fallback&&!document.hidden&&!raf)raf=requestAnimationFrame(render);}
function render(now){raf=0;if(!state.alive||state.fallback)return;if(focusTween){const t=Math.min(1,(now-focusTween.start)/360),e=t*t*(3-2*t);camera.position.lerpVectors(focusTween.from,focusTween.position,e);controls.target.lerpVectors(focusTween.fromTarget,focusTween.target,e);camera.zoom=THREE.MathUtils.lerp(focusTween.fromZoom,focusTween.zoom,e);camera.updateProjectionMatrix();controls.update();if(t===1)focusTween=null;}renderer.render(scene,camera);renderCount++;if(focusTween)invalidate();}
function dispose(){if(!state.alive)return;state.alive=false;if(raf)cancelAnimationFrame(raf);raf=0;focusTween=null;listeners.abort();observer?.disconnect();controls?.dispose();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();envTarget?.dispose();scene?.traverse(o=>o.shadow?.dispose());if(scene)scene.environment=null;renderer?.dispose();renderer?.domElement.remove();pointers.clear();}

on($('#explode'),'input',e=>{state.expansion=Number(e.target.value)/100;focusTween=null;updatePositions();});
on($('#reset'),'click',reset);on($('#clear'),'click',()=>select(null));
on($('#cutaway'),'click',()=>setView('cutaway'));on($('#exterior'),'click',()=>setView('exterior'));
on($('#focus'),'click',()=>{if(!state.selected)return;state.focused=true;const target=parts.get(state.selected).position.clone();const direction=camera.position.clone().sub(controls.target).normalize().multiplyScalar(14);aim(target,target.clone().add(direction),Math.min(2.6,viewHeight/3.8));$('#status').textContent=`Focusing on ${labels[state.selected][0]}`;});
for(const b of document.querySelectorAll('[data-part]'))on(b,'click',()=>select(b.dataset.part===state.selected?null:b.dataset.part));
on($('#low-quality'),'change',e=>{state.low=e.target.checked;renderer.setPixelRatio(state.low?1:Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=!state.low;resize();$('#status').textContent=state.low?'Low power · Controls available':'Standard quality';});
on($('#touch-toggle'),'click',()=>{state.touch=!state.touch;$('#touch-toggle').setAttribute('aria-pressed',String(state.touch));$('#touch-toggle').textContent=state.touch?'Disable touch rotation':'Enable touch rotation';syncTouch();});
try{createScene();}catch(error){fallback('This browser cannot create a 3D view. The 2D diagram and part details remain available.');console.info('3D unavailable:',error.message);}
on(window,'pagehide',dispose);
// Explicit local QA seam; ordinary controls above are the tested user paths.
if(new URLSearchParams(location.search).has('qa'))window.sceneQA={
  state:()=>({...state,revision:THREE.REVISION,renderCount,animating:!!focusTween,dpr:renderer?.getPixelRatio(),camera:camera?.position.toArray(),target:controls?.target.toArray(),zoom:camera?.zoom,info:renderer?JSON.parse(JSON.stringify({render:renderer.info.render,memory:renderer.info.memory})):null,positions:Object.fromEntries([...parts].map(([id,p])=>[id,p.position.toArray()]))}),
  project:(id)=>{const part=parts.get(id);const m=part.children.find(c=>c.isMesh&&c.visible);m.geometry.computeBoundingBox();const v=new THREE.Vector3();m.geometry.boundingBox.getCenter(v);if(id==='retainer'||id==='spacer'||id==='barrel')v.y=.95;m.localToWorld(v);v.project(camera);const r=renderer.domElement.getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},
  loseContext:()=>renderer.getContext().getExtension('WEBGL_lose_context')?.loseContext(),dispose
};
