---
name: threejs-visuals
description: "Design, refine, and review non-game Three.js scenes: explorable models, technical illustrations, product visuals, and their interaction."
---

# Three.js Visuals

**Beauty and elegant interaction come first. Aesthetic decisions guide modeling; Three.js realizes the design.** Preserve accurate technical relationships. Working features alone do not establish a finished result.

## Start with the task

| Task | Starting point | Read as needed |
| --- | --- | --- |
| Create a scene | Understand needs, find community inspiration, agree on a design language, and build a representative slice | [Iteration and choices](references/iteration.md), [visual design](references/visual-design.md) |
| Improve visuals | Inspect actual images, identify specific defects, and preserve the chosen direction | [Visual design](references/visual-design.md); [iteration](references/iteration.md) if direction is unresolved |
| Refine interaction | Identify affected actions and states; improve discovery, control, feedback, and return | [Interaction](references/interaction.md) |
| Review existing work | Inspect implementation, images, and operation; report issues by impact without editing | [Verification](references/verification.md) |

Use relevant sections of [engineering](references/threejs-engineering.md) for Three.js implementation and [assets](references/assets.md) when selecting or importing resources. A local correction does not restart the full design process.

## Shape the work

- For new scenes or directions, understand audience, object relationships, visual focus, actions, and the host page before seeking inspiration. Open strong related work and turn actual observations into concrete design decisions. Retain references; disclose unavailable evidence.
- If the design language is unspecified, agree on it through clear choices. Consequential appearance or interaction alternatives need reviewable demos, usually two or three, with actual images, working actions, tradeoffs, and a recommendation.
- Prefer parallel subagents for independent candidates. Give them shared constraints, distinct directions, and separate file ownership; tell them not to overwrite others. Personally inspect and operate the candidates before presenting. Work sequentially when delegation is unavailable.
- Refine one representative scene before expanding. Address visible defects, compare meaningful changes, and retain user choices. Wait for unresolved direction decisions after preparing the demos; continue routine corrections within an agreed direction without per-step approval.

## Keep design meaningful

Derive forms from object characteristics rather than interchangeable blocks, floating slabs, and labels. Rounded corners, shadows, and glow cannot replace silhouette, proportion, and composition. Real box-shaped objects may remain box-shaped; refinement does not require more detail.

Space and motion carry meaning: preserve axes, identity, order, and known geometry; disclose schematic exaggeration. A linear address space must not imply physical stacked layers. Suggest a better representation when 3D does not help, respecting the user's delivery choice.

Follow the host design system, stack, and actual Three.js version. Examples are not style defaults. Procedural modeling, existing assets, and optional generation are valid choices without mandatory frameworks or paid services.

Educational scenes start still and advance through user input. Controls, labels, and models share state; core actions are discoverable, reversible, and reachable with relevant keyboard/touch paths. Respect responsive layout and reduced motion.

## Finish the requested work

Deliver the chosen direction with representative and affected states actually viewed and operated, obvious aesthetic/experience defects fixed, and relevant engineering checks complete. Scope [verification](references/verification.md) to the change; compilation or screenshot counts cannot replace judgment.

Provide files, a runnable entry, inspected views and inputs, and remaining gaps. Mark unresolved choices as pending. Perfection is an iterative goal, not a subjective score guarantee. Continue feasible work when browser access is missing, clearly marking visual/interaction behavior unverified.
