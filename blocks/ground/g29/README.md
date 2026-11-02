# G29 — G-zone window lounge

Run `npm run install:app` if dependencies are missing, then `npm start` from the repository root. Open http://127.0.0.1:4209/?block=ground/g29 or select G29 in the editor header.

## Editable draft

G16 and G17 show three light two-seat sofas around one pale coffee table. The two cameras share Seat_G92/G93 and Table_G27 observations; each physical object appears once. Six ROI seat labels map to three sofas:

| Object | Seat labels | Primary view |
| --- | --- | --- |
| Panel-side sofa | Seat_G90 / Seat_G91 | G17 |
| Curtain-side sofa | Seat_G92 / Seat_G93 | G16, G17 |
| Opposite sofa | Seat_G94 / Seat_G95 | G16 |
| Coffee table | Table_G27 | G16, G17 |

Three side/display tables, one plant and one floor lamp are simplified selectable context. Their correspondence and exact positions need review. The coffee table uses the shared builder's square-top option; its surface and legs remain approximate. Curtains, cushions, tile joints, vases, decorative panel relief and exact glass framing are not reproduced.

## Architecture and limits

The normal G16/G17 snapshots and their original chair/table ROIs support furniture identity. Both wide captures show the curtains, window edges, plant/lamp corner and decorative panel/pier. The owner confirms that the wall behind G92/G93 is 30% solid from the G92 end and 70% window, the boundary behind G94/G95 is 20% solid toward the right-side pier and 80% window, and the wall behind G90/G91 is completely solid. The percentages set provisional segment lengths; exact dimensions remain to be measured. Normal ROI pixels do not apply to the wide views.

Local +X points toward the curtained glazing, local +Z runs from Seat_G90/G91 toward Seat_G94/G95, and Y is up. The floor is a 4.1 × 5 m working crop, trimmed on local −X to remove the empty strip while retaining the edited furniture positions. The adjoining solid wall and window run end at the new edge; the 20/80 split remains proportional. Wall heights, the floor extent and the 4.1 m ceiling are provisional estimates. Decorative panel detail and the neighboring bay's seam remain unresolved. Map anchors are retained without a fitted global transform or metric calibration.

The four JSON files are authoritative. **Save block** persists only `objects.json`, retaining a backup and checking revision conflicts. Structural changes belong in `architecture.json`. Review top and isometric views, the two camera perspectives, sofa slot order, floor placement and neighboring seam before accepting the block. Run `npm test` for repository validation and follow the root [CONTRIBUTING.md](../../../CONTRIBUTING.md) for handoff.
