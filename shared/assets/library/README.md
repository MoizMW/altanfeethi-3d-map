# Shared object library

Open [the local 3D library](http://127.0.0.1:4209/library.html) after running `npm start` from the project root. The editor header also has a **Shared library** link.

The gallery shows the actual shared furniture builders used by the lounge editor. Search by object, room, seat ID or color; filter by category and location; inspect a design in 3D; switch between its existing size/finish/options configurations; and open the source room with that object selected.

## Files and refresh

- `inventory.json` is a generated, saved inventory of the current ground and first-floor block objects.
- `scripts/build-object-library.mjs` collects the inventory. Run `npm run library:refresh` to update the saved file after adding or editing block objects.
- `app/library.html`, `app/library.js` and `app/library.css` provide the gallery.
- `app/object-builders.js` is the shared model entry point for both the editor and gallery. It delegates to the existing lounge, table, reception and equipment builders.

The gallery reads saved block data when opened or refreshed. Its **Download inventory** button exports the current scan. The disk snapshot changes only when `npm run library:refresh` is run. Unsaved editor changes are not included.

## What counts as a design

A design groups the same `type`, `variant`, `shape`, `mount`, `flagDesign` and `serviceStyle`. Missing variants use `default`. Different base colors, shell colors, dimensions, scales, accessories, workstation counts and gate/construction options remain separate configurations inside that design. Each configuration retains every source block/object reference, seat ID and evidence-camera ID.

Placement, rotation, object name and seat ID do not create duplicate designs. Counts are saved object placements, not a claim that physical objects have been reconciled across independently authored blocks. Combined layouts are excluded so their copies do not inflate the inventory. `_template`, backup folders and architecture (walls, floors, ceilings, openings and circulation) are excluded.

This is an inventory of the current modeled designs, not a visually verified real-world product catalog. Existing provisional dimensions and uncertainty still apply. Extra structural details can be reviewed in each object's source block and evidence images.

## Detailing workflow

1. Pick a design in the gallery and review its existing configurations and source-room references.
2. Improve its shared builder once, assigning finishes to upholstery, legs, frame and other physical components. Follow `MATERIAL_GUIDE.md`.
3. Reload the gallery and source rooms to review the improvement across configurations. Preserve physical object IDs, seat IDs, positions, rotations, scale and manual color overrides.
4. Refresh the saved inventory if block data changed.

The gallery is currently an inspection tool. It does not provide a master-model editor, insert objects, or convert block data to new asset references. Builder changes already apply to matching objects in every room after reload. Shared material-catalog loading and an editable master-asset workflow can be added next.
