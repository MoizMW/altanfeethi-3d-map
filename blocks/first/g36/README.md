# G36 — First-floor escalator lounge

Run `npm start` and open http://127.0.0.1:4209/?block=first/g36, or select G36 in the editor header.

H3 and H8 normal and wide captures show a white two-seat sofa facing two blue armchairs. One nested stone table set, with a curved upper top and lower round top on brass drums, carries the single shared Table_H2 identity. A floor lamp makes five editable objects. Wood paneling, two translucent striated end screens, a pale rug and a low escalator-side glass balustrade provide context. Structural finishes follow Walls / Low walls controls.

| Physical furniture | External identity | Main evidence |
| --- | --- | --- |
| White sofa | Seat_H8 / Seat_H7, provisional local slot order | H8; opposite edge in H3-wide |
| Wood-side blue armchair | Seat_H5 | H3 |
| Railing-side blue armchair | Seat_H6 | H3 |
| Nested table set | Table_H2 | H3 and H8, reconciled once |

Small chairs use owner-standard blue `#627d86`; the long sofa uses ivory-white `#eeeadd`. The shared nested-table and structural finishes are procedural approximations. Marble veins, rug pattern, wood grain, chair contours, divider material and exact dimensions need review.

Local +X runs from the wood wall toward the escalator-side railing. +Z runs from the chair pair toward the white sofa, consistent with the orientation review requested for G35. The 4.8 × 5.6 m crop and 4.1 m visualization ceiling are estimated. Local floor Y=0 does not establish a measured first-floor elevation. Original map pixels/headings remain evidence; they are not a fitted world transform. Global placement and shared end-screen ownership remain unresolved until the owner-guided merge.

The dark strip beside the rug stays clear. End screens stop short of the strip, leaving access gaps. The escalator, stair void, lower-floor scene, bins and the partly visible plant beyond the chair-side divider are outside this core. The crop is not a measured room boundary.

Both normal and wide camera pairs were reviewed alongside the first-floor map. ROIs remain attached to normal 1920 × 1080 snapshots, with historical authoring resolution unrecorded. Do not reuse their coordinates on wide images or treat them as world positions. Table_H2 in H3 reaches y=1078 and remains unchanged.

The four JSON files are authoritative. Furniture edits save only `objects.json` with backups and revision checks; structural edits use `architecture.json`. Keep stable physical `g36-...` IDs when correcting seat labels. Run `npm test` before sharing. Owner acceptance of correspondence, dimensions and architecture remains pending.
