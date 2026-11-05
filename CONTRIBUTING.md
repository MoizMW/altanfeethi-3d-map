# Contributing spatial blocks

The project is designed so each person owns a separate block directory. Normal block work should not require editing the shared editor or another contributor's files.

## Main-branch protection — required for everyone, including Codex

**Only repository owner/admin MoizMW may explicitly authorize bypassing main
protection for a specific push. No other contributor may bypass it or ask their
Codex to bypass it.** Read [AGENTS.md](AGENTS.md); it contains the mandatory
repository-wide agent instructions.

Direct pushes, force pushes and deletion of `main` are blocked by the checked-in
`.githooks/pre-push`. Work on a feature branch and push that branch for review.
The destination ref is checked, so pushing another branch into `main` is blocked
as well. The hook blocks the owner by default too; there is no username-based or
environment-variable exemption.

Every clone must enable the hook with `npm run hooks:install` before work/pushes.
`npm run install:app` includes this step. Cloning alone does not activate Git
hooks. Verify `git config --get core.hooksPath` prints `.githooks`.

Codex must never retry a rejected push using `--no-verify`, altered hook settings,
removed hooks, another clone/remote, or GitHub API/UI. A normal request to push or
finish work is not owner permission to bypass. A configured username of MoizMW
is not authenticated identity. Stop and leave the feature branch for review if
owner authorization cannot be established. Protection changes also require owner
authority.

Local hooks can be deliberately disabled, so this is a contributor/agent policy
and an accidental-push safeguard, not a substitute for server-side enforcement.

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
- Match cameras by ID while respecting actual filename case: for example `camera-snapshots/B1.jpg` pairs with `wide capture snapshots/B1.jpg`. Reference exact project-relative paths in `evidence.json`, using `snapshots` for normal views and `wideSnapshots` for wide views.
- Reconcile objects seen in both images into one physical object. Preserve approved seat/table IDs and manual furniture corrections. Record supporting views, human descriptions and uncertainty for architecture and decorative details.
- Wide captures are supplementary and are not available for every camera. If absent or occluded, record the unresolved detail; use available map and owner information without inventing hidden boundaries.

### Use nearby cameras when a detail is unclear (optional)

If the block's own views leave a surrounding wall, entrance, corridor, exterior-facing edge or nearby object unclear, use `evidence/registration/camera-placements.json` or the camera-registration map to find a nearby positioned camera whose heading may cover it. For example, while building G10, a camera from an adjacent group may clarify a shared wall or the continuation of a path. Inspect its normal snapshot and any available wide capture only when they could resolve that specific uncertainty; a routine scan of neighboring cameras is unnecessary when the block evidence is already sufficient.

Check actual visual overlap: proximity on the map alone does not prove a camera can see the detail. Nearby cameras can support the block even if their zone/group differs. Record any camera used and what it clarified in `evidence.json`, with its exact snapshot paths (and `wideSnapshots` entry if used). Keep its existing registration and group assignment, preserve block boundaries/shared ownership, and avoid duplicating neighboring furniture. Any ROI used still belongs to that camera's normal detection view.

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

### Spatial merge guided by the owner

The owner selects which blocks to combine and describes their relative order, viewing direction, corridor location and connections. Record this description before placing blocks; left/right must be tied to that stated view or a named camera. Use the map and registered camera positions/headings to interpret it, then inspect normal and wide views from the selected blocks and any nearby cameras that show the connecting area. `Cor1` and `Cor2` are corridor cameras in `evidence/camera-snapshots/`; mark their actual positions in registration before using them for spatial placement. Their optional zone/group fields may stay blank.

Build a provisional connected layout from the owner's description and supporting views, preserving walking space. Connectivity does not mean every pair of blocks shares a doorway. A camera's group does not limit which corridor or neighboring block it can support. Record unknown spans and estimates, and refine placement, corridor widths and boundaries through the owner's subsequent instructions.

Keep independent block coordinates and identities; compose them using floor-level position/rotation transforms. Shared corridor sections need an agreed owner and boundary, and each shared wall/opening is rendered once. Reconcile conflicting estimated dimensions explicitly; do not stretch furniture to force a join. Document evidence, connection endpoints and unresolved seams alongside the combined layout. Git file merging alone does not establish spatial alignment. The first combined viewer is available at `/?layout=ground/g9-g10`; placement transforms and shared boundaries are edited in `layouts/ground/g9-g10.json`. See [layout workflow](layouts/README.md). A visual placement editor is not yet implemented.

Use one pull request per block or one small shared-contract change. The integrator checks validation, stable IDs, camera evidence, top-view alignment and seams before merging.

Before final review, update the branch from main:

```bash
git fetch origin
git rebase origin/main
npm test
```

If a conflict occurs inside another block, stop and ask that block owner to resolve it. If two branches create the same object or shared boundary, resolve the ownership decision in the JSON instead of accepting both copies.

Do not combine contributor blocks by copying their contents into one monolithic JSON file. The final loader will compose the accepted block directories.
