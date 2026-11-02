# G59 — I-zone screened lounge

Run `npm start` from the project root and open http://127.0.0.1:4209/?block=ground/g59, or select **G59 · I-zone screened lounge** in the header. Install app dependencies with `npm run install:app` if needed.

## Editable draft

Two blue lounge chairs face one pale two-seat sofa across a shared oval glass/brass table. A schematic sofa-side screen brings the draft to five editable objects.

| Physical object | External identity | Primary view |
| --- | --- | --- |
| Wall-side armchair | Seat_I9 | I13 |
| Aisle-side armchair | Seat_I10 | I13 |
| Two-seat sofa | Seat_I12 / Seat_I11 | I24 |
| Oval glass table | Table_I3 | I13, I24 |

Both normal snapshots, both wide captures and the chair/table ROI overlays were inspected. The supplied normal images are 3840 × 2160; the ROIs align on a 1920 × 1080 canvas at half display scale. I13's table is partly cropped at the lower image edge. Historical ROI authoring metadata is unrecorded. ROI coordinates do not apply to the separate wide views or directly describe world positions.

## Boundaries and limits

The screen behind I9/I10 appears to adjoin G58's sofa. G59 records a candidate reference to `ground/g58` object `g58-sofa-screen-01` instead of duplicating it. **That chair-side screen is absent from standalone G59.** Its correspondence and seam need owner review. G59 owns the provisional screen behind its I11/I12 sofa; its next neighbor remains unresolved.

Local +X runs from the pale paneled wall toward the aisle, +Z runs from I9/I10 toward I11/I12, and Y is up. The 4.2 × 4.2 m crop includes a dark seating bay and a pale aisle strip. Window-side seating, distant plants and glazing are outside this block. A rail/glass edge visible in I24 has uncertain position and ownership, so it is recorded for review rather than drawn across the aisle.

The shared lounge, glass-table and grooved panel builders provide the draft appearance. Chair curves/wood legs, table shelf, fine screen ribs/transparency, the bin, wall signs and equipment are simplified or omitted. All dimensions, the floor extent and the 4.1 m ceiling are estimates. No calibrated camera view, measured scale or global floor transform is claimed.

## Editing and handoff

Select objects to move, rotate, resize or correct seat/table identities. Preserve the stable physical `g59-...` IDs. **Save block** writes only `objects.json`, retains a backup and checks revisions. Structural edits belong in `architecture.json`; the four JSON source files are authoritative.

Review top/isometric views, seat correspondence, the G58 partition reference and corridor details before acceptance. Use **Walls**, **Low walls**, **Partitions** and **Ceiling** for inspection. Run `npm test` in an environment that permits its local server test, and follow [CONTRIBUTING.md](../../../CONTRIBUTING.md) for the shared handoff workflow.
