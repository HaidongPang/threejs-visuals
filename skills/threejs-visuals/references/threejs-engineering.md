# Three.js engineering reference

Implementation serves visual and interaction intent. This is an index of decisions and common pitfalls, not a complete API manual for a fixed release. Inspect project dependencies, lockfiles, and wrappers; record the exact version and WebGL/WebGPU backend. The examples pin `three@0.186.0`; that does not justify upgrading the host project.

## Verify the version

- Inspect actual dependencies; runtime THREE.REVISION is supporting evidence. Check for duplicate Three.js installations.
- Verify parameters and imports against the installed source, types, examples, or matching official tag. Keep addons and core on the same version, especially Controls, GLTFLoader, DRACO, KTX2, and postprocessing.
- Do not carry forward obsolete outputEncoding, sRGBEncoding, lighting switches, or changed shader chunks from old tutorials. Verify WebGPU node materials/TSL separately from WebGL GLSL/ShaderMaterial.
- Official entry points: [API](https://threejs.org/docs/), [migration guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide). The examples were checked against [r186 source](https://github.com/mrdoob/three.js/tree/r186); the documentation homepage changes over time.

## Scene, camera, and coordinates

- A domain part may contain multiple Mesh objects; use a stable ID for its Group. Object3D parentage supports shared transforms and does not automatically represent domain containment.
- Establish units, the up axis, local/world coordinates, and assembly anchors. Save baseline transforms and derive offsets from state rather than accumulating per-frame error.
- Size the camera from its container, not window; use ResizeObserver for embedded layouts. Update the orthographic frustum or perspective aspect, then updateProjectionMatrix.
- Derive distance/zoom, near/far, and controls target from bounds and canvas aspect. Check focus, explosion, and narrow-screen clipping; avoid excessively wide depth ranges.
- Separate CSS size from drawing buffer size and cap DPR to the device budget. Avoid resize loops caused by setSize writing styles.

## Geometry, curves, and instances

- Use LatheGeometry, ExtrudeGeometry, TubeGeometry, or BufferGeometry for sections and functional shapes. Choose subdivisions for the visible silhouette; more polygons do not establish beauty.
- For custom BufferGeometry, inspect position/index, winding, normals, UVs, seams, and bounds. Update attributes and affected bounds after vertex changes.
- Share identical geometries and materials. Consider InstancedMesh for many repeated parts, retaining instanceId-to-domain-ID mapping. After batch changes, update instanceMatrix/instanceColor.needsUpdate and recalculate relevant bounds according to the version.
- Evaluate LOD, compression, and merging for large models without sacrificing necessary part selection, explosion, or characteristic outlines.

## Materials, textures, lighting, and postprocessing

- Start lit solids with MeshStandardMaterial; use MeshPhysicalMaterial for concrete transmission/coating needs. Schematic annotations may be unlit.
- Color textures usually use SRGBColorSpace; normal/roughness/metalness data textures use NoColorSpace. The loader generally manages glTF color space and orientation; check additional textures against model conventions.
- Verify output color space, tone mapping, exposure, and environment reflections. Perform output conversion at an explicit stage; check the output pass against the current version.
- Enable shadows as needed, tighten the shadow camera, and measure mapSize/bias. Shadows, transparency, transmission, and postprocessing add cost; do not use them to disguise crude forms.
- PMREM, environment maps, and render targets have lifecycles too. Verify shader uniforms, coordinate spaces, and color output; inspect the program cache key for onBeforeCompile changes. Do not assume WebGL postprocessing or GLSL works on WebGPU.

## Animation and on-demand rendering

- Coalesce static-scene refreshes with invalidate/requestAnimationFrame; update for input, resize, and loading. With controls damping, call update until settled, then stop.
- Derive educational timeline positions from progress or steps; do not autoplay by default. Autoplay needs pause, reset, and reduced-motion paths.
- Reuse existing loops instead of adding competing ones. Use elapsed time for continuous animation; reset or clamp delta on visibility restoration rather than catching up background time.
- Manage imported animations with AnimationMixer/Action for pause, seek, and switching. Verify skeleton cloning, morphs, and clip bindings against the version. On removal, stopAllAction and release caches and owned resources.

## Model loading

- Use GLTFLoader.loadAsync for glTF/GLB and configure DRACO, KTX2, or Meshopt for actual extensions. Decoder paths and versions must work under deployment subpaths.
- After loading, check scale, orientation, pivot, bounds, textures, materials, and clips; inspect forms in actual lighting. Successful download is not completion.
- Distinguish loading, ready, empty, and error in UI. LoadingManager completion does not establish that every item succeeded; handle errors separately. Do not invent percentages when total bytes are unknown.
- Rapid switches and unmounts must not let old promises mount stale models. Use sequence/alive guards and cancel where supported. Dispose resources owned by stale results while respecting sharing conventions.
- See [assets.md](assets.md). A working procedural example does not validate external GLB loading, compression, or asynchronous failure paths.

## Picking

- Convert PointerEvent coordinates through canvas.getBoundingClientRect to NDC, then use Raycaster. Do not use full-window coordinates for an embedded canvas.
- Resolve child Mesh hits to domain objects; use instanceId for instances. Filter hidden objects, annotations, and helpers; explicitly decide whether transparent objects intercept selection.
- Track displacement and multi-touch state from press to release to distinguish clicks from orbit dragging. pointercancel, blur, and lost capture end transient state. Hover is not selection.
- Lists, keyboard, and touch use the same select/focus/reset update paths; see [interaction.md](interaction.md).

## Performance, fallbacks, and ownership

- During representative actions, record renderer.info calls, triangles, geometries, textures, and frame intervals; explain multipass accounting. Counts are not VRAM bytes, and rAF intervals are not GPU execution time.
- Identify pixel/overdraw, draw-call, asset-memory, or main-thread bottlenecks before reducing DPR, postprocessing, material count, or introducing instancing, compression, or on-demand rendering. Preserve important outlines and interaction feedback.
- Low quality preserves identity, state, and core actions while reducing nonessential cost. On WebGL creation failure/context loss, keep a static schematic and text, disable inactive 3D actions, and recreate the view or provide a clear refresh path.
- Owners manage their listeners, observers, RAF, controls, mixers, geometries, materials, textures, render targets, and renderer. Stop scheduling and asynchronous callbacks before disposal. scene.remove does not free GPU resources.
- Deduplicate with a Set; release shared assets according to reference ownership. material.dispose does not dispose textures. texture.dispose does not automatically close every shared ImageBitmap; do not close images still used elsewhere.
- Repeat mount/unmount and check for duplicate canvases/listeners/RAF and stable resource use. Internal caches may remain nonzero; zero is not a universal cross-version requirement.

Official references: [cleanup](https://threejs.org/manual/pages/cleanup.html), [color management](https://threejs.org/manual/pages/color-management.html), [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html), [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html).
