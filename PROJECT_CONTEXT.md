# Altanfeethi 3D spatial twin — working context

## Current phase

Editor usability now includes object-list search with result/empty states, a reset-view action, saved/unsaved/saving status, save/undo/search keyboard shortcuts and responsive header sizing. Combined views disable editing fields and link selected source-owned objects directly to their editable room; layout-owned surroundings remain view-only. Downloaded combined JSON uses its actual layout name. Transform normalization shares the builder's variant reference dimensions, preserving custom mirror/fixture scale during gizmo use. Merge resolution retains G45 leather-privacy plus incoming tub-chair/window lounge assets and regenerates the inventory from all source blocks.

G45 is authored independently at `blocks/first/g45/` with owner-confirmed lounge-only scope. H15/H16 normal/wide images and all four chair/table ROI files establish seven brown leather armchairs (Seat_H33–H39), five stone/brass pedestal tables (Table_H10–H14), two rounded gold-framed privacy screens, one bin and one extinguisher. The 14 furniture/context objects sit in a provisional 5.4 × 7.2 m dark tiled room with clear central aisle, pale side panels, timber end and reeded glazed entry. H45 normal/wide/reception ROI were reviewed but its distant reception/buffet geometry is explicitly excluded; registration/group metadata is preserved. The leather-privacy variant reuses connected shared chair geometry with brown leather, no fabric weave/pillow; default blue chairs are unchanged. Dimensions, door mechanism, screen profile, pairing and global seams need owner review. Open `/?block=first/g45`.
G39 and G40 are now independent source groups and join G41 at `/?layout=first/private-lounges` in registered map order G39 → G40 → G41. H13/H11/H12 anchors progress down-right; room centers are [-7.2,0,0], [-3.6,0,0] and [0,0,0], yaw 0. Two layout-owned solid partitions replace duplicate source walls; trimmed working floor crops meet and a common 1.4 m front corridor reaches all three sliding entrances. Source furniture is preserved, including G41. Each group has a white two-seat sofa, two blue tub chairs and one organic nested stone table set; TV/flag context plus G40/G41 mirrors give 20 objects, 12 seats H21–H32 and three table IDs H5/H6/H7. G39's H10 image and registration are absent; historical ROIs retain H29, whose rear placement remains lower confidence. Its unobserved mirror is omitted. Dimensions, door hardware, exact slot order and global calibration need review; the existing stair-lobby scene is separate.

G15/G13 combined view is available at `/?layout=ground/g15-g13`. It composes the latest two sources live with all 29 objects and saved IDs/poses/sizes, plus G15 office floors, rooms and handled glass doors. Owner correction moves G13 to G15's top (-Z) approach end and turns it so staff chairs are on the right (+X), gates on the left. G15 stays at yaw 0; G13 uses yaw -90 at [1.3,0,-13.75], with a layout-owned 2 m approach. Owner right-edge correction aligns both right walls at X=5 with one layout-owned connecting segment, and floor edges at X=5.2 via a 0.1 m G13 floor-only extension. Furniture remains unchanged. The earlier bottom-end join is superseded. Connection dimensions and global calibration remain provisional. See `layouts/ground/g15-g13.json` and `layouts/README.md`. Source files are unchanged.

G13 Arrival Passport Control is available in `blocks/ground/g13/`, based on C13/C17/C18/C21, their normal/wide references, all four reception-region overlays and the ground-floor Arrival Immigration map crop. Owner-corrected right-to-left order is fixed glass, glass door, double booth, gate, single booth, gate, end single booth. Four officer positions, four chairs, four monitors, three passenger gates and one information totem make 16 editable objects; the fixed glass is architecture. The totem stands beside the double bank instead of at the rear wall. `Seat_G13_TMP_01`–`04` remain temporary editor slots, not CV identities. The shared double-bank divider is owned once; rear staff circulation stays clear. Slot matching, dimensions, boundaries and global alignment need review. G15 files are unchanged and background checkpoint equipment is not duplicated.

G15 is available in `blocks/ground/g15/` as the current C8/C15/C16 security checkpoint beside Zone C. Both reception-region overlays, all three normal/wide pairs and the map crop were reviewed. Two baggage scanners with roller beds, two detectors, two lane dividers, two dual-monitor consoles, two staff chairs, a kiosk and two plants make 13 editable objects. Staff slots `Seat_G15_TMP_01/02` are temporary, with no CV chair identities supplied. Historical g15 table ROIs refer to C22/C23/C25 now assigned to G12/G14; those observations remain excluded from the checkpoint. Shared procedural equipment builders support editing; all dimensions, side-door/curtain extents, neighboring boundaries and global alignment require review.
Expanded first-floor integration on branch bottom-30% loads at `/?layout=first/bottom-lobby`. Saved merged-first-floor-bottom-right source blocks and G42 are retained independently. G38→G37→G36→G35 order is unchanged; H9 normal/wide establishes G42 across the stair/escalator opening, with H18-wide/H19 supplying lobby context. G42 yaw +90, position [-5,0,10.2] is provisional. Owner correction aligns the stair start with G37 (third bay from bottom, X=-10) and its end beside G35 at the outer wall (first bay, X=2.57). The continuous H2 outer wall closes the far end; the duplicate inner wall and intervening strip are removed. Continuous guards remove the inferred G35/G36 passage. Only the left landing connects the rows; explicit panels leave a real central void. G42 and its lobby context shift together by +5 X. Static stair/escalator descent uses a clearly estimated 3.8 m visual drop. The enlarged layout adds checker inlay, console/ornaments, closed lift, two plants, bins, extinguisher and dispenser without duplicating source seating or G35's plant. All 20 seat IDs and six table identities remain unique; original bottom-right-only URL stays separate. Fixture details, alignment, floor-to-floor elevation and wider-building calibration await review.

G41 is authored independently in `blocks/first/g41/`, using H12/H14 normal and wide views, all four normal-image ROI files, the first-floor map and saved registrations. One pale two-seat sofa, two shared-blue tub chairs and one organic nested stone Table_H5 set resolve Seat_H21–Seat_H24 once. A TV, oval mirror and green flag stand bring the draft to seven editable objects. Pale walls, reeded entrance glazing, owner-confirmed sliding door and rug use a provisional 4 × 4.8 m footprint. The sliding leaf, handles and top track replace the earlier open gap (2026-11-04). H12 is severely underexposed; H14 normal is the clearest reference. Entrance dimensions/hardware profile, sofa-slot order, decorative details and global placement need owner review. Open `/?block=first/g41`; no automatic merge into other first-floor layouts. Shared opt-in variants leave existing defaults intact.

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

Departure_Reception rear-wall refinement (2026-11-02): move main counter assembly, monitors/readers/notice/drawers and three main chairs +0.65 m in Z. Flags remain behind the chairs at X=±1.65, Z=-2.83, between two newly modeled closed blue rear service doors seen in ReceptionCam3 wide. One blue backdrop remains, with textured stone flanks; no unseen rooms inferred. 37 editable objects. Side counter/chair, entrance, e-gates and SGS path retain owner poses. Earlier flag outer-edge placement is superseded.

Departure_Reception chairs/flags/walls refinement (2026-11-02): owner requests main reception seating, recognizable Saudi and Altanfeethi flags, wall beside side-counter staff strip, and an L toward SGS after main desk. Add three dark office chairs behind main reception with temporary Seat_DepRec_TMP_02–04; existing side chair TMP_01 remains. 35 editable objects. Counter and unrelated owner poses retained; two flag stand centers move to X=±2.8 to clear seating. Saudi flag uses Shahada/sword vector artwork and Altanfeethi flag official bilingual mark, with folded fabric and readable reverse faces on metal stands (local assets/provenance in shared/assets/flags). Side-counter wall spans [-5.8,2.45] to [-3.55,2.45]. Existing main side return gains L leg [-4.25,-1.4] to [-5.8,-1.4], leaving the central dark SGS approach clear in full/cutaway views. Dimensions and seat identities remain provisional; construction stock remains excluded.

Departure_Reception owner right-side refinement (2026-11-02): preserve the saved moved side-counter pose exactly (local X≈−4.02, Z≈3.93, yaw≈89.74°) and all other owner edits. Screen-right in owner view corresponds to local −X. Pale foyer now ends near counter front X≈−3.55; dark stone covers counter/staff strip and a separate path beside its inner end leading outward to SGS at −X. Owner explicitly confirms one side-counter staff chair; add temporary Seat_DepRec_TMP_01 without claiming ROI mapping. Staff strip (approx. 2.25 m) and separate route (approx. 2.0 m) are recorded in architecture.sgsSideApproach. 32 editable objects; all original 31 object records remain intact. This supersedes initial rear/+X SGS approach and no-chair assumptions. Main desk/e-gates stay unchanged; no global SGS composition or duplicate G32 meshes.

Departure_Reception zone (2026-11-02): new independent block `ground/departure-reception` combines primary g30 ReceptionCam1/2/3, g1 ENTRANCE and g31 Egate1, with all five normal/wide pairs reviewed. SGSCam2/4 provide side-passage/floor-transition evidence only; no G32 meshes are duplicated or modified. Side-wise findings and construction exclusions are in the block README/evidence. 31 editable objects: one main three-monitor reception desk, a separate entrance-side counter, teal etched branded backdrop/stone relief flanks, schematic portraits/flags, three pendants, drawer units, terminals, sliding exterior entry, plants and a distinct two-lane swing-flap e-gate bank/readers. No staff chair count or occupancy IDs are invented from the loose foyer chair; supplied g30 ROIs are area polygons only. Navy construction hoarding, loose glazing leaning against the pier, ladders, carts, boards, sacks and clutter are excluded; hidden finished boundaries remain unresolved. 13.8 × 10.4 m crop, heights and dimensions are estimates; global SGS/interior composition remains pending. Opt-in shared builders support the observed permanent elements, leaving existing block defaults intact.

G32 latest owner door clearance clarification (2026-11-02) supersedes prior door-at-corner instruction: solid wall continues beyond the door on the left. Exit extent remains Z=0.3–2.1; restore a 1.2 m provisional full-height return to Z=3.3 and move opposite walls, kiosks and adjacent scale outward together. Saudia-end/bottom patterned glass still spans the full side and joins the moved wall. Crop is 13.4 × 6.9 m centered at [0,0.05]. Original 32 counter-row objects are unchanged and temporary construction remains excluded.

G32 permanent-surroundings refinement (2026-11-02): owner says the basic SGS layout is correct and requests wider detail without temporary construction objects. All four normal/wide SGSCam pairs and SGS map crop were reviewed. Original 32 objects/poses/finishes/seat IDs remain intact; four opposite kiosks, a distinct third luggage scale, exit air curtain/marker/push bar and four schematic counter notices make 44 editable objects. The 13.4 × 9.8 m floor crop is centered at [0,1.5], extending toward visitors without moving the counters. Fixed Saudia-end patterned glazing, flynas-end elevated window/glazed exit, pale piers and short opposite wall returns are estimated. The approach stays open; kiosk/return ownership needs future composition review. No security equipment or adjacent reception is inferred. Boards, rubble sacks/offcuts, trim, loose gold fixtures, extra stored chairs and other temporary clutter are excluded explicitly in evidence.json. Shared opt-in kiosk/air-curtain/plain-panel variants and elevated wall segments support the new details; raised window/door heads disappear in structural cutaway. Wide-image buttons are available; original ROI polygons remain attached only to normal images.

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

G3/G24/G25 are authored as one independent editable block in `blocks/ground/g3-g24-g25/`, based on all eleven normal and wide views, ROI reconciliation and registered map positions. Thirty seats and fifteen tables appear once; pale flooring, two arched corridor bays, two schematic buffet counters, wall displays and blue backing are included. Width is the owner-requested G9+G10 sum, 15.2 provisional meters; depth 10.6 m and local layout require review. Global merge is not applied.

G3/G24/G25 shared dining lounge is composed in front of G9+G10 at [-5.78,0,10.9], yaw 0. Its 15.2 m width matches both bays (X=-13.38..1.82); floor spans Z=5.6..16.2 across the existing pale corridor Z=3..5.6. Arch-side, central service and TV-side walking entries remain open. Source furniture edits and floor inlays propagate directly without additional offsets or scaling. Combined bounds expand to 70.1 × 27.6 m centered [-33.23,2.4].

Dining orientation correction: combined placement is now [-5.78,0,10.6], yaw -90 (90 degrees clockwise in overhead view). The arch side faces the G9/G10 front corridor at Z=5.6. Existing corridor supplies the duplicate local entry-floor strip; the integrated floor is cropped at local X=-5 without altering source furniture. The standalone 15.2 × 10.6 m block stays unchanged. Far TV-side route remains open at both ends.

Current compact-bay revision: G9/G16 paired width 5.2 m, fixed left seam X=-5.38 and right edge -0.18; lengths stay 6 and 8.4 m. G9 keeps 3.6 m seating width plus a 1.6 m pale passage. Dining source 18.2 × 13.2 m, integrated 15.6 m long × 13.2 m wide at [-6.78,0,10.6], yaw -90; floor spans X=-13.38..-0.18, Z=5.6..21.2. All 31 checks pass with adjusted route probes. Earlier width/area assumptions are superseded.

Moderate owner rebalance supersedes the 5.2 m compact setting: G9/G16 widths 5.8 m, G10/G18 composed widths 7.4 m, shared seam X=-5.98; combined outer edges stay X=-13.38/-0.18. G9 pale passage is 2.2 m. Dining width/length remains 13.2 × 15.6 m. G9/G16 and dining armchairs enlarged to [0.94,0.94,0.98]; dining chairs move back 0.12 m from tables. All 31 tests and seating bounds checks pass.

Latest owner trial: G9/G16 width restored to 7.4 m; length unchanged, G10/G18 also remain 7.4 m in composition. G9 passage is 3.0 m and seating compartment 4.4 m. Dining is 14.8 m wide × 15.6 m long (source floor 18.2 × 14.8 m), with chairs 1.06 × 1.00 × 1.10 m, tables 1.50 × 0.50 × 0.84 m, wider pair spacing, and slightly larger food counters/piano. Both route ends stay open. Combined span X=-13.38..1.42.

Latest compact C/G revision: G21 and G22 span 7.4 m each; the shared G12/G14 spans 14.8 m, with cross-room depths unchanged. Source dimensions/positions synchronize with composition. Combined seams: G21/G22 -36.78, G22/G27 and C/G17 -44.18. Downstream G27/G28/G29/G17 move +2.8 m to retain joins. Furniture sizes/labels and walking connections are preserved. C-lounge source furniture now loads directly without additional offsets.

Departure_Reception side-cladding/gate correction (2026-11-02): review registered mounts/headings and opposing ReceptionCam1/2/3 plus Egate1 wide views. Cream relief moves from flat rear strips to inward perpendicular side walls. Side returns and attached SGS L follow desk +0.65 m; gate bank/readers move +1.2 m in Z preserving owner-saved X, and pale gate approach extends with them. Main desk/chairs, flags, blue rear wall/doors and small side counter stay fixed. Earlier rear-flank interpretation superseded.

Departure/SGS shared bays (2026-11-02): owner identifies existing small side counter as SECURITY (opening/poses retained) and confirms unused counter farther in between cream reception side wall and SGS approach wall. Add one unused dark glazed-upper counter in Departure_Reception (38 objects), shared SGS wall references closing security back and bounding unused bay, and shorten existing L leg to X=-4.65 for 1.15 m bay access. New layout ground/departure-sgs loads original source blocks live, SGS yaw90 position[-9.1,0,2], shared front wall at receptionX=-5.8. Reference proxies suppressed in combined view; actual G32 walls render once. SGS source objects/owner edits preserved; only composed floor crop meets seam. Transform/dimensions provisional from map, owner topology and ReceptionCam2/Egate1/SGSCam2/4 evidence. Construction stock excluded. 36 checks pass including bay walls and passage access.

Latest owner shared-bay widening (2026-11-02): nominal wall-to-wall width increases from 1.55 m to 3.2 m (2.06×). Shared SGS boundary is X=−7.45, with composition transform [−10.75,0,2] at 90°; original SGS object poses are untouched. The intermediate counter is now a 2.6 m version of the main reception pale-stone/teal/wood counter, without active equipment. Security keeps its pose and closed back. L-side access grows to 2.8 m. Earlier narrow-bay/dark-glass-counter and alignment values are superseded; absolute dimensions remain estimates.

Owner small wall corrections (2026-11-03): remove short front L stub at unused/lower counter; full 3.2 m bay mouth now open. Add security entrance-side closure from SGS backing X=−7.45 to existing entrance frame X=−5.2 at Z=5.95. Main entrance and SGS passage retained; no furniture moves. This supersedes prior short-L notes.

G63 portrait lounge (2026-11-03) is authored independently in `blocks/ground/g63/` from all five normal/wide I29/I30/I31/I32/I34 pairs, the ground-floor PNG crop and registered anchors/headings. Four armchairs plus four two-seat sofas resolve twelve temporary slots, with five main tables, three side tables, flags, portraits and two entrance plants (23 objects). Owner confirms no ROIs exist and authorizes temporary IDs. Width 7.4 m is half G12/G14’s current 14.8 m span; 8.6 m cross-depth gives half its area. Supported solid side/back walls, pale floor/dark threshold, a procedural bookmatched marble backdrop and one broad corridor arch are included. Neighbor glazing/furniture beyond the arch are excluded; dimensions and global seams remain provisional. No combined layout changes.

G63 is now included in the main combined zone at [-32.88,0,9.9], yaw 180, opposite G12/G14 across the front corridor. Entrance arch Z=5.6 meets the checkpoint/immigration frontage at X=-29.18; G15 owns the shared side wall. G63 standalone geometry/furniture is unchanged; source edits load live. All 12 temporary seats and the non-overlapping entrance threshold sections are preserved.

Owner single-arch correction (2026-11-03): G9/G10/G11 access sides each use one broad centered rounded opening, replacing their two-arch/central-pier arrangements. G9 entrance and passage surrounds consolidate into one full-width wall; G10/G11 main-layout opening overrides match the composed wall spans. Source furniture and placements remain unchanged.

Two small I-zone rooms added after G63 (2026-11-03): independent ground/g60 (I37/I42) and ground/i33-lounge (only active I33). Each has two blue armchairs plus one white two-seat sofa, glass coffee table, side table, flag and bin. G60 preserves ROI Seat_I26–I29 and Table_I4; I33 uses four temporary slots, with its unseen second chair owner-confirmed. Main layout centers [-38.43,0,7.7]/[-42.13,0,7.7], yaw 90. Two 3.7 m frontages total 7.4 m, the remaining half of G12/G14. Entries face corridor Z=5.6, depth estimated 4.2 m. G63/G60 own shared walls once. Registration remains unplaced; no mount positions invented.

Small-room finishes corrected after owner furniture edits: preserve G60/I33 objects.json exactly. Both corridor frontages become full-width non-see-through frosted cream glass door assemblies; no solid entry returns/header. Opaque black glass opposite G60 +Z sofa and I33 −Z sofa is shared at X=-40.28, owned once by G60 in composition. Remaining pale walls carry restrained horizontal panel seams. Source G60 reeded inset is superseded.

Small-room owner refinement: the common partition is now cream with a centered 1.9 × 1.45 m opaque grey window (sill 1.1 m, estimates), superseding full black glazing. Both entries have 0.26 m solid cream side pillars supporting 3.18 m of split frosted glass, dark central stiles/track and a dark automatic-open button with a subdued blue ring. One half slides over the other; closed preview, no pull handles. Saved seating is unchanged.

I-zone/dining shared backing correction (2026-11-04): in the main combined view, exclude the duplicate `g3-g24-g25-screen-wall` at Z=21.2 so G57/G58/G59/G61 paneled walls remain visible. G59 composed wall extends 0.08 m to X=-13.38 to meet the dining end. The standalone dining shell, source I-zone walls, furniture, displays and perpendicular buffet-passage seam stay intact.


## First-floor center G52–G55 (2026-11-04)

Owner requests the whole center area from groups G52/G53/G54/G55 and authorizes adjacent camera evidence. Added `first/g52-g55` as one independently editable multi-group block: 32 seats H56–H87 once, ten tables H22/H23/H24/H26/H27/H28/H29/H31/H32/H33. Cross-group ROI overlap is reconciled rather than copied. Adjacent observations H43/H50/H51/H90/H94/H95/H96/H97 and Table_H36 remain outside the center crop.

Reviewed all ten primary normal/wide pairs plus H23/H33/H36/H40/H35/H43 for side passages and neighboring boundaries. H44 remains unplaced; normal image is 3840×2160 and its historical ROI boxes visually align with a 1920×1080 basis. No registration is changed and normal ROI pixels never become metric coordinates. Four curved teal sofas, twelve cream barrel chairs, eight dark leather chairs, two planted gravel tree beds, continuous matte carpet with cutouts, wood end wall/sculpture, low reeded dividers and brass lighting are procedural approximations. Source JSON documents exclusions, evidence and unresolved measurements.

The crop is 10.6 × 22 estimated meters, with +X toward window-side bays and +Z toward the buffet. Side passages and buffet end stay open; adjacent bays, full window shell and buffet furniture are outside these groups. No global placement or merge into the existing stair-lobby layout is claimed. New furniture variants are opt-in; saved existing furniture/placements retain their builders. Tests check unique ROI reconciliation, evidence paths/anchors, finite supported geometry and clear walking routes.

G17 left wall signage added from E1/E4 camera evidence: gold مجلس الدرعية / DIRIYAH MAJLIS, two diamonds and central floral mark, and diriyah.sa. Stored as g17-sign-wall.sign, rendered on the interior face in standalone/main views; low-wall cutaway hides high-mounted signage. Letterforms, relief and dimensions are schematic; furniture and placement preserved.


## Right of center: G46/G47/G49 (2026-11-04)

Owner requests the illustrated right portion adjacent to G52–G55. Added `first/g46-g47-g49`: 16 seats H40–H55, five table identities H15/H16/H17/H19/H20, in one editable row. H19 is one nested table set. H50/H51 and H54/H55 observed by multiple groups are reconciled; center chairs H63/H65 remain excluded from this source. All eight primary normal/wide views are reviewed, including unannotated H52. Neighboring H33/H34/H35/H38/H43/H44/H41 support the join and exclusions. Existing camera registration is retained, including unplaced H44.

Four shell-chair positions at either end of the sofa pair, G46's caramel chairs and long console, curved brass/ring dividers, wood/stone backing, rugs, media column and visible fixtures are procedural estimates. New shell-chair and fixture variants are opt-in; no existing center or other room furniture is changed.

Owner screenshot correction (2026-11-04): `first/center-right` holds the center fixed and places the corrected row at [7.8,0,0], yaw 0, on the right (+X). Side-source X positions, walls, rugs and fixtures are reflected, including yaw and sofa slot order, while retaining Z bay order and dimensions. Floors meet at X=5.3; backing is on the outside right at X=10.2 and the center-facing aisle stays open. This supersedes the earlier left-side placement. It contains 48 unique seats and 15 tables, loading source edits live. Both standalone sources and earlier first-floor layouts remain available. Dimensions, orientations, structural interpretation and global alignment remain provisional.


## G50/G51 merged left of center + right (2026-11-04)

Owner explicitly requests the saved window row on the left in the supplied plan screenshots. Expanded the existing `first/center-right` layout to four live source blocks and renamed it First-floor combined lounges (left + center + right). G50 translates [-7.7,0,-3.85], G51 [-7.7,0,5.75], both yaw 0, retaining the accepted +9.6 m G51 offset. Existing center/right placements remain fixed. All source objects, dimensions, colors, scales, saved seat labels and slot order are retained, including owner label corrections. The merged view has 64 seats and 20 table identities.

Window floors meet the center's left edge at X=-5.3; glazing stays outside at X=-10.0. Composition-only G50 end-wall endpoints align to Z=-10.6 and extend to the center back-wall start, owning the span once. A dark floor-only 2.25 m approach fills the shorter window-row crop through Z=11.4, with no furniture/glazing/curtain stretching and no new enclosing end wall. Both long aisles remain open. All six window normal/wide pairs were reviewed independently with H22/H24/H29 context; no ROI becomes world geometry or moves to a wide image. Dimensions/global alignment remain estimates. Standalone G50/G51 and their prior combined preview are unchanged.

The merged window ornaments exposed a multi-material mesh crash in floor-reflections: material arrays do not carry material.userData. Reflection filtering now checks each material safely; the regression check includes a multi-material ornament. This restores top/isometric view redraws without changing source geometry.


Right display-pillar correction (2026-11-04): owner requests the right column match the left G50 display. `g46-g47-g49-media-column` now uses the existing `cylindrical-display` variant and campaign animation, replacing the partial static-blue stone-clad design. Its physical ID, current saved position/yaw, dimensions and owner scale remain intact. Both standalone and merged scenes load this source change live.

G50/G51 campaign animation merge fix: combined-object caching preserves custom render callbacks, animated screens stay outside static batches, and the demand-driven render loop schedules 15 fps updates only while an animated screen is visible in the camera. Hidden tabs, off-screen displays and reduced-motion preference keep the idle behavior. Idle-media scheduling and clone/batch regressions are covered by render-performance tests. Furniture and campaign timings are unchanged.

First-floor privacy/lobby owner update: G45 remains at [-1.7,0,29.25], yaw -90, touching the empty buffet-width room at Z=26.7. The shared front renders once and the buffet-side wall line remains X=-5.05. In the full merge only, G45 glass entry swaps to X=-5.05 facing the new H88/H89-side lobby; brown end wall swaps to X=1.65 with its cladding facing inside. Two dark floor panels extend the existing window-row/common approach from Z=11.8 to 31.95, meeting neighboring floors without overlap. Standalone G45 and saved furniture are unchanged.

Full first-floor outer glass correction: exclude G56 inset window-side glass in composition. G51 glazing continues from [-10,9.15] along the outer lobby floor edge to [-10,31.8], at the privacy-room end, then joins a solid return to [-5.05,31.8]. This keeps the extended H88/H89 lobby inside the perimeter. Standalone blocks and saved furniture remain unchanged.

First-floor reception/empty-room correction: in the full composition, reception back wall and branded backdrop align with the private-room wall span X=10.15..14.65. The panel is 4.5 m wide; panel and portraits shift +0.6 m, with counter/chairs and source records retained. `components[].objectSizes` provides explicit composition-only size overrides alongside existing offsets. Empty room narrows from 13.8 to 12.4 m (right floor edge X=7.2, wall X=7.05), and a 1.4 m corridor infill joins existing approach flooring. Rear wall endpoints and front return follow the narrower footprint; no duplicate rear-width return remains.

G17 front placeholder: `ground/g17-front` adds an empty 9.6 × 4.2 m floor to the main ground layout at [-48.98,0,7.7], yaw 0. Width matches G17; depth matches adjacent small lounges. The Z=5.6 edge meets G17 without overlap; no furniture or walls are inferred.

G17 front enclosure update: four cream perimeter walls and a centered 1.6 × 2.8 m glass gate now enclose the blank block. Gate faces the white G17 corridor at global Z=5.6. Separate wall returns/header keep the gate clear of solid faces; floor size, placement and lack of furniture remain unchanged.

## G19 construction shell — 5 November 2026

Owner requests an unfurnished G19 from camera angles, the 2D ground map and registered camera positions, explicitly excluding newer wide captures. Normal E5/E8/F1/F2 were reviewed; F1/F2 are registered, E5/E8 remain unplaced. The attached F2 escalator crop is retained as `evidence/references/g19-f2-owner-escalator.png`. No historical chairs, counters, temporary barrier posts, equipment or decorative objects are modeled.

`ground/g19` adds an estimated 11.7 × 12.8 m shell beside G17/front room at [-59.63,0,3.4], yaw 0. Dark stone and a 2.6 m pale crossing join G17's existing Z=3..5.6 path through a glass gate. G17, g17-front and G28/G29 own the other shared partitions; duplicate G19 context walls are excluded in composition. Existing neighboring source poses/objects are preserved. A close review is at `/?layout=ground/g17-g19`; the main B/C/E/G/I layout also includes the shell.

F2's visible escalator foot is a structural `escalator-rise` with rounded handrail returns, landing, glass and treads. Only the lower visible segment is shown; its 1.3 m rise, 2.2 m run and 0.7 m landing are provisional. Upper flight, physical floor elevation and first-floor alignment remain unresolved. Composition now carries source architecture structures through the same rigid transform as the shell, preserving standalone/combined correspondence. Core-return clearance, glass seam, construction exclusions and rotated/elevated structure poses have regression checks.

G19 owner correction: rotate escalator 180° (yaw now 0), add the parallel staircase, and use the existing first-floor stair/escalator design. Both directions now share `buildVerticalCirculation`; five lower treads copy the first-floor pitch and riser height, with matching transverse lane proportions/finishes and one shared lower landing. The pair sits at [-3.05,0,4.8], rising toward local +X, clear of the core return and pale crossing. Exact inter-floor widths and global placement remain provisional. The earlier lone 1.3 m-rise escalator is superseded.

## Unified building dashboard — 5 November 2026

Owner authorizes joining the ground and first floors for a modern main-dashboard experience. `/building.html` loads both existing full layouts live, independently editable via their existing source editors. `/api/building` is read-only. First-floor assembly rotates -90° and translates from the shared lower escalator anchor, elevated by the existing provisional 3.8 m drop. Furniture receives only the rigid floor transform, with dimensions, source identities and seat labels preserved.

Building mode omits both source staircase copies and renders exactly one shared connection. Its 7.6 m run and G19 lane widths fit inside G19 and clear the front-room wall/core return. An upper landing bridge extends the first-floor slab from the old flight start to the new head, within the reserved void. This is a composition-only estimate; source floor files remain unchanged. Physical widths, floor-to-floor height and alignment still require owner measurement/review.

The viewer offers Building/Ground/First/Exploded modes, smooth interruptible camera transitions, independent floor visibility, top/full walls, one-click stair focus, room/seat/table search, click-to-focus bounds and source links. Exploded mode separates the upper floor by 18 visualization metres. Rendering reuses shared detailed builders and cell-based instancing; still scenes render on demand. Reduced motion disables transition duration. Mobile includes a room drawer. No monitoring/occupancy feed or dashboard authentication is added in this scope.

Building full-wall correction: provisional ground walls (4.1 m) exceeded the first-floor elevation (3.8 m), protruding through its slab. The building renderer now clips lower-floor geometry/shadows at elevation minus 0.15 m, below the slab underside with 0.01 m clearance. Cloned lower-floor materials preserve shader hooks and prevent clipping from leaking into upper-floor finishes. The limit is reapplied when walls are rebuilt in either full/cutaway mode. Shared inter-floor stairs and source floor data remain unchanged. Regression checks cover both wall modes, shared materials, and independent upper/connector rendering.
