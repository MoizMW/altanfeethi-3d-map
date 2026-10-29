# G9 seating block — first reviewable draft

Run `npm run install:app`, then `npm start` from the repository root. Open http://127.0.0.1:4209/?block=ground/g9.

Three.js is installed in `app/`; the viewer needs no CDN or cloud service. The camera registration app remains a separate tool.

`manifest.json`, `architecture.json`, `objects.json`, and `evidence.json` are the authoritative block sources. The shared `app/viewer.js` builds meshes from them. Save block writes only `objects.json`, with revision-conflict protection, an atomic rename, and a copy of the previous assembled block in `backups/`. Download JSON creates a portable assembled copy. Open JSON loads a draft and does not overwrite disk until Save. Undo tracks edits during the current session.

## Evidence and limitations

Sources: B1/B3 snapshots, g9 chair/table ROI identities, and registered ground-floor camera anchors. There are two armchairs, one two-seat sofa, four semantic seat slots and one shared Table_B1. Seat ordering on the furniture needs human confirmation. The decorative screen and plant are simplified context.

All dimensions, furniture orientation and local spacing are provisional estimates. The floor is a 4.8 m working crop, not a room boundary. Ceiling estimate is retained as 4.1 m; no measured ceiling or wall geometry is invented. Global ground-floor alignment is explicitly unresolved: the saved registration anchors are retained but no fitted map-to-world transform is claimed. No synthetic CCTV calibration or occupancy values are shown.

The block references B1/B3 images from `evidence/camera-snapshots/` and the map from `evidence/maps/`. Do not include CV configuration or credentials. Snapshot permissions remain the owner's responsibility.

Review: compare both photos, click an object in the scene or library, then use Move/Rotate/Scale handles or edit the precise position, size, scale, rotation, and material fields. Press W/E/R for the three handles and Q for selection. Width/height/depth edit the provisional physical size; scale applies an additional multiplier. A selected armchair exposes its Chair ID / seat ID. It can be renamed (for example `Seat_B17`), but the new ID must be unique in the block. The furniture object's stable `g9-...` ID stays unchanged. Apply adjustment, then Save block. The scene uses provisional meters with Y up; front of a seating asset is local +Z. Future floor integration should transform the block as a unit without changing stable object IDs.

Run `npm test` from the repository root for schema, composition, identity, evidence access and stale-write checks. Orbit controls and rounded geometry use the official Three.js addons: https://threejs.org/docs/pages/OrbitControls.html and https://threejs.org/docs/pages/RoundedBoxGeometry.html.
# Architecture update from B1/B3 wide captures

Owner correction: the passage half has a leftmost outer wall and its own rounded corridor entrance surround, while the G-zone end stays open. Both halves share the dark stone floor. The full TV boundary carries teal/gold geometric cladding. These details supersede the earlier pale-floor/unmodeled outer-edge description below. Wall profiles, pattern scale and dimensions are still estimates.

G9 uses the same provisional area as G11 (43.2 m²), with dimensions oriented as 7.2 × 6 m and an offset floor center of [-1.78, 0]. The owner confirms half is seating and half is open circulation toward G zone. Exact dimensions and block-to-map alignment remain estimated.

The left half in the B3 description is an open through passage. It is shown with a pale floor surface; both ends remain open. The outer corridor side is unresolved. The TV wall and glazing behind the sofa enclose only the seating half. The rounded entrance behind the armchairs follows B1-wide, with estimated width, height and profile. The G-zone connection is recorded as an open seam for future alignment.

Existing furniture transforms, sizes and human-corrected seat IDs are retained. The old screen's saved position now carries teal/gold wall-cladding geometry. TV, display console and floor lamp are additional editable objects. Neither reflected furniture nor reflected TV is duplicated. Detection ROIs still use only the original zoomed-in images.

Use Walls / Low walls / Ceiling to inspect the shell, and B1 wide / B3 wide for references. Structural geometry is maintained in architecture.json; furniture editing saves only objects.json. These architecture notes supersede the original working-crop/no-shell assumptions.
