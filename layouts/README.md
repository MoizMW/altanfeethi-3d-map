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
