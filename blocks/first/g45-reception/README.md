# G45 · First-floor reception

Open `/?block=first/g45-reception`. Cameras: H45. Normal and wide captures were reviewed with the first-floor map; normal-view ROI coordinates were never reused on wide images.

The default isometric and perspective camera looks toward the visitor face of the reception, showing the counter, branding and portraits. This is a viewing preset, not a CCTV calibration; top view and saved furniture coordinates are unchanged.

H45 supports one stone reception counter, three visible staff chairs, dark branded backdrop, three portraits, two decorative vessels and a folding louver screen. Staff IDs Seat_G45_RECEPTION_TMP_01–03 are temporary editor slots only. The old H15/H16 g45 chair/table files refer to another location and are excluded. R1 is a reception region, not a seat ID.

New reusable designs were created in the [shared asset library](../../../shared/assets/library/references/first-reception/README.md) before placement. Existing office chairs, side tables, portrait artwork and structural glazing/wall finishes are reused. All object positions, scale, yaw and IDs remain editable; saving the viewer updates only `objects.json`.

Owner boundary correction: the solid return is on the left when facing reception, at local X=2.2 aligned with G48 patterned glazing. It runs from the G48 join to the reception back wall. The folding louver screen is on the right (local -X), opening toward the first-floor combined lounges. G48/G45 lies left of the H40/H44/H50 backing wall in the supplied combined-lounge view; a global merge transform remains unresolved.

Local +X runs toward the solid return and +Z toward the reception staff side. Floor and ceiling dimensions, cabinet/storage spacing, stone pattern, slot ordering and global alignment remain provisional. Background buffet, reflected furniture and loose construction tools/cables are excluded. Open `/?layout=first/g48-g45` for a relative connected draft; source blocks remain independent.

Merge naming: this H45 reception is distinct from the H15/H16 G45 privacy lounge in `first/g45`. Owner-corrected reception geometry and saved furniture are retained here.
