# G27 — G-zone mixed seating lounge

Run `npm start` and open http://127.0.0.1:4209/?block=ground/g27, or choose **G27 · G-zone mixed seating lounge** in the editor header. Install dependencies with `npm run install:app` if needed.

## First editable draft

Six individual upholstered chairs line the reflective side: four low chairs in two pairs and two angled end chairs. Across the pale walkway, two two-seat sofas and three armchairs sit against the curtained window. **All 13 seat labels are mapped once**, without temporary IDs. Four main coffee tables, display shelving, three round side tables, a square plant stand, three floor lamps and three plants bring the total to 26 editable objects.

| Physical furniture | ROI identities | Evidence |
| --- | --- | --- |
| Four central reflective-side chairs | Seat_G64–Seat_G67 | G13 |
| Two angled end chairs | Seat_G63 / Seat_G68 | G12, G13, G6 |
| Curtain-side near sofa | Seat_G70 / Seat_G71 | G14 |
| Curtain-side far sofa | Seat_G73 / Seat_G74 | G14, G6 |
| Three curtain-side armchairs | Seat_G69 / Seat_G72 / Seat_G75 | G12, G14, G6 |
| Main coffee tables | Table_G19–Table_G22 | G6, G12, G13, G14 |
| Background observation only | Table_G16, candidate group g22 | G12 and bundled g22 ROIs |
| Background observations only | Table_G23 / Table_G25, candidate group g28 | G6 and bundled g28 ROIs |

The four normal snapshots were compared with their chair/table ROI overlays and the ground-floor map around the registered camera points. Reflected seats and repeated camera observations are not additional furniture. G12's Table_G21 ROI starts at x = -4; preserve this original partial-edge annotation. Historical ROI authoring resolution is unrecorded. No ROI pixel position was interpreted as a world coordinate.

## Neighboring evidence

Table_G16 is also recorded in g22's ROI files, while Table_G23/G25 appear in g28's files. G27 records those labels under `evidence.deferredObservations`, with corroborating project-relative paths. These background tables are not instantiated or owned by G27. Confirm their ownership and correspondence when the neighboring blocks are built; no global seam transform is implied.

## Coordinates and architecture

Local +X crosses the walkway from G13's reflective chair bank toward G14's curtained sofa bank. Local +Z runs from Seat_G63/G69 toward Seat_G68/G75; Y is up. The 8.4 × 9.6 m working crop, 2.8 m path and 4.1 m ceiling are unmeasured estimates. All furniture dimensions and local transforms also require review. Registered camera points, headings and registration revision/hash remain evidence; no fitted floor transform or calibrated camera yaw is claimed.

The pale path and dark seating strips follow G6/G12. Side glazing uses the shared schematic builder. Curtain fabric, patterned lower panels, accurate reflections and partly visible curved surrounds/pier returns remain unresolved. Both ends of the path stay open. No wide captures exist for G6/G12/G13/G14 in the supplied folder.

## Shared appearance and review

Uses the existing lounge furniture, open-shelving, rectangular-table, lamp and plant builders. Four central chairs have photo-supported separate upholstered shells, represented by the shared lounge approximation; exact curves, cushion colors and fabric patterns are not reproduced. The tall organic display unit uses simplified open shelves. The central plant rests on its square stand; two floor plants provide end context. Exact shelf contours, tier count, books, artifacts, small stand/bin and decorative details are excluded.

Review sofa slot order, chair yaw, plant correspondence, dimensions, architecture and neighboring seams before acceptance. Move, rotate, resize, recolor or correct seat/table IDs in the editor while keeping physical `g27-...` IDs stable. **Save block** writes only `objects.json`, retains backups and checks the base revision; structural edits use `architecture.json`. See `evidence.json` for remaining review items and root `CONTRIBUTING.md` for handoff rules.
