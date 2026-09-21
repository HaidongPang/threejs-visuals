# Product study verification

This candidate is available for comparison and has not been selected as a final design. Verification date: 2026-09-21.

## Browser checks

The browser script covers:

- Real rendering with local `three@0.186.0` and Chromium, with JavaScript errors collected.
- Desktop and narrow-screen exterior/expanded screenshots, continuous silhouette, openings, grip texture, and readable part separation.
- Expansion, exterior, reversing an in-progress transition, and reset through actual controls.
- Keyboard part selection, slider input, and camera presets; actual canvas selection of the front lens; orbit dragging without accidental selection.
- Horizontal page overflow at 1440, 390, and 320 px; default touch scrolling and an explicit rotation toggle.
- Reduced-motion completion, injected context loss with visible fallback and usable details, and canvas removal on dispose.
- Idle render-count stability over 350 ms and renderer statistics. Counts do not represent device frame rate, power, or GPU execution time.

Run with Playwright Chromium installed and the preview server on port 4173:

```sh
node examples/directions/product-study/verify.mjs
```

Report: [browser-report.json](artifacts/browser-report.json). Screenshots: [desktop exterior](artifacts/desktop-exterior.png), [desktop expanded](artifacts/desktop-expanded.png), [narrow exterior](artifacts/mobile-exterior.png), [narrow expanded](artifacts/mobile-expanded.png), [2D fallback](artifacts/fallback.png). Current run results and image inspection are recorded in the [overall report](../../../docs/VALIDATION.md).

## Limits

- No final user approval of the visual or interaction direction.
- No real-phone, Safari, Firefox, low-power GPU, or screen-reader testing.
- No long-duration resource profile, repeated mount/unmount test for this candidate, or complete network failure test.
- No engineering basis for dimensions, tolerances, lens prescription, or imaging performance.
