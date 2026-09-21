# Direction A: Section study

A lightweight comparison candidate prioritizing internal assembly. An orthographic camera, closed half-section geometry, and restrained material differences explain structure. Its pale background and green metal belong to this study, not a plugin-wide theme.

Five parts use thick revolved sections, curved lenses, and hollow rings. Lens centers and edges have distinct thicknesses. Pale cut faces read as deliberate sectioning without floating labels. All parts expand on the X assembly axis. Dimensions, spacing, and curvature are illustrative, **not an optical prescription or manufacturable design**.

Run `npm ci` and `npm run dev` from the repository, then open <http://127.0.0.1:4173/examples/directions/section-study/>. The page uses pinned `three@0.186.0` without external assets or UI frameworks.

Use the slider for manual expansion, click a part or name to select, and focus to inspect detail or return to the whole. Angled and Side switch between depth cues and a view without perspective shortening. Reset restores 24% expansion, the angled view, and no selection. The scene is still by default and renders on demand. Tab reaches controls; arrow keys adjust the slider. Touch retains vertical page scrolling without rotation gestures.

Best for technical articles, structural explanations, and assembly teaching. The section removes half of the shell, so it cannot establish complete exterior appearance. Opaque lenses reveal outlines without simulating glass transmission. Fixed camera modes and manual progress preserve spatial meaning and user control.

With the preview running and Playwright Chromium installed, run:

```sh
node examples/directions/section-study/validate.mjs
```

The 16 check categories cover real WebGL rendering, canvas picking, focus/return, keyboard selection, slider arrows/End, side view, reset, narrow-screen overflow, simulated touch, page scrolling, WebGL creation failure, context-loss fallback, and reload recovery. See the [overall verification report](../../../docs/VALIDATION.md) for run conditions.

Evidence: [initial desktop](desktop-initial.png), [expanded side view](desktop-expanded.png), [narrow expanded view](mobile-expanded.png), and [fallback](fallback.png). At full expansion, narrow-screen framing fits the whole assembly; select and focus a part for detail.

Context-loss checks use `WEBGL_lose_context` and assert the canvas is actually hidden, the fallback SVG is visible, 3D controls are disabled, and part details still work. Reload recreates the view. This simulates the event, not a physical GPU failure.

Renderer counts and idle samples are not hardware frame-rate or GPU-time measurements. Real phones, Safari/Firefox, repeated mount/dispose, host-page integration, and optical accuracy remain unverified. This candidate remains available for review and selection, not finally approved.
