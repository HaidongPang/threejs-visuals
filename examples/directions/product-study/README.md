# Direction B: Product study

Begin with the complete barrel silhouette, stepped openings, grip texture, and curved front surface. The page stays still until the user expands five parts along their shared assembly axis. This deliberately differs from an interior-first section view.

The assembly is conceptual, not a manufacturable lens or optical prescription. Geometry, colors, curvature, and expanded spacing are illustrative and do not establish optical performance. The page style belongs to this candidate, not the plugin as a whole.

Install development dependencies and run `npm run dev` from the repository, then open:

<http://127.0.0.1:4173/examples/directions/product-study/>

- Exterior and Exploded switch through interruptible transitions; the slider gives direct control over progress.
- Select visible parts or use the five native buttons. List selection expands the assembly so the shell does not conceal internal parts.
- Drag to orbit. Change view provides three keyboard-accessible camera presets. Reset restores exterior, initial view, and no selection.
- Narrow screens scroll by default. Explicitly enable touch rotation when needed; buttons, slider, and reset also work with a keyboard.
- Reduced motion reaches the target state immediately. WebGL failure retains the 2D order and part descriptions.

**Tradeoff:** This direction suits product pages and whole-to-detail exploration. Internal relationships require active expansion; a section is more direct when teaching needs the shell and internal positions visible together.

Uses `three@0.186.0`, with no external assets, paid services, or extra UI/animation framework. See [verification](verification.md).
