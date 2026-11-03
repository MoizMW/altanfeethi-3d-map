# Altanfeethi 3D spatial twin — working context

## Current phase

Expanded first-floor integration on branch bottom-30% loads at `/?layout=first/bottom-lobby`. Saved merged-first-floor-bottom-right source blocks and G42 are retained independently. G38→G37→G36→G35 order is unchanged; H9 normal/wide establishes G42 across the stair/escalator opening, with H18-wide/H19 supplying lobby context. G42 yaw +90, position [-5,0,10.2] is provisional. Owner correction aligns the stair start with G37 (third bay from bottom, X=-10) and its end beside G35 at the outer wall (first bay, X=2.57). The continuous H2 outer wall closes the far end; the duplicate inner wall and intervening strip are removed. Continuous guards remove the inferred G35/G36 passage. Only the left landing connects the rows; explicit panels leave a real central void. G42 and its lobby context shift together by +5 X. Static stair/escalator descent uses a clearly estimated 3.8 m visual drop. The enlarged layout adds checker inlay, console/ornaments, closed lift, two plants, bins, extinguisher and dispenser without duplicating source seating or G35's plant. All 20 seat IDs and six table identities remain unique; original bottom-right-only URL stays separate. Fixture details, alignment, floor-to-floor elevation and wider-building calibration await review.

G17 Diriyah Majlis is available in `blocks/ground/g17/`, reconstructed from E1/E2/E4, all six normal-view chair/table ROI overlays, all three wide views and the registered ground-floor map crop. Four two-seat sofas, two gold armchairs, four oval coffee tables, one round side table and two plants make 13 editable objects. Seat_E2–Seat_E11 and Table_E1–Table_E5 resolve once; no Seat_E1 is invented. Pale side walls and schematic rear glazing leave the corridor-facing side open. Gold swivel chairs and the round pedestal table use simplified shared builders. Signage, patterned glazing/cushions, neighboring lift-lobby arches and temporary items are excluded. Sofa slot order, all dimensions, neighboring ownership and global map alignment require review; see the block README and evidence file.
G28's editable draft is available in `blocks/ground/g28/`, using G11/G15/G18/G19 normal and wide captures and their original chair/table ROIs. Two sofas and nine armchairs resolve 13 annotated seat slots (Seat_G76–G79 and Seat_G81–G89), with four core tables Table_G23–G26. Table_G27 and surrounding unlabelled end-lounge sofas remain background evidence outside the crop with unresolved ownership. One shelf divider, three side tables, one raised plant and two floor lamps bring the draft to 22 objects. The pale central path, schematic side glazing and 4.1 m ceiling use estimated dimensions; curved side-bay surrounds, curtains, slot order, seams and global calibration require review.
G27 now extends the B + C + G combined layout left of G22. Current Seat_G69/G63 end joins current G22 Seat_G56/G62 end at X=-46.98; G27 yaw +90, center [-51.78,0,-7.2]. Shared arch is owned by G22 once. Width/glazing/path align, source furniture is retained without offsets/scaling, and all prior component placements stay fixed. Layout now contains twelve areas; all dimensions remain provisional.

G12/G14 now fills the full G21/G22 span in the renamed B + C + G combined layout (same URL). C19/C20 end meets Zone C at X=-29.38; C28/C29 end is -46.98. Integration-only shell/arch extensions and end-cluster translations match 17.6 m without furniture scaling; the front corridor connects through the Zone C approach. Shared glazing and end-wall surfaces render once. See layouts/README.md for ownership and provisional dimensions.

Owner-requested G21/G22 integration extends `/?layout=ground/b-g-lounges` to ten areas. Front-view order is G22 → G21 → G2 → G20. G21/G22 use yaw -90 and centers X=-33.78/-42.58, Z=-7.2; shared arches are singly owned by G2 and G22. G22 adds two source arches and retains its 9 m shell with small edge steps against G21’s 8.4 m shell; furniture positions, yaw, scale and IDs are unchanged under composition. See layouts/README.md for provisional transforms and seam notes.

G12 and G14 are authored together in `blocks/ground/g12-g14/` because the owner confirms they share a space. All eight normal/wide camera pairs, chair/table ROIs and registered map anchors were reviewed. One shell and corridor serve four sofas, thirteen armchairs (21 unique seat slots), six ROI tables, six unlabelled side tables, two lamps and two plants: 33 editable objects. Central sofas C21/C22 and C24/C25 face each other around one Table_C23; overlapping cross-group observations are reconciled. Three corridor arches, continuous glazing and teal/gold end cladding are provisional. Open `/?block=ground/g12-g14`; source map review overlay and unresolved dimensions/slot order/arch profiles/global alignment are documented in its README/evidence. Existing composed layouts remain separate.

G27's first editable draft is in `blocks/ground/g27/`, based on G6/G12/G13/G14, all normal-image ROI overlays and the ground-floor map. Six reflective-side chairs face two sofas and three curtain-side armchairs across a pale walkway, resolving Seat_G63–Seat_G75 once with no temporary IDs. Four main tables carry Table_G19–G22. Background Table_G16 (candidate g22) and Table_G23/G25 (candidate g28) are deferred observations with corroborating ROI references, not locally owned meshes. Display shelving, side tables, square plant stand, lamps and plants make 26 editable objects and 13 seat slots. No matching wide captures exist. All dimensions, slot order, curved surrounds, decorative details, neighboring seams and global alignment require review.

G21's first editable draft is in `blocks/ground/g21/`, based on G1/G2/G4/G5, their normal-image ROI overlays and the ground-floor map. Four armless chairs plus one angled armchair face two sofas and three armchairs across a pale walkway. Eleven ROI labels (Seat_G38–G48) are retained once; a separately visible central armchair without an ROI label has explicit temporary ID Seat_G21_TMP_01, not an approved CV identity. The draft has 23 editable objects and 12 seat slots, with Table_G11–G14, display shelving, side tables, plant stand, lamps and plants. Background Table_G15/G17 are deferred observations corroborated by g22 ROI files, not duplicated or owned locally. Shared builders add opt-in armless-chair and rectangular-table variants. No matching wide captures exist; architecture, slot order, the temporary identity, dimensions and alignment require review.
G22's editable draft is in `blocks/ground/g22/`, based on camera group g22 (G7/G8/G9/G10), all eight normal chair/table ROI overlays, all four supplementary wide frames, and the ground-floor map. Two cream sofas and nine teal armchairs resolve thirteen seats: Seat_G49–G52 and Seat_G54–G62; Seat_G53 is absent from the supplied ROIs and is intentionally not invented. Four main tables carry Table_G15–G18. A curtain-side shelving divider, five side/support tables, four schematic lamps and four plants bring the total to 29 objects. The pale through path stays open, side glazing is schematic, and curved surrounds/curtains/global seams remain unresolved. Top/isometric browser review and reversible save/reload were checked on 2026-11-02. Dimensions, sofa slot order and context details require owner review. Contribution branch: `block/ground-g22`; owner acceptance of geometry and evidence correspondence remains pending.

G20's first editable draft is available in `blocks/ground/g20/`, based on G21/G22/G26/G27, all four chair/table ROI overlays and the ground-floor map. Four sofas and six armchairs resolve Seat_G24–Seat_G37 once, with Table_G7–G10. Background Table_G4/G6 observations in G26 reference G18's existing objects instead of creating duplicates; the adjacency/seam transform remains unresolved. A pale central path, dark seating strips, schematic side glazing, four round side tables, three lamps and three plants make 24 editable objects; two plant pots sit on side tables. No matching wide captures exist. Curtains, patterned panels, partly visible arch surrounds, all dimensions, slot order and global alignment require review.

G18's first editable draft is available in `blocks/ground/g18/`, based on G24/G25/G28/G29, all four chair/table ROI overlays and the ground-floor map. Four sofas and six armchairs resolve Seat_G10–Seat_G23 once; Table_G3–G6 serve the main group. Table_G1/G2 beyond the core in G25 are explicitly provisional context pending neighboring ownership review, with no invented background seat IDs. The draft includes a pale central path, dark seating strips, schematic side glazing, three side tables, three floor lamps and two plants (24 editable objects). Curtains, decorative panels and partly visible arch surrounds remain unresolved. No matching wide captures exist. All dimensions, slot ordering, boundary/seam ownership and global alignment require review; see the block README and evidence file.

Spatial merging is owner-guided: the owner will select blocks and describe relative order, viewing direction and corridor placement/connections. Use these instructions with the registration map and any relevant block/nearby camera views to form a provisional connected layout with walking space, then refine it through owner feedback. Do not assume all block pairs directly connect. Preserve independent block coordinates and IDs, assign shared corridor/boundary ownership, and record uncertain dimensions/seams. Cor1.jpg and Cor2.jpg are additional normal corridor captures in evidence/camera-snapshots, available in registration with initially unplaced positions and optional blank zone/group. See CONTRIBUTING.md section 7 for the merge workflow; the first floor composition now loads at `/?layout=ground/g9-g10`, with live source block references, a single shared partition and provisional corridor. Cor1/Cor2 are now registered; consult the saved registration for their latest positions. Placement changes use layouts/ground/g9-g10.json; the combined viewer is read-only for furniture.

G9 owner correction: passage-side corridor access also has a rounded surround; its far-left outer wall is present. Passage and seating share the same dark stone floor, and the TV wall has teal/gold geometric cladding. G-zone end stays open. This supersedes the earlier pale-floor/unbounded outer-corridor assumption. Structural dimensions remain estimates.

G9 now includes a provisional 7.2 × 6 m footprint, equal in area to G11, offset to retain the owner's seating transforms. Owner confirms half seating / half open through circulation toward G zone. Architecture closes only the seating-side TV wall, sofa glazing and rounded entrance surround, leaving both passage ends open and its outer side unresolved. Wide evidence is `evidence/wide capture snapshots/B1.jpg` and `B3.jpg`. Saved furniture geometry/IDs are retained, prior screen interpretation becomes teal/gold cladding, and a TV, console and lamp are added. Global corridor direction and G-zone seam calibration remain unresolved.

G11's closed side boundaries now include approximate interior cladding and relief from C3-wide: dark reflective panels on the camera-left side, teal/gold patterned panels and a pale projecting pier on the camera-right. Two floor lamps and two display consoles with simplified artifacts were added as editable context objects. Existing furniture edits are retained; no accurate mirror reflections or measured wall profiles are claimed.

G11 architecture is now rendered from structural JSON: closed front glazing (+X), closed side walls (±Z) and estimated rounded access passages (-X) behind Seat_C1/C5. Sources are the owner's boundary description and three wider frames in `evidence/wide capture snapshots/`. Original detection snapshots and ROIs remain separate. Owner-corrected furniture positions/IDs are preserved. Shell dimensions and two-opening interpretation need review. Shared wall/low-wall/ceiling controls support overhead inspection; ceiling is plain, estimated and hidden by default.

G11 C-zone lounge is available in `blocks/ground/g11/`, reconstructed from C1/C2/C3 and their bundled chair/table ROIs. It contains two sofas, four armchairs, two main coffee tables, one shared open-shelf divider, two plants and two side tables (13 objects, Seat_C1–C8). Furniture uses the shared lounge style. Slot correspondence, plant correspondence, dimensions and global map alignment require review; see the block README.

G32 (SGS check-in) is now available in `blocks/ground/g32/`, using all four SGSCam snapshots and bundled reception-area ROIs. The editable draft contains four counter banks, seven provisional office-chair positions, seven monitors, seven wall displays, four rear storage units, two luggage scales and wood cladding. `Seat_SGS_TMP_*` are temporary IDs pending review, not CV chair identities. Global alignment remains unresolved. See `blocks/ground/g32/README.md`. The editor header switches between G9 and G32, and shared builders support reception furniture.

The shared Three.js editor is implemented in `app/`; run `npm start` from the project root and open `http://127.0.0.1:4209/?block=ground/g9`. The first block is in `blocks/ground/g9/` and contains two armchairs, one two-seat sofa, four seat-slot IDs, one shared table, and simplified screen/plant context. Its local arrangement and dimensions are estimates; full-floor alignment remains unresolved. The block's four JSON files are authoritative, with direct object saving, backups, revision conflicts, JSON import/download, numeric position/rotation/material editing, and session undo. See `blocks/ground/g9/README.md` and `CONTRIBUTING.md` for handoff details. The camera registration tool remains separate in `tools/camera-registration/`.

The G9 editor now supports selecting an object and using Move, Rotate, and Scale handles, as well as precise position, size, scale, rotation, and material fields. Armchairs expose an editable chair/seat ID with uniqueness validation. The persistent furniture object ID remains stable when its seat ID changes.

Phase 0 camera registration is substantially complete. As of 2026-10-29, 142 of 186 cameras are positioned and human-reviewed: 89 on the ground floor and 53 on the first floor. The remaining 44 cameras are intentionally deferred where reliable placement is not currently possible, including areas under construction. Do not invent positions for them.

The browser workspace in this directory keeps the supplied maps unchanged and stores camera placement separately. Each placement has a floor, source-image pixel coordinate, heading, verification state, optional zone/group metadata, notes, and provenance.

The installed cameras are ceiling-mounted Axis dome cameras. A registered point represents the best available estimate of the physical ceiling mount. Heading represents the plan-projected viewing direction. A `verified` registration means it was reviewed and placed by a person using the available evidence; it is still observational rather than survey-grade.

## Supplied evidence

- `evidence/camera-snapshots/` contains the normal zoomed-in seat-detection views; existing chair/table/reception ROIs refer to these views.
- `evidence/wide capture snapshots/` contains supplementary wider images of the same cameras from unchanged mounts. Check this folder for every block before modeling walls, glass, entrances, corridors, paths and side decorative details. Filenames use the camera ID capitalization (for example, normal `B1.jpg`, wide `B1.jpg`); record the exact paths in `wideSnapshots`. Existing detection ROI coordinates must not be applied to wide images without a separately verified transform or annotation. See that folder's README and CONTRIBUTING.md for the workflow.

- `evidence/maps/ground-floor.png` — 14,761 × 8,610 isometric layout image.
- `evidence/maps/first-floor.png` — 7,076 × 4,086 isometric layout image.
- Matching PDF versions of both maps.
- 186 camera snapshots in `evidence/camera-snapshots/`.
- Four overlapping ground-floor marking screenshots in `camera_marking/`.
- Camera grouping and zone metadata from `/home/moiz/Desktop/project/altanfeethi-cv/src/local_config.json`.
- Chair image-space ROIs in `/home/moiz/Desktop/project/altanfeethi-cv/src/ChairOccupancy/Chair_ROIs/` (125 camera ROI files across 44 group directories, plus one priority-camera metadata file).
- Table image-space ROIs in `/home/moiz/Desktop/project/altanfeethi-cv/src/TableOccupancy/Table_ROIs/` (128 camera ROI files across 45 group directories, plus one priority-camera metadata file).

## Accuracy rules

- A transferred point from an existing screenshot is **approximate**.
- In the current registration, **verified** means human-reviewed against available evidence, not independently measured or camera-calibrated. Preserve this distinction in downstream tools.
- Camera photos support appearance, furniture placement, and view direction. They do not establish measured room dimensions.
- The PNG maps are the preferred source for floor topology and approximate seat/camera placement. Camera imagery is preferred when current furniture orientation, appearance, or occupancy layout conflicts with the illustrated map.
- Chair/table ROIs are 2D rectangles in each camera image. They can support furniture detection, counting, naming, and cross-camera correspondence, but they are not direct world coordinates. Do not place them in 3D without camera calibration, homography, or corroborating map evidence.
- A `group_id` is a useful candidate set for overlapping observations, not proof that every member sees the same contiguous area. Check map placement and visual overlap before fusing views; create each supported real object only once.
- When sources disagree, keep the disagreement visible in evidence/provenance. Do not silently average conflicting geometry.
- The supplied maps are isometric presentation drawings, not dimensioned architectural plans. Metric 3D calibration still requires real measurements, a dimensioned drawing, CAD, or scan data.
- Real floor measurements are not currently available. The initial twin is therefore expected to be proportionally and topologically accurate, but not metrically certified.
- Future 3D geometry must use structured JSON as its source of truth. The floor-map image is a reference layer, not the geometry itself.

## Evidence fusion rules

Use this priority by question type:

1. Building topology, area boundaries, and approximate furniture/camera positions: floor PNG first.
2. Current furniture orientation, style, and local arrangement: multi-camera views from the same group first.
3. Seat/table detection and correspondence inside a view: chair/table ROI data as supporting evidence.
4. Exact metric dimensions: measured dimensions, calibrated drawings, CAD, or scan data only.

For a group with multiple cameras:

- collect every camera assigned to the group, including its floor, zone, position, and heading;
- identify objects repeated across views so each real object is created once;
- use view overlap to resolve occlusion, count seats/tables, and infer which side of an object faces an aisle or wall;
- use the floor map as the common plan-space anchor;
- assign confidence and source-camera references to inferred objects;
- leave uncertain or construction-affected areas incomplete instead of filling them with guessed geometry.

The camera-registration dashboard is the spatial index for connecting these views. Camera floor, zone, group, marked mount position, and heading link each perspective image back to its relative location on the two floor maps.

## Relative-scale reconstruction strategy

There is currently no trustworthy building or floor dimension. Build the first version in a stable relative plan coordinate system and keep physical scale as an explicit adjustable project parameter.

- Treat the map as authoritative for direction, block adjacency, aisle relationships, and relative seat/camera positions.
- Treat the fused camera views as authoritative for the current local arrangement and orientation of seats, tables, counters, and other visible objects.
- Do not interpret raw image-pixel distances as meters. The maps are isometric, so trace or inverse-project their principal plan axes into a common X/Z plan space first.
- Store the original map-pixel references alongside derived plan coordinates so the transform can be recalculated without losing evidence.
- Keep horizontal physical scale explicitly provisional, for example with `scaleStatus: "estimated"`, an unmeasured source plan, and centrally owned per-floor `metersPerPlanUnit` values. Different map image sizes do not imply equal scale.
- The Three.js runtime uses a consistent provisional meter-based world; do not combine arbitrary plan-unit X/Z values with meter-based Y values. Retain the source relative plan coordinates separately. A plausible furniture-size prior can initialize visualization scale, but is not a measured floor dimension.
- When a reliable real-world span becomes available, revise calibration and review the result. Separate map-derived positions/dimensions from independently estimated physical furniture sizes/heights; do not indiscriminately rescale the whole scene. One measurement does not resolve every distortion in an illustrated map.
- Preserve block topology, object IDs, and relative transforms when recalibrating scale.

Ceiling height is estimated at 12–15 ft, approximately 3.66–4.57 m. This is a vertical estimate, not a measured value. Use a centrally configurable provisional ceiling height for visualization and retain the full estimate range in provenance so it can be corrected later.

## Registration records

The original B1 seed is retained in `evidence/registration/camera-placements.seed.json`, and its early static reference is in `evidence/references/ground-floor-B1-reference.svg`. These are historical bootstrap evidence only. The live registration file supersedes their original approximate position and neutral heading.

The live editable record is `evidence/registration/camera-placements.json`. Run `npm run camera-registration`; the **Save JSON** button writes directly to this file and the next browser session loads it again. If the dashboard is opened without that server, Save offers a one-time project-folder selection and then writes the same JSON through the browser's local-file permission.

Every camera also has optional `zone` and `group_id` fields. Zone defaults to the first letter of the camera name. Group IDs were imported from `/home/moiz/Desktop/project/altanfeethi-cv/src/local_config.json`; cameras absent from that configuration, or with an empty `group_id`, remain blank and can be edited manually.

Saved human overrides take precedence over defaults or a fresh configuration import. In particular, current zone overrides and blank groups must not be silently regenerated.

The dashboard renders the PNG maps, not the PDFs. To revise a map, replace `evidence/maps/ground-floor.png` or `evidence/maps/first-floor.png`. Keep the existing pixel dimensions, crop, and orientation whenever possible so saved camera coordinates stay aligned. Furniture-only changes do not affect the coordinates; if the drawing shifts inside the image, adjust any small offsets in the registration workspace.

## Incremental and distributed 3D architecture

The Altanfeethi 3D twin will be built in small reviewable spatial blocks, not generated as one monolithic scene. Give each block an explicit stable ID and floor-local boundary. Groups and zones are evidence/operational metadata, not mandatory construction boundaries: a block may reference several groups, and a group may contribute evidence to several blocks. Cameras with no group remain usable evidence.

The project uses Three.js, as selected by the user. It follows the data-driven architecture from `HOME_3D_ARCHITECTURE_CODEX_CONTEXT.md`: consistent provisional meters, a Y-up world, structured JSON as the source of truth, and generated Three.js objects as runtime representations. That home-project document is reference material, not authorization to implement all its features or assume measured geometry exists here. Human View, capture, and physics are later options, not prerequisites for the first dashboard block.

Each independently owned block should be self-contained and merge-friendly. The planned contract is conceptually:

```text
blocks/<floor>/<block-slug>/
  manifest.json       identity, schema version, owner/status, dependencies
  architecture.json   footprint, walls, openings, ceiling and fixed structure
  objects.json        seats, tables and other editable objects
  evidence.json       source cameras, ROI files, assumptions and confidence
  assets/             block-specific textures or models only
```

This contract is implemented in the repository. Copy `blocks/_template/` when starting a new block and follow `CONTRIBUTING.md`.

Distributed-work rules:

- One contributor owns one block at a time; avoid editing a shared monolithic scene file.
- Global coordinate calibration, units, floor elevation, schema, materials, and shared asset IDs are centrally owned contracts and must not be redefined per block.
- Every room/object ID must be stable and globally unique. Do not change an identity when its zone, group, or owning block changes.
- A block records its boundary/seam and dependencies on neighboring blocks so walls, corridors, and openings connect without overlap or gaps.
- Shared assets live in a common catalog; blocks reference them by ID instead of copying and modifying duplicates.
- The scene loader composes block manifests into the complete building. Generated combined output must be reproducible from the block sources.
- Each block carries an evidence/confidence status such as `draft`, `human-reviewed`, `blocked-construction`, or `needs-measurement`.
- Block completion requires reprojection into the original isometric map, inspection in rectified top view, cross-view review against relevant cameras, unique-object checks, and seam validation with adjacent blocks.

## Block-by-block workflow

Optional supporting evidence: when the block's own cameras leave a nearby wall, entrance, corridor, path continuation or surrounding object unclear, consult the registered camera positions/headings in `evidence/registration/camera-placements.json` or the registration dashboard to select a nearby camera with a potentially useful view. A camera from another group/zone may help (for example an adjacent view while building G10). Inspect it only when needed to resolve a specific uncertainty; do not require neighboring-camera review for every block. Confirm visual overlap, check for a wide capture, and record the supporting camera/path and finding in the block evidence. Preserve existing camera group assignments, manual edits and neighboring ownership; do not duplicate objects. Detection ROIs remain specific to each camera's normal zoomed image.

1. Select one high-evidence group/block with positioned cameras.
2. Gather its map crop, every group camera view, and applicable chair/table ROIs.
3. Resolve one plan-space block footprint and list known versus inferred facts.
4. Build only that block's architecture shell.
5. Add large furniture once the shell aligns in top view.
6. Validate repeated objects across camera angles and correct orientations.
7. Record evidence, confidence, unresolved items, and construction exclusions.
8. Merge the block through the shared loader and validate its seams.

Do not begin with photorealism. Preserve each accepted block while subsequent blocks are developed independently.

## Next acceptance point

Before building the first 3D block:

1. freeze a versioned snapshot of the current camera-registration JSON;
2. choose the permanent building origin and derive the relative X/Z plan axes from the isometric maps;
3. declare the horizontal calibration as relative-only and configure the provisional 12–15 ft ceiling-height range;
4. define the shared block schema, material catalog, asset catalog, and seam rules;
5. select the first high-evidence group and list its complete camera/ROI evidence;
6. derive provisional floor polygons and evidence-supported wall segments for that block (not survey-calibrated geometry);
7. validate its top-down geometry before adding furniture or photorealism.

A real-world floor span and exact floor-to-floor height remain desirable future calibration inputs, but their absence does not block relative block reconstruction.

## Pre-build reasoning review — 2026-10-29

Scope: architecture/evidence review only. No 3D geometry, application features, or camera-registration changes were made for this review. Both PNG maps, the live registration data, ROI inventories/labels, selected configuration metadata, and eight sample snapshots (B1, B3, B4, B5, B6, H15, H16, H45) were inspected. This is not an exhaustive visual audit of all 186 camera views.

### Findings that change the drawing approach

- All 142 positioned camera points are within their declared map bounds. This validates storage bounds, not physical correctness.
- 22 positioned cameras have no group. Other groups cross zones, including g3 (B/C), g19 (E/F), and g23 (E/F). A group-only block hierarchy would exclude usable evidence or impose artificial boundaries.
- Configuration g45 includes H15, H16, and H45. H15/H16 show seating with privacy screens; H45 shows reception/buffet and is distant on the first-floor map. Existing g45 ROI files cover H15/H16, not H45. Flag this association for review; do not automatically change the user's metadata or model them as one room.
- g9 is a useful first pilot: B1/B3 provide evidence for two armchairs, one two-seat sofa, and a shared oval coffee table. Four occupancy seat labels (Seat_B1 through Seat_B4) do not mean four separate chair objects. Table_B1 is observed in both cameras and should represent one table after correspondence review.
- g10 (B4/B5/B6) is a useful second pilot: opposite views around a central display/partition unit test occlusion, adjacency, and deduplication. Its ROI records contain 12 chair observations with eight distinct seat labels, and six table observations with two distinct table labels. These are evidence-label counts, not an automatic furniture inventory.
- Chair and table ROI sets each cover 105 camera IDs present in the snapshot library; each includes 100 positioned cameras. Other external ROI files do not necessarily belong to this snapshot set. Import by validated identifiers, not by copying every external file blindly.

### Map-to-world drawing contract

1. Select a permanent structural origin and fit the two principal floor-plane directions independently for each illustrated map. Start with an affine ground-plane model: `mapPixel = origin + axisX * planX + axisZ * planZ`. Check several structural landmarks before accepting it. Do not assume a perfect 30-degree isometric drawing; retain residual errors and any explicit local correction.
2. Trace floor boundaries, corridors, and structural landmarks before furniture. Colored zone edges are not automatically walls. Trace a furniture footprint/contact location, not the elevated backrest or top of its illustrated symbol.
3. Keep source pixel anchors and transform versions. Store plan-derived layout separately from generated Three.js geometry, so later map replacement/calibration can be reviewed without losing manual work.
4. Registration headings currently use image-up = 0 degrees, clockwise. Transform their image vector `(sin(theta), -cos(theta))` through the inverse map basis before deriving world yaw. Copying the heading directly to Three.js yaw is incorrect.
5. Human-marked mount positions remain uncertain anchors. Confirm whether their intended image anchor is the projected floor point beneath the camera before applying any ceiling-height projection correction. Do not automatically move saved markers to improve a camera-view fit.
6. Align the two floors using shared structural landmarks such as stairs/lifts/columns, not image centers or equal pixel scale. Ceiling height is not floor-to-floor height. Start with separate floor views if vertical stacking/alignment remains unresolved.

Use 4.1 m only as a proposed configurable visualization midpoint for the user's 3.66–4.57 m ceiling estimate. It is not a new measurement or a confirmed mounting height for every camera.

### Multi-view evidence and ROI contract

- Separate physical objects, occupancy seat slots, and camera observations. One sofa owns multiple seat slots; one table can have many observations. Preserve external seat/table names in explicit mappings to stable physical-object IDs.
- Record source image dimensions, crop/resize transform, ROI coordinate dimensions, source path/version, and timestamp when known. The available chair ROI generators declare different target sizes (3840×2160 and 2560×1440), whereas the inspected B1/B3 snapshots are 1920×1080 and table generator uses 1920×1080. Existing ROI extents appear near 1920×1080, with some boxes slightly outside it; current generator constants alone cannot establish how historical files were produced. Validate overlays before using coordinates; flag out-of-bounds rectangles instead of silently trusting or clamping them.
- Priority-camera metadata is useful for choosing an observation, not proof of geometric correctness. Inspect corroborating views and source freshness where possible.
- Camera model, focal length/FOV, distortion, pitch, roll, and exact mount height are not supplied by a 2D point plus heading. Axis dome housing does not establish the lens projection. Any initial virtual CCTV view or visibility cone is approximate.
- Overlapping views support correspondence and qualitative reconstruction; they do not by themselves provide metric triangulation. A floor homography requires corresponding floor-plane points and does not directly locate seat centers or tabletops above that plane.
- Keep uncertainties separately for position, orientation, dimensions, identity/correspondence, and appearance. Record explicit manual overrides with reasons. Construction, unplaced camera, and missing visual evidence are different statuses; do not label all 44 unplaced cameras as construction automatically.

### Three.js and collaboration contract

- Pipeline: versioned evidence → reviewed project/block JSON → reusable object builders → Three.js scene. Runtime meshes and any GLB export are derived products, not the authoritative editable record.
- Shared project data owns floor transforms, calibration, schema version, asset/material catalog, and global shell. Each block owns its object records and evidence references. Shared boundary geometry has exactly one owner; neighboring blocks reference it and may display read-only context.
- Begin with orthographic isometric/map-comparison and rectified top views, plus perspective orbit inspection. Keep view cutaways separate from persistent visibility. Save/load, selection, adjustment, and undo belong in the pilot; full walking/collision can wait.
- Build simple recognizable furniture using the snapshot evidence: for the B-area pilot, beige sofas, blue armchairs, oval pale tables, screens/display units, and dark flooring. Do not inherit the illustrated map's orange palette or identical seating symbols as literal materials/geometry. Add detailed assets later without changing semantic IDs or layouts.
- Reuse geometry/materials and instance repeated assets where useful, with instance-to-object-ID mapping for selection and occupancy coloring. Load snapshots on demand. Keep the very large PNG as a tracing/reference layer with suitable previews/crops, not a full-resolution texture required for normal 3D navigation. Do not render 186 live virtual CCTV views or add a light per camera.
- Future telemetry is a separate layer keyed to seat/table/camera IDs; it must not rewrite layout JSON. Moving a sofa preserves its seat identities. Unknown/stale occupancy must not look like a confirmed empty seat.
- Sharing a directory alone does not provide safe concurrent editing. Use one owner per block and Git-based merges or block import/export with base-revision conflict checks. The current directory is not a Git repository. A future writer should validate, detect stale revisions, write atomically, and retain backups; do not extend whole-file last-write-wins behavior to collaborative editing. Browser storage is a draft/recovery aid, not the shared source of truth.
- Share only sanitized camera/ROI metadata and authorized imagery. `local_config.json` contains credentials/stream connection details and must not be copied into the shared project. Future evidence packages should use portable project-relative paths, not dependencies on one contributor's home directory.

### Recommended implementation sequence and acceptance

1. Freeze a registration/evidence revision without replacing the live file; define the floor coordinate transforms and a small validated schema.
2. Reconstruct a bounded g9 seating cluster, including its four seat slots and shared table, with editable simple geometry. Do not invent surrounding walls where only open seating is evidenced.
3. Review map reprojection and both camera views; approximate virtual camera fitting is a qualitative aid, not an exact calibration acceptance test. Verify object counts/identities, seat mappings, source-resolution handling, and uncertainty labels.
4. Save, reload, and compare the complete authored state; manually adjusted positions/orientations must survive exactly. Test an outdated save cannot overwrite a newer block silently.
5. Add the neighboring g10 cluster and validate its divider, duplicated observations, and connection to the accepted block. This is the first test that the distributed block contract actually joins correctly.
6. Expand block by block, then add broader architecture/material detail and telemetry. Defer uncertain construction areas, detailed ceilings, floor stacking, and Human View until their prerequisites are established.

Technical references checked: [Three.js OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html), [ShapeGeometry](https://threejs.org/docs/pages/ShapeGeometry.html), [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html), and [OpenCV camera calibration](https://docs.opencv.org/4.13.0/d9/d0c/group__calib3d.html).

## G10 shell review

G10 now has a provisional shell from normal/wide B4/B5/B6, using G11 shared builders: +Z glazing, two rounded -Z corridor entrances, +X teal/gold TV cladding (B6 camera-left) and -X black reflective panels (B6 camera-right), corrected per owner. A TV and console were added while preserving the original 15 furniture objects and eight seat identities. The 6.6 × 5.4 m extent, opening profiles and neighboring seams need owner review. Plain ceiling remains hidden by default. See blocks/ground/g10/README.md.

G9/G10 merge correction: G10 is LEFT of G9 in the owner front view. G9 white outer passage wall is the same partition as G10 black side wall, with equal length. Layout keeps furniture orientations, shifts G10 left, and aligns its structural depth to 6 provisional meters only in composition. Prior TV-wall seam/right-side placement is superseded. See layouts/README.md.

G9/G10 partition material correction: the shared boundary is a SINGLE mildly dark tinted glass panel with geometric pattern and brass edging, not separate white/black solid faces. The composed layout uses patterned-smoked glass; tint, motif and height remain visual approximations from Cor1 and owner screenshot.

G11 is now attached to G10 left wall in the existing layouts/ground/g9-g10.json assembly: front-view order G11, G10, G9. G11 yaw 90, translation [-15.58,0,0]; entrances align with common corridor. One shared solid partition at X=-11.98 replaces G10/G11 duplicate source walls. Teal/gold finishes follow source shells pending owner refinement; G9/G10 patterned glass remains separate. Source furniture and IDs are live and preserved.

G16 Window lounge is now authored independently in blocks/ground/g16 from normal/wide G20/G23 and g16 ROIs. Six seat slots (G1/G2/G4/G5/G6/G7), one sofa, four armchairs, Table_G1/Table_G2. Background Table_G5 is contextual pending boundary review. Shared square-stone/round-glass table variants and curtained glass approximate the local furniture/windows. Large neighbor arch, pale walking strip, working footprint and wall extents need owner review. No automatic merge into the existing assembly.

Owner correction for G16: the arched partition behind Seat_G7 spans the full width, including the G1/G2 half. G23 is at the entrance from B-zone via G9 empty-side passage. The walking route enters beside G1/G2 and turns left into the onward G-zone route. Local path width/placement and arch proportions remain estimated; global seam alignment is pending. Preserve owner-saved chair positions/rotations.

G16 floor/material correction: white walking floor fills the lower-left area beside the entry and left turn, while the strip beside G2 is dark checked seating floor. Back glazing behind G4-G7 is glass only; its earlier curtain interpretation is superseded. Furniture edits are retained.

G18/G20 merge review: combined test changes are valid and retain prior layout/G16 work. G18 owner correction swaps opposing top/bottom seat IDs only, with sofa slots reversed to preserve visible columns; saved transforms and stable object IDs remain unchanged. Two rightmost Table_G1/G2 context copies removed from G18 and linked to G16 owners. G18/G20 wide captures are available and now linked; older absence claims are obsolete.

G16/G18 pair is composed at `/?layout=ground/g16-g18`: G18 trimmed context-table end joins G16 left full-width arch. Source furniture preserved. G18 floor now stops one tile beyond G10 at Z=-4.2; prior 10.4 m context crop is superseded by 8 m length, center [0,-0.2]. White walkways load in the combined view. Width mismatch/outer edge returns remain provisional; see layouts/README.md.

G16/G18 width alignment correction: G16 shell now spans 8.4 provisional meters (-3.2 to 5.2 local Z) matching G18 in the paired layout; floor edges, arch and glazing align with no 0.4 m offsets. G18 glazing reaches the trimmed floor edge. Furniture transforms are unchanged. Prior 7.6 m G16 shell width is superseded.

G20 owner correction: top/bottom seat IDs swapped between opposing rows, matching the G18 correction procedure. Sofa slots reversed during transfer for visible-column correspondence. Furniture transforms and physical IDs preserved; evidence correspondence updated and source ROI files unchanged.

G20 extension: the existing `/?layout=ground/g16-g18` URL now composes G20 → G18 → G16, left to right in the owner front view. G20 uses yaw -90 and position [-14.8,0,1]; its G31/G24 end meets G18 at global X=-11. A single layout-owned full-width arch matches the G16/G18 arch profile (8.4 m shell span, 7.9 m opening width, provisional). All outer edges align at Z=-3.2 and 5.2. White pathways continue through both arches. Source furniture transforms and owner-corrected seat IDs are preserved.

Six-block B/G composition is now at layouts/ground/b-g-lounges.json. G row joins the rear/sofa/glazing side of B/C row (B3/B4/B12/B16 side), leaving the B front corridor opposite. Paired bay lengths: G9/G16 7.2, G10/G18 8, G11/G20 7.6 provisional meters. Open G9 passage connects to G16 white path. Shared rear panes owned by B blocks; duplicate G18/G20 interface glazing suppressed only in composition. Source furniture preserved; only wall-attached context receives explicit offsets with shell corrections. Earlier layouts and source blocks stay independent.

G2 arrival reception/exit block added independently at blocks/ground/g2. E13 is the only primary camera and reception R1 is its only ROI. Owner confirms exit below camera, reception in half of forward span, open approach in the other half, G20 right and G21 left in camera-view reference. G26/G27/G4/G5 wide views support neighboring arch/path interpretation. Two staff-chair identities are temporary placeholders; no neighboring lounge seating is duplicated. Exit is an open metadata connection because hardware is below frame. Footprint, backing, side arches and dimensions need owner review. No automatic merge into existing B/G layout.

Zone C pods/approach is authored independently in blocks/ground/zone-c-pods from the map Zone C label behind G2 arrival reception and Cor2 top-left pod view. Two privacy-pod modules, no lounge seating or seat/table IDs. Provisional one-lounge-bay footprint 7.6 × 6 m, with clear pale route toward G2 and broad arched surround. Cor2 primary; C2/C22/E13 supporting views. No customs/checkpoint fixtures or reception duplicates. Exact footprint, pod spacing/depth and shared arch ownership await owner refinement before merging.

Zone C owner material/layout refinement: preserve edited pod/planter positions, rotations and scales. Dark tiled floor now covers +X strip from 2 to 3.8 below pods and pots; all other floor white. Blue-tinted glass with gold rosettes/lattice on both X sides. At reception edge Z=-3 only X=0..3.8 is glass; remaining half stays open. Broad +Z arch retained. Pattern, tint and dimensions approximate supplied reference. This supersedes original pod-strip orientation/route assumptions.

Zone C half-pane correction: reception-side half glass is clear transparent standard glazing like G18, without blue/gold pattern. Only the two full side panes retain the blue/gold finish.

G2 exit update: owner gate photo now supports a double automatic sliding glass gate with fixed side panes and sensor post at the front +Z exit edge. Shared automatic-glass-gate builder; select gate and edit Gate opening (%) then Apply adjustment/Save for static closed/open preview. Dimensions provisional; no real gate integration. This supersedes earlier unmodeled exit-hardware statements.

G2 gate refinement: scanner stand removed; overall glass gate height including top header now matches the provisional 4.1 m wall height. Double sliding leaves and opening preview retained.

Zone C latest glass correction: behind-pod glass and reception half-pane now use patterned-smoked glass, matching the G2 reference with narrow frosted geometric band and brass frame. Only the opposite full pane keeps blue/gold rosettes. This supersedes previous clear half-pane and blue/gold behind-pod finishes.

The B/G layout now also includes G2 and Zone C at its west end, using the owner/map adjacency: G2 alongside G20 G30/G37 end, Zone C alongside G11 C5/C8 end. They share the aligned 8.4 m end bay (X=-29.38..-20.98). G2 rotates 180 so its gate faces outer exit edge and its reception backs onto Zone C. Zone C owns the single reception half-pane and closed G11 side glass; the remaining reception half stays open. G2 owns the arch into G20. Integration-only shell/attached-object corrections are in layouts/ground/b-g-lounges.json; source blocks remain independent. Opposite G2 arch awaits G21.

G2 owner refinement: preserve the manually saved rearward reception/chair/monitor poses. Match dark reception strip depth to G18/G20 seating banks (2.8 provisional m, approximately 4½ tiles). Add white pillars with dark skirting at the rear opening center and right edge using E13 wide evidence; dimensions estimated. The B/G layout aligns these with its reception/Zone C seam. Shared rounded-arch supports now broaden by 0.12 m per side at floor level and taper back at the spring, including low-wall views; this applies to all areas without changing source opening spans or furniture.

Arch profile correction: supersedes the tapered-foot profile above. Carry the 0.12 m per-side widening uniformly from the floor to the spring, and reduce the ellipse horizontal radius by the same amount. Vertical piers meet the elliptical crown tangentially; no pinched waist or separate flared foot. Full and low-wall views and skirting use the same clear width. Source opening metadata and furniture poses remain unchanged.

Latest owner G22 correction: current Seat_G57/Seat_G49 end is local +Z and connects to G21. In B/G composition G22 yaw is now +90, center [-42.58,0,-7.2], and its positive-Z arch owns the seam at X=-38.18. Integration overrides align its shell to 8.4 m and glazing to ±4.15; each furniture bank shifts 0.3 m inward, retaining relative positions, object sizes and scales. G21 and all other layout components, plus standalone G22 data, are unchanged. Earlier opposite-end and 0.3 m edge-step descriptions are superseded.
