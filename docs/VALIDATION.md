# Verification results and limits

Verified on 2026-09-21 with macOS ARM64, Node 26.5.0, Python 3.9, and Chromium `153.0.8010.12`. Examples pin `three@0.186.0` and `@playwright/test@1.63.0`. Browser tests run against the local preview; no production system is involved. Chromium required the normal host permission outside the restricted sandbox.

## English content and packaging

Plugin metadata, skill instructions and references, documentation, example interfaces, accessibility labels, fallback diagrams, and test assertions use English. All 15 tracked screenshots were regenerated from the English pages and visually inspected. The repository text check decodes JSON escapes and HTML entities before checking for remaining CJK characters. No Chinese text remains in the current tracked files or inspected screenshots.

The official plugin and skill validators pass, and 47 internal Markdown links resolve. A scan of 42 current text files, including decoded escapes, found no CJK characters. All four HTML pages declare English and showed no page overflow or checked text clipping at 1440, 390, and 320 px widths. The package exposes one main skill and one remote marketplace entry. Installation through `codex plugin marketplace add https://github.com/HaidongPang/threejs-visuals` followed by `codex plugin add threejs-visuals@threejs-visuals` was exercised successfully. Installation does not establish automatic skill selection or aesthetic quality.

The [source hashes](evidence/source-hashes.json) identify the current example source, browser checks, dependency lockfile, and skill text. Browser checks validate the examples; hashes of skill text do not imply a new independent skill behavior test. [Behavior checks](BEHAVIOR-CHECKS.md) separately document earlier explicit-request exercises and static boundary review.

## Main example: 8 passing tests

Command: `npm test`. All eight tests passed on the English interface.

| Test | Actual path and result |
| --- | --- |
| Desktop interaction | Keyboard expansion to 100%; real hover/click selects the lens; list and model agree; focus follows the selected part during expansion; orbit dragging does not select; reset restores defaults |
| Alternate view and cost | Exterior view; no additional rendering over 350 ms idle; low power retains actions; renderer counts and 60 frame intervals collected |
| Narrow-screen input | 390 × 844, DPR 2 mobile simulation; touch list selection, slider keyboard input, touch rotation toggle, reset; no page overflow or checked text clipping |
| Reduced motion | Selection/focus reaches the target without a transition |
| WebGL creation failure | Injected context creation failure retains the 2D diagram and selectable part descriptions while disabling 3D controls |
| Context loss | Injected `WEBGL_lose_context` hides the canvas, shows the SVG alternative, and preserves part explanations |
| Module failure | Blocking main.js retains the initial diagram and names, reports failure, and disables inactive controls |
| Lifecycle | Three explicit dispose/import cycles on the same DOM: no duplicate canvas, stopped rendering after disposal, and stable resource counts after remount |

There is no build command: examples are plain ES modules. JavaScript syntax checks and actual browser tests were run; lack of a build step is not reported as a successful build.

## Visual inspection

Inspected the main [initial view](evidence/desktop-initial.png), [expanded view](evidence/desktop-expanded.png), [exterior](evidence/desktop-exterior.png), [narrow view](evidence/mobile-expanded.png), [creation fallback](evidence/fallback.png), and [context-loss fallback](evidence/context-loss.png), plus all four section-study and five product-study screenshots.

English labels, part descriptions, controls, and fallback messages are readable in the captured states. Narrow-screen inspection identified a slider focus outline touching the label above and adjacent sentences joining when a line break was hidden. The focus outline was moved inward and an explicit text space restored; affected studies were checked again.

The hollow stepped barrel, curved lenses, and rings remain distinct. Expansion preserves a shared axis and part order. Page text and controls remain separate from the subject. Opaque lens materials favor curvature and structural reading; they do not simulate refraction. These are visual judgments, not user approval of the style or a guarantee of perfect modeling.

## Direction studies

`node examples/directions/section-study/validate.mjs` passed 16 check categories: real rendering, desktop overflow, idle behavior, canvas picking, focus/return, keyboard selection and expansion, axial order, side view, reset, context-loss fallback, reload recovery, narrow overflow, simulated touch, scrolling, and WebGL creation failure. Desktop is 1440 × 1080; mobile simulation is 390 × 844, DPR 1. This script uses SwiftShader. Its sampled scene reports 22 draw calls and 43,778 triangles.

`node examples/directions/product-study/verify.mjs` passed exterior/expanded views, transition reversal, selection, slider input, actual canvas picking, drag discrimination, keyboard view switching, reset, widths of 1440/390/320 px, the touch-mode toggle, reduced motion, context loss, disposal, and idle behavior. Its [report](../examples/directions/product-study/artifacts/browser-report.json) records no page errors and 37 draw calls / 65,280 triangles for the sampled expanded state. The narrow layout checks resize a desktop page; the toggle check does not establish a real touch gesture.

The [comparison page](../examples/directions/index.html) is an additional reading-mode choice, not evidence of two fully developed aesthetic languages. Both directions remain available for user selection.

## Performance and resource ownership

See [performance.json](evidence/performance.json) and [lifecycle.json](evidence/lifecycle.json). The main exterior sample uses approximately 18 draw calls / 43,842 triangles at standard quality and 10 calls / 21,922 triangles with shadows disabled. These counts include rendering work and are not unique model face counts or VRAM bytes.

Frame intervals were sampled after 15 warmup frames during synthetic slider updates. They reflect headless browser scheduling, not GPU execution time or phone frame-rate guarantees. The desktop DPR 1 comparison primarily measures the cost of shadows and does not predict high-DPR mobile improvements.

After disposal, the main example reports geometries=0 and textures=1; remounting returns to the same baseline of 12 geometries and 4 textures. This tests renderer and canvas counts, not a complete heap/GPU-memory profile or a proof of zero leaks.

## Unverified areas

- Safari, Firefox, physical iOS/Android devices, low-end GPUs, and screen readers.
- External GLB assets, DRACO/KTX2 loading, imported animation clips, WebGPU, and external generation services.
- Automatic skill selection reliability, cross-model behavior, and long-term aesthetic convergence. The translated skill has not received a new independent forward test.
- Final user approval of either design direction.
- Optical or manufacturing accuracy; the examples have no physical lens prescription.
- Website deployment or public-directory listing. GitHub publication and remote plugin installation are separate from those actions.
