# Contributing spatial blocks

The project is designed so each person owns a separate block directory. Normal block work should not require editing the shared editor or another contributor's files.

## 1. Set up once

```bash
git clone <repository-url>
cd altanfeethi-3d-map
npm run install:app
npm test
```

Camera images, maps, PDFs, and future GLB files make the repository large. Git LFS is recommended before the first shared Git commit. It is not currently installed on the original workstation. The repository can still use normal Git, but clones and history will be larger. If the team enables LFS, every contributor must install it before pulling the LFS-enabled commit.

Never commit `local_config.json`, RTSP URLs, passwords, tokens, `.env` files, `node_modules`, editor backups, or temporary files.

## 2. Claim one block

Agree on a spatial boundary with the integrator. A camera group is evidence for a block; it is not automatically the block boundary.

Create a branch and copy the template:

```bash
git switch main
git pull --ff-only
git switch -c block/ground-g10
cp -R blocks/_template blocks/ground/g10
```

Replace every template placeholder. Set `owner` in `manifest.json` to the contributor's agreed team name or handle. Use a stable block directory such as `ground/g10` or `first/reception-east`.

Open it with:

```text
http://127.0.0.1:4209/?block=ground/g10
```

## 3. Understand the four files

| File | Owner and purpose |
| --- | --- |
| `manifest.json` | Block identity, owner, floor, zone, groups and review status. IDs and slug stay stable after merge. |
| `architecture.json` | Local floor extent, footprint, walls, openings, ceiling estimate, map anchors and shared boundary references. |
| `objects.json` | Furniture and other selectable objects. The editor saves only this file. |
| `evidence.json` | Camera IDs, snapshot references, source notes, assumptions and unresolved questions. |

Do not store generated Three.js meshes as the source of truth. The editor rebuilds them from JSON.

Follow [MATERIAL_GUIDE.md](MATERIAL_GUIDE.md) for shared surface definitions, component finishes, texture conventions and geometry quality checks. Reuse shared materials/builders across blocks and document evidence-supported local finish variants.

### Check both camera views before building

For every camera assigned to your block, inspect its normal detection image in `evidence/camera-snapshots/` and check `evidence/wide capture snapshots/` for an additional wide view of the same camera. See the [wide-capture guide](evidence/wide%20capture%20snapshots/README.md).

- Normal zoomed-in views support seat/table recognition and the existing ROI labels.
- Wide views support walls, glass, rounded entrances, corridors, walking paths, columns, lamps, display tables, decorative artifacts and details at the edges of the normal view. The currently supplied wide captures were taken from the same camera mounts, with wider zoom.
- Existing chair, table and reception ROIs are mapped to the normal detection views. **Do not overlay or project those coordinates onto a wide capture.** A shared mount position does not make the two pixel coordinate systems equivalent. Wide-view ROI mapping requires its own verified transform or separate annotation.
- Match cameras by ID while respecting actual filename case: for example `camera-snapshots/B1.jpg` pairs with `wide capture snapshots/b1.jpg`. Reference exact project-relative paths in `evidence.json`, using `snapshots` for normal views and `wideSnapshots` for wide views.
- Reconcile objects seen in both images into one physical object. Preserve approved seat/table IDs and manual furniture corrections. Record supporting views, human descriptions and uncertainty for architecture and decorative details.
- Wide captures are supplementary and are not available for every camera. If absent or occluded, record the unresolved detail; use available map and owner information without inventing hidden boundaries.

## 4. IDs, units and coordinates

- Use Y up. X and Z are the floor plane.
- Runtime values are provisional meters until the shared floor transform is calibrated.
- Prefix physical object IDs with the block slug, for example `g10-chair-01`.
- Physical object IDs never change after review. A chair's `Seat_...` ID may be corrected separately.
- Seat IDs must be unique in the composed project and must begin with `Seat_`.
- Reference shared assets and materials instead of copying modified duplicates into each block.
- Record estimates and uncertain correspondences in `evidence.json`.
- Use `evidence/rois/chair-rois/` and `evidence/rois/table-rois/` to compare seat and table observations across cameras; ROI pixels are evidence and are not direct 3D coordinates.
- Do not invent walls, camera calibration, or measured dimensions when the evidence does not support them.

## 5. Shared boundaries

Follow [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md): record confirmed walls, glazing and open edges during block authoring, then resolve shared ownership and seams during merge. Ceiling height and uncertain extents remain explicit estimates.

Exactly one block owns each shared wall, opening, or seam. The neighboring block records a reference in `sharedBoundaries`; it does not create a second overlapping wall. Ask the integrator to assign ownership when the boundary is unclear.

`shared/floor-transforms/`, `shared/schema/`, asset types, and material definitions are integration contracts. Change them in a separate `shared/...` branch and pull request so all block owners can review the effect.

## 6. Before committing

```bash
npm test
git status --short
git diff --check
```

Review the block from isometric and top views, compare every listed camera, save and reload once, and confirm:

- object IDs and seat IDs are unique;
- repeated objects visible in several cameras exist only once;
- architecture and furniture remain inside the agreed boundary;
- neighboring seams are referenced and do not overlap;
- source cameras, assumptions, confidence and construction exclusions are documented;
- available normal and wide views were reviewed, with ROI references kept attached to the normal images;
- `backups/`, credentials and dependency folders are absent from the commit.

Commit only the assigned block and any explicitly approved evidence additions:

```bash
git add blocks/ground/g10
git commit -m "Add ground g10 spatial block"
git push -u origin block/ground-g10
```

## 7. Merge rules

Use one pull request per block or one small shared-contract change. The integrator checks validation, stable IDs, camera evidence, top-view alignment and seams before merging.

Before final review, update the branch from main:

```bash
git fetch origin
git rebase origin/main
npm test
```

If a conflict occurs inside another block, stop and ask that block owner to resolve it. If two branches create the same object or shared boundary, resolve the ownership decision in the JSON instead of accepting both copies.

Do not combine contributor blocks by copying their contents into one monolithic JSON file. The final loader will compose the accepted block directories.
