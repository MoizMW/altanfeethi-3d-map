# G28 — G-zone shelf lounge

Run `npm start` from the repository root and open http://127.0.0.1:4209/?block=ground/g28, or choose G28 in the header. Install dependencies with `npm run install:app` if needed.

## Editable draft

G11/G15/G18/G19 normal and wide views support two two-seat sofas on the reflective side and nine armchairs across both banks. Seating follows the owner-provided visual reference: ivory-white long sofas (`#eeeadd`) and blue small armchairs (`#527e86`), using local base-color overrides on the shared upholstery builders. Four main coffee tables, one tall shelf divider, three round side tables, one raised plant and two floor lamps bring the total to 22 editable objects. The shared builders approximate the furniture and finishes.

| Physical furniture | ROI identities | Sources |
| --- | --- | --- |
| Reflective-side near sofa | Seat_G78 / Seat_G77 | G11, G15, G18 |
| Reflective-side far sofa | Seat_G82 / Seat_G81 | G11, G15 |
| Reflective-side armchairs | Seat_G76 / Seat_G79 / Seat_G83 | G11, G15, G18 as recorded per object |
| Curtain-side six armchairs | Seat_G84–Seat_G89 | G19, with G11/G18 overlap |
| Main coffee tables | Table_G23–Table_G26 | All four cameras as recorded per object |
| Background observation outside crop | Table_G27 | G11 |

All 13 distinct annotated seat slots appear once. Seat_G80 is absent from the supplied group annotations. Reflected furniture is excluded. Table_G27 and its surrounding unlabelled sofas are beyond the core; their ownership is unresolved and they are retained as evidence rather than added to this block's inventory. Sofa slot order and exact chair orientation need owner review.

## Architecture and coordinates

Local +X crosses the pale path from the reflective sofa bank in G15 to the curtained chair bank in G19. +Z runs from Seat_G76/G84 toward Seat_G83/G89; Y is up. The 8.4 × 7.6 m working crop, 2.8 m path width and 4.1 m ceiling are visualization estimates. Both path ends remain clear within the crop; the background end lounge means this is not a claim that the path continues through the building.

Schematic glazing represents the reflective backing and the windows behind the curtains. Wide G15/G19 show curved pale side-bay surrounds and piers; their exact profiles, spans and ownership remain unresolved. The crop rectangle is not a measured room boundary. Curtains, patterned film, accurate reflections, tabletop lamps, vases and ring ornaments are omitted. Use Walls / Low walls / Ceiling and the four wide evidence buttons for review.

Normal and wide captures were inspected separately. Detection ROIs belong only to the normal 1920 × 1080 snapshots; historical annotation resolution is unrecorded. ROI pixels were not used as world coordinates. Camera map anchors/headings are preserved from the registration revision without copying heading degrees into world yaw. Map basis, metric calibration and neighboring seams remain unresolved.

## Review and save

Move, rotate, resize and recolor furniture in the editor. Seat and table labels are editable while physical `g28-...` IDs stay stable. Save block writes only `objects.json`, keeps a backup and rejects stale revisions. Structural edits use `architecture.json` directly. The four JSON files are authoritative; see `evidence.json` for review items and root `CONTRIBUTING.md` for merge rules.

Run `npm test` and `node --test blocks/ground/g28/validate.test.mjs` before handoff. Rendered top/isometric inspection and human furniture/architecture acceptance remain pending.
