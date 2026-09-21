# Let aesthetics guide modeling

## Use aesthetic intent to guide production

From the brief and host design, identify the audience's question, key objects, visual focus, and intended feeling. Continue when information is sufficient; ask only about gaps that change direction. Turn vague terms such as refined or technical into an intent that guides proportion, silhouette, negative space, materials, light, and operation together.

For an optical assembly, one possible intent is: "Observe a precision instrument: see its complete silhouette first, then actively discover its interior. Keep the image calm, curvature and assembly detail legible, and operation controlled." This supports continuous outlines, meaningful steps and openings, light that reveals curvature, and expansion that preserves the axis. A natural specimen or soft consumer product could take a completely different direction; this is not a universal style.

For substantial work with an unresolved direction, compare a couple of lightweight compositions or silhouettes before developing one. Small changes do not require multiple proposals. Aesthetic tradeoffs are valid when supported by specific visual evidence.

## Turn references into design decisions

For references that materially affect direction, briefly record **observed feature → resulting effect → decision for this work**, with the source, observation method, and limits of applicability. Do not require a full worksheet for every reference.

- Examine primary/secondary volumes, proportions, surface transitions, and negative space; explain what makes the object distinctive.
- Examine subject scale in the frame, reading order, and page whitespace; explain how camera and UI cooperate.
- Examine material boundaries, highlights, dark areas, and contact; explain how they reveal structure or create the chosen feeling.
- Actually experience action discovery, control, and return to the whole; explain how interaction extends the visual intent.

Example: broad continuous highlights with readable dark areas → curvature remains clear without reflections overwhelming the outline → try the relationship between environment bright areas, roughness, and viewing angle in the current scene, then inspect and adjust. Do not infer an exact roughness value from a reference screenshot or prescribe one lighting setup for all work.

Static screenshots support judgments about visible form, apparent materials, and composition. Motion and feel require operation or observation over time. CSS declarations and loaded fonts or animation libraries do not establish the final appearance or interaction quality. Mark unseen behavior as unknown rather than inventing observations.

References can inform structure and judgment without authorizing reuse of models, images, fonts, or code. Preserve the host design system. See [iteration.md](iteration.md) for user choices and continuity.

## Content relationships constrain spatial expression

| Content relationship | Suitable form and spatial expression | Likely misreading |
| --- | --- | --- |
| Physical assembly | Distinct silhouettes, contact faces, holes, sections, and explosion along assembly axes | Arbitrary scattering loses orientation and assembly order |
| Pipes or flow | Paths, cross-sections, valves, direction, and state | Decorative particles imply actual velocity or pressure |
| Linear addresses or time | One continuous axis with intervals and breaks | Stacked blocks imply physical hierarchy or discontinuous space |
| Abstract containment or dependency | Explained containers, links, and grouping; 2D layers when useful | Depth, size, or distance implies nonexistent authority or capacity |
| Product appearance | Characteristic silhouette, scale cues, material regions, and operable parts | Generic blocks suggest technology without identifying the product |

Do not replace every block with a sphere or rounded box merely to avoid blocks. A chassis may be box-shaped; the criteria are object-specific reasoning, proportion, and finished form.

## Aesthetic checks around modeling

1. Inspect the silhouette at the actual page size and camera distance. With labels, textures, and glow subdued, is a physical object's outline still distinctive and appealing? Abstract concepts may retain necessary names; assess whether form and spatial encoding clarify relationships, not whether a viewer can guess a protocol name from its silhouette.
2. Establish overall proportion, surface transitions, negative space, and connections before detail. Functional openings, lens curvature, slots, brackets, and hinges carry more meaning than arbitrary panel lines.
3. Choose methods for the object: revolved sections for axisymmetric parts, extrusion for thick profiles, curves for wires and hoses, BufferGeometry for changing sections/topology, and existing assets for complex industrial or organic objects.
4. Inspect normals, caps, seams, intersections, and thickness. A section should read as deliberate disclosure of the interior, not missing faces. Combined primitives can produce refined objects when the combination has a design rationale.
5. Add detail where it is visible and meaningful in the final image. Screw counts, wear, asymmetry, and visual density are not universal quality metrics.

When depicting an existing physical object, its silhouette, holes, curvature, and proportions are constrained by the real product, CAD, or dimensional evidence. Improve aesthetics through camera, light, material presentation, and information organization. Correct inaccurate geometry against evidence; do not arbitrarily reshape a part to manufacture candidate differences. When the user requests a new product design or concept exploration, distinguish variable geometry from fixed constraints and explain the schematic scope.

Usually address overall proportion and composition before forms/connections, material/light, interaction detail, and page integration. Adapt the order to the main defect. Judge the whole page and core actions; more detail is not a substitute for overall improvement.

## Composition, materials, and lighting

- Compose the model within the actual page. Main focus, controls, and text should form a stable reading order with useful whitespace. Avoid a tiny central subject or controls surrounding it on all sides.
- Perspective supports product observation; orthographic views support dimensional comparison. Camera height, focal length, and object pose shape the silhouette together. Isometric 3D is not the default.
- Materials express structural roles such as metal housing, glass, flexible connections, and state markers. Make highlight width, roughness, and neighboring material differences readable without assigning every part a different saturated color.
- Light reveals curvature, contact, and hierarchy. Establish clear surfaces with key/fill light or environment reflections before choosing postprocessing. Exposure and shadows must not hide defects. Increasing metalness without a reflection environment may simply darken the surface.
- Check transparent layers and backfaces. When transparency obscures structure, use an explicit section, local isolation, or an opaque schematic treatment and explain it.
- Follow host typography, color roles, spacing, and components. Without an existing system, make coherent choices for the current work; the examples' pale backgrounds and accents are not plugin rules.

## Elegance is beauty in use

Users should naturally discover actions, control progress, understand feedback, and return to the whole. Remove jumps, excessive camera travel, ambiguous selection, and scroll capture before decorating unclear behavior with springs, trails, or more animation. Coordinate details panels with model changes; feedback should be quiet but clear.

Finish one representative view and action, inspect real screenshots and operation, then expand. Fix clear silhouette, proportion, composition, or interaction defects before adding content. Record judgments with [verification.md](verification.md); spatial errors and inaccessible actions cannot be offset by strengths elsewhere.
