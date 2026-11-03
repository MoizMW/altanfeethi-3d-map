# Composing spatial blocks

Open `/?layout=ground/g9-g10`. The combined view loads source furniture live; edit furniture in each source block and refresh the layout.

Owner correction: G10 is LEFT of G9 in the supplied front view, with furniture orientations retained. The shared wall is G9's white OUTER PASSAGE wall and G10's black side wall. Owner material clarification: it is one mildly dark tinted glass panel, with a geometric etched/frosted band and brass edging visible from both sides. Earlier white/black solid faces are superseded. Earlier TV-wall pairing and G10-right placement are superseded.

G9 stays at yaw 0, position [0,0,0]. G10 keeps yaw 180 and translates to [-8.68,0,0]. Entrances and rear boundaries align. The owner confirms equal partition length; `architectureOverrides` adjusts only G10's shell depth from 5.4 to 6 provisional meters and its wall endpoints. Furniture positions/sizes/IDs stay as authored. Source JSON is retained. These structural overrides must be reviewed when source walls change.

Layout components reference blocks with position/yaw. Exclusions suppress only source copies replaced by a shared boundary. `architectureOverrides.floorSize` and `.wallEndpoints` are explicit integration corrections, not furniture scaling. Shared corridor is 2.6 provisional meters wide, with open ends. Dimensions/global map calibration remain estimated. The combined furniture viewer is read-only; placement refinement uses the layout JSON.

For another merge: record owner ordering and reference view; consult registration and relevant normal/wide cameras; place blocks; assign shared boundary ownership; remove duplicate copies in composition; check walking connections and source identities; refine with owner instructions.


## G11 extension

The existing URL `/?layout=ground/g9-g10` now includes G11. Front-view order is **G11 → G10 → G9**. G11 rotates 90 degrees and translates to [-15.58,0,0], placing its +Z side against G10's left wall at global X=-11.98. Its -X entrances face the common +Z corridor. The corridor extends across all three blocks. Source furniture and seat/table IDs load live and retain their local geometry.

The new shared partition replaces source walls g10-side-b4 and g11-side-c1 only in composition. It has one solid core with teal/gold finishes on both faces, using the existing source material interpretation. The owner has confirmed adjacency; detailed material/trim continuity needs review. The previously confirmed patterned smoked glass between G9/G10 is retained. Placement remains provisional and can be refined through owner instructions.

## G16/G18 arch connection

Open `/?layout=ground/g16-g18`. This separate pair uses the owner's images: the right-hand end of G18 meets the left-hand full-width arch of G16. G16 stays at yaw 0; G18 uses yaw -90 and position [-7.2,0,1]. G16 owns the arch once. Source seats and furniture load live; the white circulation polygons and floor grids are retained in composition.

G18's former context-table end is trimmed at local Z=-4.2, approximately one 0.6 m tile beyond Seat_G10's outer edge; floor size is now 8.4 × 8 with center [0,-0.2]. Owner refinement expands G16 shell/arch to the same 8.4 m cross-span. Both floor and side glazing edges align at global Z=-3.2 and Z=5.2, eliminating the earlier 0.4 m offsets. Furniture remains at its saved transforms. Dimensions remain provisional. The corridor has a clear white overlap through the arch; no furniture scaling or duplicated arch is introduced. This pair is not yet merged into the B-zone layout.

G20 extension: the existing `/?layout=ground/g16-g18` URL now composes G20 → G18 → G16, left to right in the owner front view. G20 uses yaw -90 and position [-14.8,0,1]; its G31/G24 end meets G18 at global X=-11. A single layout-owned full-width arch matches the G16/G18 arch profile (8.4 m shell span, 7.9 m opening width, provisional). All outer edges align at Z=-3.2 and 5.2. White pathways continue through both arches. Source furniture transforms and owner-corrected seat IDs are preserved.

## Combined B/C and G rows

Open `/?layout=ground/b-g-lounges`. This six-block layout joins the G row to the rear glazing/sofa side of the B/C row, opposite its front corridor. Camera registration and owner screenshots establish the relative arrangement. The three paired bay lengths match: G9/G16 = 7.2, G10/G18 = 8.0, G11/G20 = 7.6 provisional meters. Bay boundaries are X=1.82, -5.38, -13.38, -20.98; row interface is Z=-3.

G9's rear seating glazing remains, with its passage half open into G16's entry beside G1/G2. G18/G20 interface glass is suppressed in this composition because G10/G11 rear glazing owns those shared panes. No extra solid wall closes the walking connection. Both G-zone arches, the G9/G10 smoked glass and G10/G11 decorated partition retain single ownership.

All six source blocks and the earlier three-block layouts remain separate. Shell bay lengths, endpoints and entrance offsets are corrected only in this new composition through `architectureOverrides`; `objectOffsets` moves wall-attached decoration with its corrected wall. Source seating positions, rotations, sizes and occupancy IDs are preserved under each block's placement transform. These dimensions are relative estimates, not surveyed measurements. Exact frame/pattern continuity and calibration remain review items.

The B/G layout now also includes G2 and Zone C at its west end, using the owner/map adjacency: G2 alongside G20 G30/G37 end, Zone C alongside G11 C5/C8 end. They share the aligned 8.4 m end bay (X=-29.38..-20.98). G2 rotates 180 so its gate faces outer exit edge and its reception backs onto Zone C. Zone C owns the single reception half-pane and closed G11 side glass; the remaining reception half stays open. G2 owns the arch into G20. Integration-only shell/attached-object corrections are in layouts/ground/b-g-lounges.json; source blocks remain independent. Opposite G2 arch awaits G21.

G21/G22 extension: `/?layout=ground/b-g-lounges` now includes ten source areas. Owner front-view order at the west end is G22 → G21 → G2 → G20. G21 yaw -90, position [-33.78,0,-7.2]; G22 yaw -90, position [-42.58,0,-7.2]. Joins are X=-29.38 and -38.18. G2 owns the first arch; G22 owns the second and its far outer arch. G21’s standalone arch is excluded only in composition. All furniture transforms and IDs load live. G22 retains its 9 m width, creating 0.3 m outer-edge steps around the aligned 2.8 m central walkway. Measurements and seam fit remain provisional.

Latest owner G22 correction: current Seat_G57/Seat_G49 end is local +Z and connects to G21. In B/G composition G22 yaw is now +90, center [-42.58,0,-7.2], and its positive-Z arch owns the seam at X=-38.18. Integration overrides align its shell to 8.4 m and glazing to ±4.15; each furniture bank shifts 0.3 m inward, retaining relative positions, object sizes and scales. G21 and all other layout components, plus standalone G22 data, are unchanged. Earlier opposite-end and 0.3 m edge-step descriptions are superseded.

B + C + G extension: the existing `/?layout=ground/b-g-lounges` now includes G12/G14, spanning G21 and G22 at X=-46.98..-29.38. Its C19/C20 end adjoins Zone C; yaw -90, placement [-38.18,0,0.4]. Shell length becomes 17.6 m in composition only, with end seating groups translated ±2.2 m and the central group preserved. Three frontage arches are redistributed; furniture dimensions/scales stay intact. The new front corridor joins the Zone C approach. Shared glazing is owned by G21/G22; the C19 decorative end wall replaces Zone C’s duplicate glass in this layout.

Corner alignment correction: the composed C-lounge front arch line now matches Zone C at global Z=3, with one continuous 2.6 m corridor to Z=5.6. The inner seating/decor group shifts 0.6 m toward the glazing to clear the aligned wall. Furniture sizes and standalone blocks are retained. Earlier 3.8 m frontage descriptions are superseded.

G27 extension: combined layout now has twelve source areas. Current G27 Seat_G69/Seat_G63 end (+Z) attaches to G22 Seat_G56/Seat_G62 end (-Z). G27 yaw +90, center [-51.78,0,-7.2], seam X=-46.98 and outer end X=-56.58. G22 owns the shared negative-Z arch; G27 positive-Z preview wall is excluded only in composition. Shell width and central route match G22, while source furniture loads live with no offsets or scaling. All prior components remain in place.

G28 is included in the B + C + G combined layout at yaw +90, centered at [-60.38, 0, -7.2]. Its current G84/G76 end joins G27 at X=-56.58 with one G27-owned arch. Floor and walkway edges align; furniture sizes and source positions remain unchanged. Dimensions are provisional.

G29 joins the exposed G28 end in the B + C + G composition, through its negative-X arch at global X=-64.18 (yaw 180, position [-65.78,0,-7.2]). G29 now matches the 8.4 m G28 width, with one shared 7.9 m arch. G29 now uses the same dark floor finish as other seating areas, including its standalone view. Furniture is preserved; dimensions remain provisional.

Owner width correction applies to the individual G29 block and the combined layout. Shell width is 8.4 m; walls and ceiling follow it. Furniture positions and sizes are retained for manual editing.

G17 is included in the B + C + E + G combined layout beside G12/G14, with its E9/E10/E11 side against the C lounge. Its 9.6 m span matches G27 directly behind it; the open entrance faces the continuous front walkway. G27 owns rear glazing and the C lounge owns the side partition. Individual G17 now shares the combined 9.6 × 8.6 m shell and furniture positions. Composition uses source positions directly without extra offsets; saved furniture edits appear in both views. Dimensions are provisional.

Individual G17 uses a 9.6 × 8.6 m floor centered at [0,1.2], including its open front walkway. The combined layout applies only placement and shared-wall exclusions. Resize or move furniture in individual G17 and save, then refresh the combined view.

G3/G24/G25 shared dining lounge is composed in front of G9+G10 at [-5.78,0,10.9], yaw 0. Its 15.2 m width matches both bays (X=-13.38..1.82); floor spans Z=5.6..16.2 across the existing pale corridor Z=3..5.6. Arch-side, central service and TV-side walking entries remain open. Source furniture edits and floor inlays propagate directly without additional offsets or scaling. Combined bounds expand to 70.1 × 27.6 m centered [-33.23,2.4].

Dining orientation correction: combined placement is now [-5.78,0,10.6], yaw -90 (90 degrees clockwise in overhead view). The arch side faces the G9/G10 front corridor at Z=5.6. Existing corridor supplies the duplicate local entry-floor strip; the integrated floor is cropped at local X=-5 without altering source furniture. The standalone 15.2 × 10.6 m block stays unchanged. Far TV-side route remains open at both ends.

Latest width correction: individual source is now 15.2 × 15.2 m. Combined rotation stays -90 degrees, with a 12.6 × 15.2 m floor excluding the shared corridor. Its world X edges match G10 leftmost wall (-13.38) and G9 rightmost wall (1.82) exactly. Complete furniture banks shift 2.3 m toward their respective outer walls for additional central space; furniture sizes and pair arrangements remain intact. Arches and floor patterns follow the wider shell.

Owner map-proportion correction: the G9/G16 paired bay is now 5.2 m wide, with depths unchanged at 6/8.4 m and G10/G18 joins fixed. G9 keeps a 3.6 m seating compartment and 1.6 m pale passage. The rotated shared dining room spans 13.2 m across both bays and extends 15.6 m forward; standalone dining floor is 18.2 × 13.2 m including its corridor strip. Furniture sizes are preserved; positions, walls, arches and floor inlays follow the revised shell. Dimensions remain estimates.

Latest owner rebalance: G9/G16 bay width is 5.8 m (G9 passage 2.2 m); G10/G18 composed width is 7.4 m. Combined outer edges and 13.2 m dining width remain fixed; shared seam is X=-5.98. Dining length stays 15.6 m. G9/G16 and dining chairs are slightly larger at 0.94 × 0.94 × 0.98 m, with dining chairs moved 0.12 m back from their tables. Source seat IDs, yaw and manual edits are retained.

Latest owner trial: G9/G16 width restored to 7.4 m; length unchanged, G10/G18 also remain 7.4 m in composition. G9 passage is 3.0 m and seating compartment 4.4 m. Dining is 14.8 m wide × 15.6 m long (source floor 18.2 × 14.8 m), with chairs 1.06 × 1.00 × 1.10 m, tables 1.50 × 0.50 × 0.84 m, wider pair spacing, and slightly larger food counters/piano. Both route ends stay open. Combined span X=-13.38..1.42.

Latest compact C/G revision: G21 and G22 span 7.4 m each; the shared G12/G14 spans 14.8 m, with cross-room depths unchanged. Source dimensions/positions synchronize with composition. Combined seams: G21/G22 -36.78, G22/G27 and C/G17 -44.18. Downstream G27/G28/G29/G17 move +2.8 m to retain joins. Furniture sizes/labels and walking connections are preserved. C-lounge source furniture now loads directly without additional offsets.


### Departure reception + SGS shared counter bays

Open `/?layout=ground/departure-sgs`. Source: `layouts/ground/departure-sgs.json`.

Owner reference is the 2D departure map: security below and an unused counter above it, between SGS and reception. The existing security opening and saved furniture poses are retained. Its back is the SGS wall; the unused bay lies between the SGS approach wall and textured reception side wall. The short L leg leaves access into the bay.

The view reads `ground/departure-reception` and `ground/g32` live; no furniture is copied. G32 owns the shared walls. Departure_Reception's standalone reference proxies are excluded from composition. G32's provisional 90° transform places its front wall at reception X=−5.8. Only the composed floor crop is trimmed to meet that wall seam. Source G32 furniture/crop and existing other layouts remain untouched. Transform, bay spans and widths require owner review; no survey-grade alignment is claimed.

Latest owner shared-bay widening (2026-11-02): nominal wall-to-wall width increases from 1.55 m to 3.2 m (2.06×). Shared SGS boundary is X=−7.45, with composition transform [−10.75,0,2] at 90°; original SGS object poses are untouched. The intermediate counter is now a 2.6 m version of the main reception pale-stone/teal/wood counter, without active equipment. Security keeps its pose and closed back. L-side access grows to 2.8 m. Earlier narrow-bay/dark-glass-counter and alignment values are superseded; absolute dimensions remain estimates.

Owner small wall corrections (2026-11-03): remove short front L stub at unused/lower counter; full 3.2 m bay mouth now open. Add security entrance-side closure from SGS backing X=−7.45 to existing entrance frame X=−5.2 at Z=5.95. Main entrance and SGS passage retained; no furniture moves. This supersedes prior short-L notes.

### Reception, SGS and the cleared A-zone passage

Open `/?layout=ground/departure-sgs-passage`. The new independent `ground/egate-office-passage` source extends the e-gate approach past glass-only former Starbucks frontage, the exterior exit and Altanfeethi office to the G9/B-zone edge. Old A-zone walls/furniture and construction stock are excluded. This preview loads reception and G32 live at their existing placements, with one short glass frontage join and a 0.15 m floor-seam correction in composition only. The original `departure-sgs` and main B/C/E/G layouts are retained.

Passage dimensions, curved pale floor band and office/exit spacing are estimates. A1/A3 normal/wide pairs are identical and neither camera is registered; landmark overlap and owner topology guide the placement. The final shared B-wall reference and open G9 endpoint are awaiting a future merge, which is outside this preview.

Passage refinement (2026-11-03): straight 3 m white walk matches the existing e-gate bank through to G9/G10. Glass frontage gains an estimated 3 m left setback/return; office frontage widens to 7.4 m, matching G9. Earlier curved route and narrow office draft are superseded.

Departure merge (2026-11-03): `/?layout=ground/b-g-lounges` now includes all three live departure sources, for 19 source blocks and 185 seats. The reception/SGS/passage assembly rotates 180° and translates [35.62,0,5.75], joining the G9/G10 front walkway at X=1.42, Z=4.3. All existing B/C/E/G component placements and furniture remain intact. The 3 m approach meets the existing 2.6 m corridor centrally. The dining north-side wall owns the common edge; the passage's standalone A3 wall reference is excluded only in this merged view. The glass setback, 7.4 m office frontage and straight route are retained. Dimensions and overall alignment remain provisional; independent source blocks and departure-only previews stay available.

Office room refinement: office left side now aligns G9's right wall at X=1.42. Room width is 7.4 m, matching G9's full model width, and its 9.7 m length ends at the current exit jamb X=11.12. Office front/back are Z=3/−4.4. G9/G16 own the shared side wall once; office proxies are suppressed here. Saved exit door position, size and opening fraction are unchanged. Earlier frontage-only office dimensions are superseded.
