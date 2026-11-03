# G32 — SGS check-in

Open `http://127.0.0.1:4209/?block=ground/g32`, or select **G32 · SGS check-in** in the editor header. Run `npm start` from the repository root first.

## Draft inventory

- Four counter banks: three double and one single, with seven inferred workstations.
- Seven separately editable office chairs and seven desktop monitors.
- Seven portrait airline display placeholders on the wood-paneled rear wall.
- Four rear storage units and two end luggage scales.
- 44 editable objects in total, in a provisional 13.4 × 6.9 m surrounding crop centered at local [0, 0.05]. The original 32 objects and all of their poses, finishes and IDs are preserved.

The counter fronts use pale stone and teal inserts, with wood worktops and dark office chairs, based on the camera photographs. Screen colors are placeholders; no image feed or exact airline branding is implied.

## Evidence and uncertainty

`SGSCam1`–`SGSCam4` all belong to ground-floor group `g32`, zone `Sgs`. The registered points and headings are retained in `architecture.json`. SGSCam1/3 show the visitor-facing counters; SGSCam2/4 show the opposite side. The repeated flyadeal displays help connect the overlapping views without duplicating workstations.

The ground-floor PNG shows the SGS row at the outer floor edge. The seven-workstation interpretation is a draft based on the four islands and overlapping camera views. Exact bank spacing, current chair count, chair positions and the single-counter end should be reviewed by the site owner.

The four reception ROI files are bundled under `evidence/rois/reception-rois/g32/`. Each contains an `R1` area polygon, not individual chair or table identities. All polygons fit the 1920 × 1080 snapshots, but the historical authoring resolution is unrecorded. There are no G32 chair/table ROI files in the supplied collections.

`Seat_SGS_TMP_01` through `Seat_SGS_TMP_07` are temporary editor IDs, **not approved occupancy-system IDs**. Replace them after review using the chair ID field. Keep physical IDs such as `g32-chair-01` stable.

## Coordinates and ownership

Local +X follows the counter row from the flynas/double-counter end toward the single Saudia-counter end. +Z points from the rear cladding toward visitors; +Y points upward. Counters face +Z, chairs face the desks, and desktop monitors face the staff side. Raw camera heading degrees are retained as evidence, not used as world yaw.

All dimensions are estimates. Ceiling height uses the existing 4.1 m midpoint of the user's 12–15 ft estimate. The floor rectangle is a working crop. The rear panel is editable cladding, not a measured structural wall. Global map alignment and neighboring seams remain unresolved.

This block retains the counter row and its immediate rear equipment. The owner’s 2026-11-02 request extends the local preview to fixed surroundings: the four opposite kiosks, their adjoining third luggage scale, short backing/approach wall returns, patterned Saudia-end glazing, and flynas-end window and glazed exit. Opposite-side context ownership remains provisional until future composition. Security equipment and neighboring reception are excluded. No global seam has been accepted yet.

## Editing and sharing

Select any object to move, rotate, resize or scale it. Staff chairs expose editable seat IDs. **Save block** writes this block's `objects.json` and retains a backup. The four source JSON files, this README, the shared reception builders and bundled evidence should travel together through Git. Follow the root `CONTRIBUTING.md` for merge rules.

## Permanent surroundings — wide-view refinement (2026-11-02)

All four normal/wide SGSCam pairs and the SGS floor-map crop were reviewed. The editor now offers all four **wide** camera buttons. Existing R1 reception ROI polygons remain tied to the normal snapshots.

- **Saudia / +X end:** frosted green-grey glass boundary with a simplified brass diagonal pattern and vertical joints.
- **Flynas / −X end:** pale wall piers and dark skirting, an elevated horizontal window, glazed exit with a schematic push bar and green marker, and the grille-fronted air curtain seen above it in SGSCam3 wide. Door leaf count, operation and exact hardware remain unverified.
- **Across the aisle:** four independently editable check-in kiosks and the distinct third luggage scale seen beside them in SGSCam2/4 normal and wide. Short backing and approach wall returns leave an open connection between them. These are provisional surrounding context, not a reconstruction of the security zone.
- **Counter details:** one simplified upright information holder per bank; no exact text or transient screen error pages are copied.

Temporary construction stock is deliberately absent: green board stacks, brown cover sheets, rubble sacks/offcuts, buckets and cable reels, loose tracks and wrapped trim, cartons and plastic bags. The loose gold fittings and extra chairs stored beside the stacks are also omitted because their final locations are unknown. Cloths, tools, cups, bottles and loose papers are not modeled. The clear normal snapshots corroborate the uncluttered visitor aisle.

The floor crop follows the owner-corrected opposite wall, with original counter-row coordinates unchanged. Neither the crop nor the new wall spans establish a measured room enclosure. Front and side continuations not shown clearly remain open. All new dimensions, the glass motif and kiosk placement are estimates. **Low walls** cuts the shell at 1.05 m and removes high window/door heads; turn it off to inspect the full window/exit. The optional plain ceiling is hidden by default. Original wood cladding and editable air-curtain/sign objects retain their actual heights when structural walls are cut away.


## Latest owner door clearance clarification (2026-11-02)

The latest reference corrects the earlier door-at-corner instruction: **solid wall continues after the door on the left**. The exit stays in its existing position. A full-height 1.2 m wall section now continues beyond its outer edge, and both opposite wall segments, their kiosks and adjoining scale move outward by 1.2 m to restore visitor space. This allowance is estimated, not measured.

The lower/Saudia-end side remains **glass across its full span**, extended to join the moved opposite wall. The central approach opening stays clear. The floor/ceiling crop is 13.4 × 6.9 m centered at [0, 0.05]. All original 32 counter-row objects and seat IDs remain unchanged; temporary construction items remain excluded.
