# G38 — First-floor corner lounge

Run `npm start` and open http://127.0.0.1:4209/?block=first/g38, or select G38 in the editor header.

H6/H7 normal and wide images show one white two-seat sofa facing two blue armchairs across a nested stone table set. A sofa-corner floor lamp makes five editable objects. The long wood wall meets a solid wood return behind the sofa; only the chair end uses a translucent striated screen. A pale rug and dark access strip lead toward the escalator-side landing. The glass guard is a schematic partial segment, with endpoints needing review.

| Physical object | External identity | Evidence |
| --- | --- | --- |
| White sofa | Seat_H16 / Seat_H15, provisional local slot order | H6 |
| Wood-side blue armchair | Seat_H13 | H7 |
| Access-side blue armchair | Seat_H14 | H7 |
| Nested stone table set | Table_H4 | Both cameras, modeled once |

The long sofa uses ivory-white `#eeeadd`; small chairs use owner-standard blue `#627d86`. The curved upper tabletop faces the chairs and the lower round top sits nearer the sofa. Stone veining, rug pattern, wood grain, lamp profile and exact furniture dimensions remain approximate. Structural cladding and the divider follow Walls / Low walls; a plain estimated ceiling is hidden by default.

Local +X runs from the wood wall toward the open tile strip. +Z runs from the H13/H14 chair pair toward the H15/H16 sofa, which sits at positive Z. The 4.8 × 5.6 m crop and 4.1 m ceiling are visualization estimates. The illustrated first-floor map is a reference, not a dimensioned plan. Original camera map pixels/headings remain intact; global placement and the actual first-floor elevation are unresolved.

The screen stops short of the dark access strip. The solid sofa wall also ends before the landing; the surrounding doorway/column is outside the authored crop. The neighboring white sofa beyond the chair screen, bins, controls, escalator and stair void are excluded pending identity and ownership review. Shared screens, guard extent and neighboring seams require review during composition.

Detection ROIs remain attached to the normal 1920 × 1080 images. Historical annotation resolution is unrecorded; Table_H4 in H6 reaches y=1080 exactly. Do not project these pixels onto wide images or treat them as 3D positions.

The four JSON files are authoritative. Save block updates only `objects.json`, retains a backup and rejects stale revisions. Structural edits use `architecture.json`; preserve physical `g38-...` IDs when correcting seat labels. `npm test` covers correspondence, access, geometry and evidence serving. Owner acceptance of identity, dimensions and architecture remains pending.
