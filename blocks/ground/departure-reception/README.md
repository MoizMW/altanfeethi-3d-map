# Departure_Reception — reception, entrance and e-gates

Open [Departure_Reception](http://127.0.0.1:4209/?block=ground/departure-reception), or choose **Departure_Reception · Reception, entrance and e-gates** in the editor. Run `npm start` from the repository root if needed.

## Scope and inventory

This is one editable zone covering groups **g30** (main reception), **g1** (exterior entrance) and **g31** (two-lane e-gates). All five registered cameras retain their original groups. Two SGS cameras provide neighboring context only.

38 independently editable objects include:

- One continuous main reception desk with three observed monitor stations, three owner-requested staff chairs, lower wood worktop and two drawer pedestals.
- One smaller counter beside the entrance with a drawer pedestal.
- One teal glass backdrop with simplified brand/leaf etching, two stone relief flanks, three schematic framed portraits, detailed Saudi and Altanfeethi standing flags and three metallic pendant lights.
- Four countertop access terminals and a welcome notice.
- One exterior sliding-glass entrance, its access post and two potted plants.
- One **two-lane swing-flap e-gate bank**, sharing three rail bodies, with two approach reader posts. Its opening amount is a static editable preview.

The owner confirmed one chair in the side-counter staff strip and requested three behind the main desk. They use temporary editable IDs `Seat_DepRec_TMP_01`–`04`, not approved occupancy-system identities. The supplied three g30 `R1` ROIs describe reception areas, not chair identities. A loose office chair in the normal foyer views is absent in the paired wide view; its permanent location and staff chair count remain unverified. Portraits remain schematic. Flags use sourced vector artwork on folded fabric; their stands, drape and dimensions remain estimated.

## Side-wise evidence

Local coordinates remain unchanged. In the owner’s latest screenshot looking from the main desk toward entry, **screen-right is −X**, containing the moved small counter and SGS approach. +X is the e-gate side; +Z points toward the exterior entry. The owner’s right-side correction below supersedes the initial rear/right SGS interpretation.

| Side / feature | Cameras reviewed | Result |
| --- | --- | --- |
| Main desk and rear backdrop (−Z) | ReceptionCam1, ReceptionCam2, ReceptionCam3 — normal and wide | Front/rear views reconcile one desk, three monitors, stone-and-teal finishes, etched teal backing, pendant shades and flags. |
| Exterior entry (+Z) | ENTRANCE, ReceptionCam2, Egate1 — normal and wide | Sliding glass entry, distinct small side counter, access post and plants. Reflections do not create a second doorway/counter. |
| Right / e-gate side (+X) | Egate1 and all three ReceptionCam views — normal and wide | Two swing lanes with three rail bodies; independent from the full-height entrance doors. Interior-side passage remains open. |
| SGS-side passage (owner screenshot right / −X) | ReceptionCam2, Egate1, SGSCam2, SGSCam4 — paired views | Owner correction: pale foyer ends at moved side-counter front; counter/chair take a dark staff strip, with a separate dark path beside its end toward SGS. No SGS meshes are copied. |
| Left / obscured side (−X) | ReceptionCam1/2, ENTRANCE, Egate1 — paired views | Navy branded construction-area hoarding is temporary. Final architecture behind it remains unknown and is not invented. |

The floor-map crop supports the adjacency of reception, departure entry, e-gates and SGS. Its schematic two-seat counter symbol does not override the three monitors visible in camera views. Map coordinates/headings are preserved as anchors, not used as calibrated world positions. A focused check of nearby `EXIT` wide showed a different external glazing bay without direct overlap, so it is not used to reconstruct this zone.

## Construction exclusions

The model excludes navy construction hoarding, ladders, buckets, tool/material carts, board stacks, sacks, plaster debris, loose tracks and detached glazing leaning against piers. Temporary protective sheets/mats, cable coils, packing, loose chairs and desk clutter are also excluded. In particular, a loose glass frame leaning against a pier is not interpreted as a permanent window, and branded hoarding is not turned into a finished wall.

## Coordinates, materials and uncertainty

The provisional 13.8 × 10.4 m floor crop is centered at `[1.1, 1.2]`. The foyer and staff side use pale stone; dark stone remains at the entrance perimeter and SGS/interior approaches. Ceiling height stays at the project estimate of 4.1 m; an optional plain ceiling is hidden by default. Pendants have estimated suspension heights.

Teal glass, pale counter stone, wood, brushed metal and relief stone reuse shared builders and opt-in local variants. The teal backdrop is an editable wall-panel with no duplicate structural wall behind it. **Low walls** helps inspect the gate and entry connections; hide **Partitions** to inspect behind the tall backdrop/flags if needed.

All metric dimensions, pier extents, counter placement, side-counter orientation, gate spacing, exact chair poses/identities and global seams require owner review. No finished enclosure is invented behind temporary screens. The SGS/interior connections are local topology references only; this new zone is not automatically merged into G32 or other floor layouts. Agree shared pier/boundary ownership when a composition is requested.

All listed normal/wide images are available through editor evidence buttons. Existing reception ROI polygons stay attached to normal images only. Save/reload uses this block’s own `objects.json`; stable object IDs use the `departure-reception-` prefix.

Validation: all 35 project checks passed, including both swing-gate opening states and clear entrance/SGS routes. Top, isometric and full-height shell views were reviewed, and Save block/reload was verified on 2026-11-02.


## Owner right-side refinement (2026-11-02)

The side counter’s saved position, rotation, dimensions and all other existing object edits are preserved exactly. The pale foyer now ends near its front at local X≈−3.55. Black/dark stone begins beyond that edge and continues toward SGS.

The counter and its newly owner-confirmed staff chair occupy a roughly 2.25 m strip, with the drawer pedestal retained where the owner saved it. This staff strip is not treated as a full-width walking route. A separate clear dark-tiled approach beside the counter’s inner end leads through the −X block edge toward SGS. The route and staff strip are recorded separately in `architecture.sgsSideApproach`; the route has provisional 2.0 m clearance. Existing main desk, e-gates, entrance and other furniture are retained.

Only the right-side approach is refined here. This is not a full SGS composition, and no G32 furniture/walls are copied. Exact widths, staff chair identity and the eventual block-to-block transform remain pending. The loose glazing frame leaning against the pier in ReceptionCam2 remains excluded as temporary construction stock.


## Owner chairs, flags and wall returns (2026-11-02)

Three dark office chairs now sit behind the main desk, one per workstation, in addition to the existing side-counter chair. IDs remain temporary and editable. Both counter poses and all unrelated saved objects are retained. The two flag stands move outward to X=±2.8 to clear the staff seats.

The Saudi flag now carries the Shahada and sword from sourced vector artwork. The ivory Altanfeethi flag uses the official bilingual logo geometry with dark lettering, following ReceptionCam3. Each has an actual metal pole, circular base, folded cloth and readable reverse artwork. [Artwork provenance](../../../shared/assets/flags/README.md) includes preserved source vectors; no external downloads occur while using the editor.

A full-height wall now bounds the inner/right end of the side counter and `DepRec_TMP_01` staff strip (local Z≈2.45, X −5.8 to −3.55). The existing wall after the main reception gains a perpendicular leg toward SGS: from its end at `[−4.25, −1.4]` to `[−5.8, −1.4]`, forming an **L**. The dark route between these two returns remains open. **Low walls** shows these walls cut away at 1.05 m; turn it off to inspect their full height.

Wall extents and chair poses are estimates. Construction stock, including the detached glazing leaning against the real pier, stays excluded.


## Rear wall and forward desk correction (2026-11-02)

The main reception desk, its three chairs, monitors, readers, notice and drawer pedestals move forward together by an estimated 0.65 m. Both flags stand behind the chairs, between the two rear doors, at X=±1.65. The side counter and its chair, entrance, e-gates and SGS approach remain unchanged.

ReceptionCam3 wide shows **one blue rear wall with a blue service door on each side**. Two closed door leaves now carry subtle edge/pivot detail in the same blue finish; stone relief remains on the left/right flanks. This is a closed-door appearance preview: unseen rooms and door swings are unresolved. This correction supersedes earlier outer flag positions. Desk shift and door dimensions remain estimates.


## Side cladding and gate alignment correction (2026-11-02)

The registered camera mounts/headings for ReceptionCam1 (151°), ReceptionCam2 (273°), ReceptionCam3 (69°) and Egate1 (299°) were reread and compared with their opposing wide views. These headings are evidence, not a calibrated camera-to-world transform.

Cream stone relief belongs to the **inward faces of the perpendicular side walls**. The existing two cladding objects now rotate onto those side walls; they no longer form textured strips across the rear blue plane. This supersedes the earlier rear-flank interpretation. Side returns extend forward by the desk’s 0.65 m shift, with the SGS-side L leg kept connected.

The e-gate bank and both readers move 1.2 m forward together, preserving their owner-saved X positions. Its nearest rail starts about 0.43 m beyond the counter front; pale flooring follows the gate approach. Desk/chairs, flags, blue rear doors, small side counter and other saved objects are unchanged. Dimensions and clearances remain provisional.


## Shared security and unused-counter bays (2026-11-02)

[Open reception + SGS together](http://127.0.0.1:4209/?layout=ground/departure-sgs). The combined preview reads both original source blocks live. Edit furniture in its source block; the combined view is for spatial review.

The owner identifies the existing entrance-side counter as **security**. Its opening, position, rotation, chair and drawer pose remain unchanged. Its back is closed by the SGS kiosk-side wall. This common wall belongs to G32.

Farther in (above security on the owner's map, local −Z), one **unused dark counter with a glazed upper section** occupies the bay between the SGS approach wall on the left and the cream reception side wall on the right. It has no invented chair, workstation or occupancy ID. Its dimensions and finish interpretation are provisional. The short L leg is shortened to leave 1.15 m access into this bay, while retaining the L-shaped corner. The dark connection between reception and SGS stays open.

Standalone Departure_Reception displays two clearly recorded shared-wall reference proxies so the bays do not appear open-backed. In the combined view those proxies are excluded and the actual G32 source walls render once. SGS furniture is never copied into this block. The SGS preview transform is 90° and `[−9.1, 0, 2]`; it aligns the visitor-facing wall with local X=−5.8 and remains a topology-based estimate, not measured global calibration. The composed SGS floor crop ends at that seam; its source crop and all existing G32 object poses are preserved.

Temporary navy hoarding, detached glazing leaning on the pier, board stacks, sacks and other construction stock remain excluded. The unused counter is included because the owner confirms it is installed and currently unused. All 36 checks pass, including shared-wall uniqueness, closed security backing, both walls beside the unused counter, and clear passage/access in full-height and cutaway views.

Latest owner shared-bay widening (2026-11-02): nominal wall-to-wall width increases from 1.55 m to 3.2 m (2.06×). Shared SGS boundary is X=−7.45, with composition transform [−10.75,0,2] at 90°; original SGS object poses are untouched. The intermediate counter is now a 2.6 m version of the main reception pale-stone/teal/wood counter, without active equipment. Security keeps its pose and closed back. L-side access grows to 2.8 m. Earlier narrow-bay/dark-glass-counter and alignment values are superseded; absolute dimensions remain estimates.

Owner small wall corrections (2026-11-03): remove short front L stub at unused/lower counter; full 3.2 m bay mouth now open. Add security entrance-side closure from SGS backing X=−7.45 to existing entrance frame X=−5.2 at Z=5.95. Main entrance and SGS passage retained; no furniture moves. This supersedes prior short-L notes.


## Rear floor trim (2026-11-03)

Trimmed the spare floor behind the main reception wall: the rear edge moves from local Z=-4 to Z=-3.55, aligned just outside the wall. The crop is now 15.45 × 9.95 m, centered at [0.275, 1.425]; the front edge stays at Z=6.4. Footprint and optional ceiling follow the crop. Furniture and all walls and routes retain their saved positions. Combined previews inherit the trimmed source floor.


## Plant wall and gate scanners (2026-11-03)

Removed the solid entrance-right wall behind the plant (local X=5.55, Z=4.8–6.1). Adjacent glazing and the gate pier remain. The two e-gate readers are now compact scanners mounted on the approach ends of the entrance-side and middle gate rails, with their freestanding poles removed. Stable reader IDs and other saved furniture poses are retained. This supersedes earlier approach-post descriptions.


Owner follow-up (2026-11-03): also removed the gate-front white pier between the plant and e-gates. The second scanner keeps its saved rail mounting position and now has an estimated 0.40 m pole below the scanner head (0.65 m total assembly above rail). The first scanner is unchanged. This supersedes the earlier retained-gate-pier note.

Owner height match (2026-11-03): both e-gate scanners now use the same raised pole assembly and mounting height, matching the owner-approved left scanner in the screenshot. Horizontal positions remain unchanged. This supersedes the earlier first-scanner-unchanged note.


## Reception wall portraits (2026-11-03)

Replaced the three schematic abstract pictures with portrait textures recreated from ReceptionCam3 wide, in the same left-to-right order. Existing frames, positions, sizes and object IDs are retained. Artwork is an AI-recreated visual approximation rather than original official prints. Local texture assets and provenance are in `shared/assets/portraits/`. This supersedes earlier schematic-portrait notes.
