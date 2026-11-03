# G58 — I-zone screened lounge

Run `npm start` from the project root and open http://127.0.0.1:4209/?block=ground/g58, or choose **G58 · I-zone screened lounge** in the header. If needed, install app dependencies with `npm run install:app`.

## Editable draft

The I18/I22 views resolve one pale sofa, two blue lounge chairs and one shared oval glass/brass coffee table. A schematic screen behind the sofa brings the draft to five editable objects.

| Physical object | External identity | Primary view |
| --- | --- | --- |
| Two-seat sofa | Seat_I5 / Seat_I6 | I18 |
| Wall-side chair | Seat_I7 | I22 |
| Aisle-side chair | Seat_I8 | I22 |
| Oval glass table | Table_I2 | I18, I22 |

Both normal snapshots, both wide captures, the chair/table ROI overlays and the ground-floor map were reviewed. The normal images are 3840 × 2160; the ROI overlays align when displayed at 1920 × 1080. Historical ROI authoring metadata is unknown. Wide captures are separate 1920 × 1080 views and do not share the normal-image ROI coordinate system.

## G57 boundary and architecture

The screen behind the I7/I8 chairs appears to be the reverse side of G57's sofa screen. G58 records a candidate reference to `ground/g57` object `g57-sofa-screen-01`; it does not create another copy. This correspondence needs owner review and a fitted seam. **The chair-side screen is consequently absent from standalone G58.** G58 owns the provisional screen behind its I5/I6 sofa; its next neighbor is unresolved.

Local +X runs from the pale paneled wall toward the open aisle, and +Z runs from the I7/I8 chairs toward the I5/I6 sofa; Y is up. The compact 4.2 × 4.2 m floor includes dark stone seating and a pale strip beside it. The aisle remains open. Far-side window chairs, their tables, distant plants and glazing are outside this block.

Furniture uses the existing shared lounge and glass-table builders. The grooved panel simplifies the screen's ribbing and transparency; bucket-chair shells, timber legs, table shelf, decorative details and bin are not reproduced exactly. All furniture/shell dimensions, the floor extent and 4.1 m ceiling remain provisional. Registered map anchors and headings are preserved without claiming a global transform or calibrated camera projection.

## Editing and review

Select objects to move, rotate, resize or correct seat/table identities. Stable physical `g58-...` IDs remain unchanged. **Save block** writes only `objects.json`, retains a backup and checks revisions. Structural edits use `architecture.json`; the four source JSON files are authoritative.

Review top/isometric views, sofa slot order, the G57 screen reference and neighboring boundaries before acceptance. Use **Walls**, **Low walls**, **Partitions** and **Ceiling** to inspect the draft. Run `npm test` and follow [CONTRIBUTING.md](../../../CONTRIBUTING.md) for handoff.
