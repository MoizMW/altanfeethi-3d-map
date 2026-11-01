# G11 — C-zone lounge

Side-wall detail update: C3-wide camera-left uses dark reflective paneling and metal trim; camera-right uses teal/gold cladding and a projecting pale pier at the glazing end. Two selectable floor lamps and two selectable slim display consoles with simplified ornaments are included (17 furniture/context objects total). Relief depths, pattern, artifact shapes and spacing are estimates. Plain wall planes remain the structural backing; detailed finishes follow Walls/Low walls visibility. Lamps do not add extra scene lighting. Prior furniture records are retained exactly.

## Architecture from wide captures and owner description

The shell now uses `evidence/wide capture snapshots/C1.jpg`, `C2.jpg` and `C3.jpg`, captured from the same mounts with wider zoom. Front glass is local +X behind Seat_C4/C8, with closed side walls at ±Z. The access side is local -X behind the owner-corrected Seat_C1/C5. Two rounded passages around a central pier are an estimated interpretation of those views. Opening shape, pier/room extent, wall height/thickness and glass framing require review.

Architecture is stored independently in `architecture.json`; furniture edits are retained. The viewer supports **Walls**, **Low walls** (default), and **Ceiling** (off by default). Full walls show rounded passage profiles; the estimated plain ceiling uses 4.1 m. Wall segments are maintained in architecture JSON, rather than the furniture transform controls. Wide camera buttons are architectural evidence; existing detection ROIs apply only to the original snapshots.

The later architecture notes supersede the original exclusions below. Decorative cladding, exact wall curvature, ceiling fixtures and floor calibration remain unresolved.

Open `http://127.0.0.1:4209/?block=ground/g11`, or choose G11 in the editor header after running `npm start`.

## Reconstructed draft

Two back-to-back two-seat sofas, four blue armchairs and two pale oval coffee tables share one dark open shelving divider. Two potted plants and two round side tables provide simplified context: 13 editable objects, eight seat IDs. The floor is an estimated 6 × 7.2 m working crop; height uses the existing 4.1 m ceiling estimate.

| Physical object | External identity | Main evidence |
| --- | --- | --- |
| Armchair 1 | Seat_C1 | C1 |
| Sofa 1 | Seat_C2 / Seat_C3 | C1, C3 |
| Armchair 4 | Seat_C4 | C3 |
| Armchair 5 | Seat_C5 | C2 |
| Sofa 2 | Seat_C6 / Seat_C7 | C2, C3 |
| Armchair 8 | Seat_C8 | C3 |
| Coffee table 1 | Table_C1 | C1, C2, C3 |
| Coffee table 2 | Table_C2 | C1, C2, C3 |

ROIs are bundled in `evidence/rois/chair-rois/g11/` and `evidence/rois/table-rois/g11/`. Their labels support cross-view correspondence; they are not world coordinates. Left/right sofa seat correspondence and exact chair orientation need human review. Furniture IDs stay stable when occupancy IDs are corrected.

The C1/C2 views show opposite clusters. C3 shows both sides across the divider, helping resolve repeated seats and tables. One tall column-side plant is retained until its correspondence across C1/C2 can be confirmed. Round side tables have no external table ROI identity.

## Shared appearance and limits

Uses the existing G9 lounge builders and material colors under `MATERIAL_GUIDE.md`: beige upholstery, blue armchairs, pale stone tables, green plants and dark stone flooring. The shared screen builder adds an `open-shelving` variant with dark shelves instead of brass lattice. This is procedural draft detail; patterned cushion fabric and marble veins are not photographic textures yet.

Local +X follows the sofa backs/shelving. +Z crosses the divider toward the Table_C1 side, +Y is up. Global alignment is unresolved; registered camera coordinates and headings remain recorded as evidence. No heading was copied directly into world yaw.

Glazing, floor lamps, columns and neighboring seats are excluded until structural ownership and boundaries are reviewed. Dimensions, foliage and shelf ornaments are estimates. The floor rectangle is not a measured room boundary.

Move, rotate, resize and scale each object in the editor. Armchair IDs and each sofa slot ID are editable there. Tables expose an optional table ID, saved as `externalId`. Apply adjustment, then Save block to persist edits. Human-reviewed IDs in `objects.json` supersede the original correspondence table above; the owner has corrected the C5/C8 armchair assignment. Follow `CONTRIBUTING.md` for sharing and merges.
