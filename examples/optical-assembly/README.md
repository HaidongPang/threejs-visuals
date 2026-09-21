# Explorable optical assembly

This example exercises the cycle of designing forms and relationships, building a representative experience, inspecting actual images, refining, and verifying. It does not prescribe a plugin-wide style.

A pale editorial canvas and muted surfaces emphasize curves and openings. Five parts share an axis: a stepped hollow barrel, two biconvex lenses, a spacer, and a retainer with distinct openings and thicknesses. Initial spacing is 35% for legibility. This is a conceptual assembly, not an optical prescription; opaque lenses reveal curvature without simulating refraction.

From a repository working copy, run `npm ci` and `npm run dev`, then open the [local example](http://127.0.0.1:4173/examples/optical-assembly/). No build, React, GSAP, external models, or generation service is needed.

- Select through the model or part list. Focus frames the selected part; clearing selection retains the current camera.
- Expand along one axis with the slider, preserving order and coordinates. Arrow keys, Home, and End work with the native range input.
- Cutaway and Exterior offer different views. Reset restores the cutaway, 35% spacing, initial camera, and no selection; quality and touch preferences remain.
- Drag to orbit and scroll to zoom on desktop. Narrow screens allow page scrolling until touch rotation is explicitly enabled; rotation and pinch zoom then become available.
- Rendering is on demand. Short focus/reset transitions respect reduced motion and can be interrupted.
- Low power reduces DPR and disables shadows. WebGL unavailability or context loss retains the 2D diagram and part details.

The fallback SVG uses the same parts and order as the 3D scene. Module load failure retains the static diagram and names while disabling inactive controls.

The explicit `?qa` parameter enables diagnostics for measurement, fault injection, and disposal checks. Functional tests use actual controls, mouse, and keyboard. See the [verification report](../../docs/VALIDATION.md) for results and limits.
