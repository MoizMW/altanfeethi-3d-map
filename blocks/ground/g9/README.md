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
