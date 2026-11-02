# G18 — G-zone passage lounge

Run `npm run install:app`, then `npm start` from the repository root. Open http://127.0.0.1:4209/?block=ground/g18 or select **G18 · G-zone passage lounge** in the editor header.

## First editable draft

Four two-seat sofas and six teal armchairs flank a pale stone walkway, with dark stone under the seating. The main group contains 14 seat slots and four coffee tables. Three round side tables, three floor lamps and two plants provide simplified context. The owner removed the two rightmost context tables (Table_G1/G2), leaving 22 editable objects. Those identities belong to G16 and are external references only.

| Stable physical object | Current owner-corrected seat IDs |
| --- | --- |
| g18-sofa-01 | Seat_G19 / Seat_G18 |
| g18-sofa-02 | Seat_G22 / Seat_G21 |
| g18-sofa-03 | Seat_G11 / Seat_G12 |
| g18-sofa-04 | Seat_G14 / Seat_G15 |
| g18-chair-10 | Seat_G17 |
| g18-chair-13 | Seat_G20 |
| g18-chair-16 | Seat_G23 |
| g18-chair-17 | Seat_G10 |
| g18-chair-20 | Seat_G13 |
| g18-chair-23 | Seat_G16 |

The four snapshots were compared with their chair/table ROI overlays and the ground-floor map around all four registered anchors. Repeated observations and reflected furniture are represented only once. Sofa slot ordering, dimensions and chair angles require owner review. G25's Seat_G19 ROI starts at x = -4; the original annotation is preserved as partial edge evidence.

## Architecture and ownership

Local +X crosses the path from the reflective side in G28 toward the curtains in G29. Local +Z runs from Seat_G10/G17 toward Seat_G16/G23. Y is up. The 8.4 × 10.4 m floor is an estimated working crop including context tables; the main seating occupies roughly 8.4 × 7.6 m. The 2.8 m path width and 4.1 m ceiling height are provisional visualization estimates.

Side glazing is schematic: G28 supports the reflective boundary, while the backing behind G29's sheer curtains is inferred. Glass framing is generic. Curtains, patterned lower panels, tabletop ornaments and the table lamp are not reproduced. Partly visible curved surrounds/pier returns in G24/G25 remain unresolved instead of closing the path with guessed walls. Both path ends remain open. Use **Walls**, **Low walls** and **Ceiling** to inspect the shell.

Table_G1/G2 observed in G25 are external references to existing G16 objects. Their provisional context copies were removed per owner instruction.

Wide captures for G24/G25/G28/G29 are now linked; further structural review is pending. Existing ROI pixels apply to the normal 1920 × 1080 images only; they were not interpreted as world coordinates. Registered map points and headings are preserved as evidence. No global transform, metric calibration or accepted neighboring seam is claimed.

## Review and save

Select furniture to move, rotate, resize, change color or correct seat/table IDs. Physical `g18-...` IDs remain stable. **Save block** writes only `objects.json`, retains a backup and rejects stale revisions. The four JSON files are authoritative; structural edits use `architecture.json` directly. See `evidence.json` for the remaining review items and root `CONTRIBUTING.md` for the shared workflow.

Owner row correction supersedes the earlier reflective-side/curtain-side seat assignment: top/bottom identities swap while saved positions and orientations remain unchanged. Physical object IDs remain stable even when their numeric suffix differs from the current seat ID. Original ROIs are preserved as source evidence. Table_G1/G2 context geometry is removed; use G16 owners from evidence.json. Existing crop size is retained. Wide captures are now linked; the older absence statement below/above is superseded.

G16/G18 pair is composed at `/?layout=ground/g16-g18`: G18 trimmed context-table end joins G16 left full-width arch. Source furniture preserved. G18 floor now stops one tile beyond G10 at Z=-4.2; prior 10.4 m context crop is superseded by 8 m length, center [0,-0.2]. White walkways load in the combined view. Width mismatch/outer edge returns remain provisional; see layouts/README.md.
