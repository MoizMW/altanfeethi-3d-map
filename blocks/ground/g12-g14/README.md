# G12 + G14 · Shared C-zone lounge

Open [the editable shared lounge](http://127.0.0.1:4209/?block=ground/g12-g14) with the editor running (`npm start`). Both groups are represented by one block because the owner confirms they share a space. The header selector lists **G12 + G14**.

All eight cameras are included: G12 uses C12/C22/C25/F18; G14 uses C23/C24/C26/E3. Their normal images, wide captures, registered map positions and chair/table ROIs were reviewed together. ROIs apply only to the normal images.

| Physical furniture | Occupancy identities |
| --- | --- |
| C19-end sofa | Seat_C19 / Seat_C20 |
| Central sofa facing +Z | Seat_C22 / Seat_C21, in local slot order |
| Central sofa facing −Z | Seat_C25 / Seat_C24, in local slot order |
| C28-end sofa | Seat_C28 / Seat_C29 |
| Four end-facing armchairs | Seat_C17 / C18 / C26 / C27 |
| Three inner angled armchairs | Seat_C76 / C23 / C77 |
| Six chairs beside the glazing | Seat_C78–C83 |
| Three inner coffee tables | Table_C22 / C23 / C24 |
| Three glazing coffee tables | Table_C25 / C26 / C27 |

There are **21 unique seat slots, four sofas, thirteen armchairs and six ROI tables**. In particular, both central sofas face **one Table_C23**. Four pale round side tables, two brass/glass side tables, two lamps and two plants bring the draft to **33 editable objects**. Unlabelled context tables do not receive invented detection IDs. Repeated observations across the groups map to the same object in `evidence.json`.

Local +Z runs from the C19/C20 end toward C28/C29. Local +X points from the long glazing toward the arches. The estimated lounge is 6.8 × 13.2 m; an additional 1.6 m pale corridor runs along +X. Three provisional rounded accesses connect to this corridor. Dark stone continues through the interior aisle. Both end backdrops have simplified teal/gold cladding; glazing frames and motifs are schematic. One shell and corridor serve both groups, with no wall at their evidence overlap.

The source map supports the elongated room and corridor topology; the photographs establish the current furniture. [Map review overlay](map-review.svg) places the current furniture over the unchanged map using an explicitly approximate affine guide. Its outlines can differ from the illustrated furniture. This guide is not a calibrated camera projection or an accepted global placement. Use the editor's **Top**, **Isometric**, **Walls**, **Low walls** and **Ceiling** controls for review.

Owner review remains necessary for dimensions, furniture yaw/spacing, sofa slot order, three-arch interpretation/profile, exact boundary ownership and placement against neighboring blocks. The chandelier geometry, fine cushion fabric, reflections, exact glass etching and side-table pedestals remain simplified or absent. Global alignment is unresolved; this block has not been inserted into an existing composed layout.

Validation: `npm test` and `node --test blocks/ground/g12-g14/validate.test.mjs`. The latter reconciles both groups' ROI unions, checks evidence coverage, confirms a furniture-free corridor/interior aisle and tests all three access openings.

Owner merge update: now included in B + C + G at `/?layout=ground/b-g-lounges`. C19/C20 end meets Zone C and the lounge fills the combined 17.6 m G21/G22 bay length. Integration overrides extend the shell and translate end seating clusters without scaling furniture. The front pale corridor connects to Zone C approach; the sofa’s decorative backing remains. Standalone JSON remains the editable source.

Corner alignment correction: the composed C-lounge front arch line now matches Zone C at global Z=3, with one continuous 2.6 m corridor to Z=5.6. The inner seating/decor group shifts 0.6 m toward the glazing to clear the aligned wall. Furniture sizes and standalone blocks are retained. Earlier 3.8 m frontage descriptions are superseded.

Latest compact C/G revision: G21 and G22 span 7.4 m each; the shared G12/G14 spans 14.8 m, with cross-room depths unchanged. Source dimensions/positions synchronize with composition. Combined seams: G21/G22 -36.78, G22/G27 and C/G17 -44.18. Downstream G27/G28/G29/G17 move +2.8 m to retain joins. Furniture sizes/labels and walking connections are preserved. C-lounge source furniture now loads directly without additional offsets.
