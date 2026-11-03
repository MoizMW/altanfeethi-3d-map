# G35 — First-floor escalator lounge

Run `npm start` from the project root and open http://127.0.0.1:4209/?block=first/g35. G35 also appears in the editor's block selector.

H1 and H2 normal and wide captures show one white two-seat sofa opposite two blue armchairs beside the escalator balustrade. The nested stone coffee-table set is one selectable object, with a curved upper top and a round lower top on brass drums. One lamp and one plant make six editable objects. Wood cladding belongs to the structural walls and follows the low-wall cutaway control.

| Physical object | External identity | Evidence |
| --- | --- | --- |
| White sofa | Seat_H1 / Seat_H2 | H2 labels both slots; slot order follows the reflected local orientation |
| Wood-side blue armchair | Seat_H3 | H1 |
| Railing-side blue armchair | Seat_H4 | H1 |
| Nested coffee-table set | Table_H1 | Both cameras, reconciled once |

The owner requested a vertical plan flip for the group's eventual far upper-right position in the first-floor composition. Local +X runs from the railing toward the long wood wall; +Z now runs from the chair pair toward the sofa. Y remains up. The original layout was reflected across local Z=0, including furniture, wall endpoints, rug and access strip. Facing directions and sofa slot order follow that reflection. This sets the block orientation; global composition placement is still pending.

All dimensions are estimates: the working crop is 4.8 × 5.6 m and the visualization ceiling is 4.1 m. Local floor zero is independent of first-floor building elevation, which remains unresolved. Registered map pixels and headings are retained without deriving world yaw or claiming survey calibration.

The pale rug, wood walls, decorative translucent divider and low glass balustrade follow the photos. Rug texture, marble veining, wood grain, exact chair/table profiles and vertical screen strands are simplified. The glass divider is a schematic interpretation, not a confirmed exterior window. The dark access strip stays clear beside the rug. The escalator, stair void, adjacent seating and floor below are outside this block's geometry; exact boundary ownership and neighboring seams remain unresolved.

All four images were reviewed. Detection ROIs apply only to the normal 1920 × 1080 snapshots, with historical annotation resolution unrecorded. Do not reuse their pixels on wide captures or as 3D coordinates. Sofa slot order and correspondence require owner review.

The four JSON files are authoritative. Furniture edits save only `objects.json`, with backups and revision checks; structural edits use `architecture.json`. Use Walls / Low walls / Ceiling and the normal/wide evidence buttons for review.

`npm test` includes G35's ROI reconciliation, table geometry, access, registration, and server checks. Browser rendering is checked separately; owner acceptance and exact dimensions remain pending. Follow root `CONTRIBUTING.md` before handoff.
