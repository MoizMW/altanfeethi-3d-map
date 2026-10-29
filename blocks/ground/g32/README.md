# G32 — SGS check-in

Open `http://127.0.0.1:4209/?block=ground/g32`, or select **G32 · SGS check-in** in the editor header. Run `npm start` from the repository root first.

## Draft inventory

- Four counter banks: three double and one single, with seven inferred workstations.
- Seven separately editable office chairs and seven desktop monitors.
- Seven portrait airline display placeholders on the wood-paneled rear wall.
- Four rear storage units and two end luggage scales.
- 32 editable objects in total, in a provisional 13.4 × 6.8 m working area.

The counter fronts use pale stone and teal inserts, with wood worktops and dark office chairs, based on the camera photographs. Screen colors are placeholders; no image feed or exact airline branding is implied.

## Evidence and uncertainty

`SGSCam1`–`SGSCam4` all belong to ground-floor group `g32`, zone `Sgs`. The registered points and headings are retained in `architecture.json`. SGSCam1/3 show the visitor-facing counters; SGSCam2/4 show the opposite side. The repeated flyadeal displays help connect the overlapping views without duplicating workstations.

The ground-floor PNG shows the SGS row at the outer floor edge. The seven-workstation interpretation is a draft based on the four islands and overlapping camera views. Exact bank spacing, current chair count, chair positions and the single-counter end should be reviewed by the site owner.

The four reception ROI files are bundled under `evidence/rois/reception-rois/g32/`. Each contains an `R1` area polygon, not individual chair or table identities. All polygons fit the 1920 × 1080 snapshots, but the historical authoring resolution is unrecorded. There are no G32 chair/table ROI files in the supplied collections.

`Seat_SGS_TMP_01` through `Seat_SGS_TMP_07` are temporary editor IDs, **not approved occupancy-system IDs**. Replace them after review using the chair ID field. Keep physical IDs such as `g32-chair-01` stable.

## Coordinates and ownership

Local +X follows the counter row from the flynas/double-counter end toward the single Saudia-counter end. +Z points from the rear cladding toward visitors; +Y points upward. Counters face +Z, chairs face the desks, and desktop monitors face the staff side. Raw camera heading degrees are retained as evidence, not used as world yaw.

All dimensions are estimates. Ceiling height uses the existing 4.1 m midpoint of the user's 12–15 ft estimate. The floor rectangle is a working crop. The rear panel is editable cladding, not a measured structural wall. Global map alignment and neighboring seams remain unresolved.

This block owns the counter row and its immediate rear equipment. The far-side kiosk bank, entrance/glazing, security equipment and neighboring reception are excluded pending boundary review. No shared boundary has been accepted yet.

## Editing and sharing

Select any object to move, rotate, resize or scale it. Staff chairs expose editable seat IDs. **Save block** writes this block's `objects.json` and retains a backup. The four source JSON files, this README, the shared reception builders and bundled evidence should travel together through Git. Follow the root `CONTRIBUTING.md` for merge rules.
