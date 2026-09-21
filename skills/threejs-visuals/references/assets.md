# Asset selection and integration

## Let visual intent guide the source

- **Procedural:** Parameterized structures, assembly diagrams, regular cross-sections, and data-driven forms. Useful for explainable dimensions and changes; do not reduce a distinctive object to generic blocks for convenience.
- **Existing models/materials:** Check project and user assets first. Useful for complex products, organic structures, or objects requiring faithful features.
- **External generation:** Use only when the task needs it, tools are available, and authorization covers it. This is optional; use suitable procedural or existing assets when no service is available.

Complete modeling/import, materials, lighting, and interaction for one representative part. Inspect the actual result before expanding in bulk.

## Provenance and inspection

For each external asset, record its path, source, license, attribution requirements, purpose, changes, and version/hash. Check models, textures, and fonts separately; a repository LICENSE does not establish one license for every asset. Do not bundle assets in the plugin or public repository without established redistribution rights.

Check units, up/forward axes, pivot, bounds, naming, triangle/mesh/material/texture counts, animations, and compression extensions. Add picking proxies only for a concrete input or performance need; do not import a game collision framework.

## Optional generation services

Concept reference → a few assets → silhouette and topology inspection → scale and material adjustment → actual scene lighting → browser inspection. A generator preview does not establish integration quality.

Keep credentials out of the browser and repository. External uploads and paid jobs follow user authorization; ask only about missing authorization for the specific action and continue independent work. Record accepted job IDs and check status after timeouts before resubmitting a paid job. Bound retries, then report the limit and choose an alternative.

This plugin does not bundle vendor SDKs, probe for secrets, automatically start paid jobs.
