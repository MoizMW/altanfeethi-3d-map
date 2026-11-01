# G20 — G-zone passage lounge

Run `npm start` from the repository root and open http://127.0.0.1:4209/?block=ground/g20, or select **G20 · G-zone passage lounge** in the editor header. Install dependencies with `npm run install:app` if needed.

## First editable draft

Four two-seat sofas and six teal armchairs flank a pale walkway between dark stone seating strips. Four main coffee tables, four round side tables, three floor lamps and three plants bring the draft to 24 editable objects. Two plant pots sit on the central side tables, as visible in G21/G22.

| Physical furniture | ROI identities | Main evidence |
| --- | --- | --- |
| Reflective-side near sofa | Seat_G25 / Seat_G26 | G22 |
| Reflective-side far sofa | Seat_G28 / Seat_G29 | G22, G27 |
| Reflective-side armchairs | Seat_G24 / Seat_G27 / Seat_G30 | G22, G26, G27 |
| Curtain-side near sofa | Seat_G32 / Seat_G33 | G21, G27 |
| Curtain-side far sofa | Seat_G35 / Seat_G36 | G21, G27 |
| Curtain-side armchairs | Seat_G31 / Seat_G34 / Seat_G37 | G21, G26, G27 |
| Main coffee tables | Table_G7–Table_G10 | G21, G22, G26, G27 |
| Background observations only | Table_G4 / Table_G6, owned by G18 | G26 |

The four normal snapshots were inspected with their original chair/table ROI overlays and the ground-floor map around the registered anchors. Each physical seat/table appears once. Reflected furniture is excluded. G22's Seat_G24 ROI starts at x = -2; the annotation remains unchanged as partial-edge evidence. Historical ROI authoring resolution is unrecorded.

## Relationship to G18

G26 sees Table_G4 and Table_G6 beyond G20's core. These already exist as `g18-coffee-table-4` and `g18-coffee-table-6` in `ground/g18`. G20 records their observations in `evidence.externalObservations` and references G18 as a dependency; it does not add duplicate meshes or claim ownership of those objects.

The views suggest G18 lies beyond local -Z, but the shared seam and scene transform remain unresolved. G20's floor ends around its own seating. Reception fixtures beyond the other end, neighboring seating, and the illustrated map's decorative divider are excluded pending evidence and ownership review.

## Coordinates and architecture

Local +X runs from the reflective backing in G22 toward the curtains in G21. Local +Z runs from Seat_G24/G31 toward Seat_G30/G37; Y is up. The 8.4 × 7.6 m working crop, 2.8 m path and 4.1 m ceiling are unmeasured visualization estimates. Camera map points, registration revision/hash and headings are retained as evidence, without copying headings into world yaw or claiming global calibration.

Side glazing uses the shared schematic builder. It approximates the visible reflective/window boundaries; curtain fabric, patterned lower panels, accurate reflections and frame spacing are unresolved. Pale curved surrounds/pier returns appear in G26/G27, but their full spans and profiles are not established. Both ends of the central walkway remain open. Use **Walls**, **Low walls** and **Ceiling** to inspect the shell.

No G21/G22/G26/G27 wide captures exist in the supplied folder. The original ROIs apply only to the normal 1920 × 1080 snapshots and were not used as direct world coordinates. Sofa slot order, chair angles, all dimensions, context correspondence, architecture and global alignment need owner review.

## Editing and handoff

Select objects to move, rotate, resize or correct seat/table labels. Physical `g20-...` IDs remain stable. **Save block** persists only `objects.json`, retains a backup and checks the base revision. The four JSON files are authoritative; structural edits use `architecture.json` directly. See `evidence.json` for outstanding review items and root `CONTRIBUTING.md` for sharing rules.
