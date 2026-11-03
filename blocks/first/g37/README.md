# G37 — First-floor escalator lounge

Run `npm start` and open http://127.0.0.1:4209/?block=first/g37, or select G37 in the header.

H4/H5 normal and wide views support one white two-seat sofa facing two blue armchairs. One nested stone coffee-table set carries Table_H3 across both views. A chair-side floor lamp makes five editable objects. The wood wall, two striated decorative screens, pale rug and low escalator-side glass balustrade use the shared structural builders and follow Walls / Low walls controls.

| Physical object | External identity | Main evidence |
| --- | --- | --- |
| White sofa | Seat_H10 / Seat_H9, provisional local slot order | H5; H4 opposite edge |
| Wood-side blue armchair | Seat_H11 | H4 |
| Railing-side blue armchair | Seat_H12 | H4 |
| Nested table set | Table_H3 | H4 and H5, reconciled once |

Long sofa upholstery is ivory-white `#eeeadd`; small chairs use owner-standard blue `#627d86`. Unlike G36, the lamp is beside the chair pair, and the nested table's round lower top is toward the chairs. Table shape, supports, furniture dimensions, rug pattern, wood grain and stone veining are schematic.

Local +X runs from the wood wall toward the railing. +Z runs from H11/H12 toward the H9/H10 sofa, which is at positive Z. The estimated crop is 4.8 × 5.6 m, with a 4.1 m visualization ceiling. The dark access strip remains clear; both decorative screens stop before it. The stair/escalator, void, lower-floor scene and bins are excluded. Screen ownership and neighboring seams need review before merging. Shared dimensions are working estimates rather than measured equality with G36.

The first-floor map and original registered anchors are preserved as evidence. No map-to-world calibration, global placement or floor stacking elevation is assigned. Detection ROIs remain attached to the normal 1920 × 1080 snapshots, with historical authoring resolution unrecorded. They are not reused on wide views or converted directly into 3D positions.

The four JSON files are authoritative. Save block writes furniture to `objects.json`, keeps backups and rejects stale revisions. Structural edits use `architecture.json`. Physical `g37-...` IDs remain stable when seat/table labels are corrected. Run `npm test` before handoff; owner correspondence and dimensional acceptance remain pending.
