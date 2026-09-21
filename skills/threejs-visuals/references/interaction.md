# Elegance in interaction

Help users discover actions, control the process, understand feedback, and return to the whole. Resolve jumps, accidental selections, irreversible actions, and ambiguous state before adding motion. Choose actions for the task rather than adding controls to fill a feature list.

| State/action | Scene and control behavior | What to check |
| --- | --- | --- |
| Hover | Temporarily reveal a selectable object; restore on exit | Preserve persistent selection; touch must not depend on hover |
| Select/clear | Form/material feedback plus a stable name and details | More than color alone; canvas and list agree; dragging does not select |
| Focus | Frame the object while retaining orientation cues | No clipping; return to the whole; equivalent keyboard access |
| Explode/section | Continuously change presentation along meaningful axes or planes | Preserve identity and order; explain illustrative spacing; allow reversal |
| Reset | Restore the agreed camera, selection, progress, and visibility | Synchronize UI; no stale highlights or unfinished transitions |
| Loading/failure/unavailable | Show status and suitable retry or alternative content | No blank canvas; explain unavailable actions |

## Input and state

- One state source drives UI and scene. Controls express intent rather than maintaining independent selection or expansion state.
- Pointer Events track pointer ID, origin, and displacement. Handle up, cancel, lostpointercapture, blur, and visibilitychange. Lifting the final finger after a multi-touch gesture must not become a selection.
- Hover previews; selection confirms. Details and camera should not jump around on hover.
- Use native button, range, and select elements with visible focus. Provide an object list or equivalent keyboard path; Enter/Space selects, and arrow keys control sliders. Shortcuts apply only when the component owns focus and do not interfere with text fields.
- Do not casually give a canvas role=application. Provide a name, instructions, and an alternative structure. Use aria-live for meaningful confirmations, not every frame or hover.
- Preserve page scrolling on touch. Scope touch-action to the gesture surface. On narrow screens, use an explicit interaction area or an enable-3D-control toggle rather than capturing the entire page.
- Approximately 44 CSS px is a touch target design goal; follow host conventions. Simulated touch is not hardware testing.

## Labels and page layout

- Project world anchors into canvas-local coordinates. Handle points behind the camera, outside the frustum, occlusion, overlap, and edge clipping. Hide secondary labels or move explanations into a stable side/bottom panel.
- Labels support understanding without becoming the only identity of every form. Avoid showing all labels permanently; a DOM list may work better on narrow screens.
- Keep primary controls clear of the subject and its changed bounds. Use page tokens for sizing and typography; adapt the camera and layout together.
- Test long names, larger text, narrow screens, landscape, and safe areas. Details must not repeatedly displace controls; fixed heights must not clip body text.
- Motion explains transitions and supports interruption. Reduced motion reaches the destination directly while manual progress remains available. Stay still unless autoplay is requested.

## Verify real actions

Check relevant normal paths, cancellation, reset, rapid repeats, and failure states. Setting selection through a debug API only proves assignment, not picking or input. Screenshots establish layout and appearance; real operation establishes cause and feel. Both are needed.
