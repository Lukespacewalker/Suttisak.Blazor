# Header preference icon alignment

The compact color-scheme trigger used a font glyph while language used a 20px SVG. Its visible size and optical baseline changed with the consuming application's font. Replace only the decorative half-circle with a centered 20px SVG whose painted circle matches the globe. Preserve the 44px hit target, accessible name, native popover, keyboard handling and mobile drawer preferences. No public API or catalog change is required.

Acceptance: real header renders must show matching icon frames and vertical centers across light/dark and constrained/desktop layouts. Existing preference interactions and other appearance modes continue to work. Verify shared tests, Playbook browser suite and a consuming Debug build, then publish UI 1.0.32 through the existing CI and explicit package workflow. Update all six consumers' Release UI references after publication; preserve conditional Debug references and unrelated changes. Deployment is outside this follow-up.
