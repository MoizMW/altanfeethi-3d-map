# G18 — G-zone passage lounge

Run `npm run install:app`, then `npm start` from the repository root. Open http://127.0.0.1:4209/?block=ground/g18 or select **G18 · G-zone passage lounge** in the editor header.

## First editable draft

Four two-seat sofas and six teal armchairs flank a pale stone walkway, with dark stone under the seating. The main group contains 14 seat slots and four coffee tables. Three round side tables, three floor lamps and two plants provide simplified context. Two additional tables visible beyond the core in G25 bring the total to 24 editable objects.

| Physical furniture | ROI identities | Main evidence |
| --- | --- | --- |
| Reflective-side near sofa | Seat_G11 / Seat_G12 | G25, G28 |
| Reflective-side far sofa | Seat_G14 / Seat_G15 | G24, G28 |
| Reflective-side armchairs | Seat_G10 / Seat_G13 / Seat_G16 | G24, G25, G28 |
| Curtain-side near sofa | Seat_G18 / Seat_G19 | G25, G29 |
| Curtain-side far sofa | Seat_G21 / Seat_G22 | G24, G29 |
| Curtain-side armchairs | Seat_G17 / Seat_G20 / Seat_G23 | G24, G25, G29 |
| Four main coffee tables | Table_G3–Table_G6 | G24–G29, as recorded per object |
| Two provisional context tables | Table_G1 / Table_G2 | G25 only |

The four snapshots were compared with their chair/table ROI overlays and the ground-floor map around all four registered anchors. Repeated observations and reflected furniture are represented only once. Sofa slot ordering, dimensions and chair angles require owner review. G25's Seat_G19 ROI starts at x = -4; the original annotation is preserved as partial edge evidence.

## Architecture and ownership

Local +X crosses the path from the reflective side in G28 toward the curtains in G29. Local +Z runs from Seat_G10/G17 toward Seat_G16/G23. Y is up. The 8.4 × 10.4 m floor is an estimated working crop including context tables; the main seating occupies roughly 8.4 × 7.6 m. The 2.8 m path width and 4.1 m ceiling height are provisional visualization estimates.

Side glazing is schematic: G28 supports the reflective boundary, while the backing behind G29's sheer curtains is inferred. Glass framing is generic. Curtains, patterned lower panels, tabletop ornaments and the table lamp are not reproduced. Partly visible curved surrounds/pier returns in G24/G25 remain unresolved instead of closing the path with guessed walls. Both path ends remain open. Use **Walls**, **Low walls** and **Ceiling** to inspect the shell.

Table_G1/G2 sit beyond the main group in G25. Their records explicitly mark provisional context and unresolved neighboring ownership. Their positions are estimates, Table_G2's rectangular top is approximated by the existing oval builder, and the associated background seating is excluded because its identities/boundary are not established. Transfer the stable physical object IDs if a neighboring block takes ownership; do not duplicate the tables.

No wide captures exist for G24/G25/G28/G29 in the supplied folder. Existing ROI pixels apply to the normal 1920 × 1080 images only; they were not interpreted as world coordinates. Registered map points and headings are preserved as evidence. No global transform, metric calibration or accepted neighboring seam is claimed.

## Review and save

Select furniture to move, rotate, resize, change color or correct seat/table IDs. Physical `g18-...` IDs remain stable. **Save block** writes only `objects.json`, retains a backup and rejects stale revisions. The four JSON files are authoritative; structural edits use `architecture.json` directly. See `evidence.json` for the remaining review items and root `CONTRIBUTING.md` for the shared workflow.
