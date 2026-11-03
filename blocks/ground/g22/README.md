# G22 · Window passage lounge

Run `npm start` and open http://127.0.0.1:4209/?block=ground/g22, or select G22 in the editor header.

## Evidence and inventory

This block is camera group **g22**, comprising G7/G8/G9/G10. Camera G22 belongs to the separate G20 block.

The draft contains two cream two-seat sofas, nine teal armchairs, four oval coffee tables and one dark open shelving divider. Five side/support tables, four lamps and four plants bring the total to 29 editable objects. The center plant and two small lamps rest on their support tables.

| Furniture | Occupancy labels | Primary views |
| --- | --- | --- |
| Reflective-side sofa 1 | Seat_G50 / Seat_G51 | G8, G9, G10 |
| Reflective-side sofa 2 | Seat_G54 / Seat_G55 | G8, G10 |
| Reflective-side armchairs | Seat_G49 / Seat_G52 / Seat_G56 | G8, G9, G10 |
| Curtain-side armchairs | Seat_G57–Seat_G62 | G7, G8, G9 |
| Reflective-side coffee tables | Table_G15 / Table_G16 | G8, G9, G10 |
| Curtain-side coffee tables | Table_G17 / Table_G18 | G7, G8, G9 |

All four normal and all four wide frames were inspected. All eight chair/table ROI files were overlaid on the normal 1920 × 1080 views and inspected. Twenty-three chair observations reconcile into thirteen seat slots. Twelve table observations reconcile into four main tables. **Seat_G53 is absent from the source annotations** and is not invented. Sofa slot order and the central Seat_G52 chair need human confirmation.

The floor-map crop [6300, 5550, 7950, 6900] was reviewed around the four registered mounts. Its sofa symbols on the curtain side conflict with the current photos: G7 shows six separate armchairs. Current photographed furniture takes precedence. The map remains the topology reference; no pixel distance is treated as meters. Detection ROIs apply only to normal views.

## Architecture and appearance

Local +X crosses the pale walkway from the reflective sofa bank toward the curtain armchair bank. Local +Z runs from Seat_G49/G57 toward Seat_G56/G62; Y is up. The 9 × 8.8 m working footprint, 2.8 m path and 4.1 m ceiling are estimates. Registration anchors/headings and a registration hash are retained without claiming a map transform or camera calibration.

Both ends of the walkway remain open. Side glazing uses the shared schematic builder. Wide G7/G10 show curved surrounds/pier returns, but their full geometry and neighboring ownership remain unresolved. Curtains, patterned lower glazing, detailed ceiling features and adjacent seating beyond this bay are excluded. The owner-confirmed G21 seam is now composed provisionally; metric alignment still requires review.

Furniture and finishes reuse the shared builders and `MATERIAL_GUIDE.md`. The square wood plant stand is approximated by a round support table, glass/brass side tables have simplified opaque tops, and the two tabletop lamp designs use scaled shared lamp geometry. Upholstery patterns, shelf artifacts and foliage are approximate. Reflections are not duplicated. Use Screen, Walls, Low walls and Ceiling to inspect the draft.

## Review and persistence

Review top/isometric views, the thirteen seat labels and their correspondence against all cameras. Confirm the missing G53 annotation, chair orientations, bay dimensions, architectural extents and neighboring ownership. Correct seat IDs independently of stable physical object IDs. The four JSON files are authoritative; Save block writes only objects.json with backups and conflict checks. Architecture edits use architecture.json.

Run `npm test` and `node --test blocks/ground/g22/validate.test.mjs`. The contribution branch is `block/ground-g22`; architecture, correspondence and dimensions remain subject to owner review before acceptance.

Local verification on 2026-11-02: isometric/top browser views inspected, G7 wide evidence loaded, a temporary G49 rotation saved and survived reload, then restored to 0 degrees and saved again. Automated ROI/path/bounds/support tests pass. This functional check does not replace owner acceptance of correspondence, dimensions and architecture.

Owner merge update: full-width arches now close both end surrounds while preserving the clear central passage. The 9 m shell and saved furniture stay intact. In `/?layout=ground/b-g-lounges`, G22 sits left of G21, which sits left of G2. G22 owns the shared G21/G22 arch; G21’s local preview arch is suppressed there. A provisional 0.3 m width step at each side preserves G22’s furniture without scaling.

Latest owner G22 correction: current Seat_G57/Seat_G49 end is local +Z and connects to G21. In B/G composition G22 yaw is now +90, center [-42.58,0,-7.2], and its positive-Z arch owns the seam at X=-38.18. Integration overrides align its shell to 8.4 m and glazing to ±4.15; each furniture bank shifts 0.3 m inward, retaining relative positions, object sizes and scales. G21 and all other layout components, plus standalone G22 data, are unchanged. Earlier opposite-end and 0.3 m edge-step descriptions are superseded.

Latest compact C/G revision: G21 and G22 span 7.4 m each; the shared G12/G14 spans 14.8 m, with cross-room depths unchanged. Source dimensions/positions synchronize with composition. Combined seams: G21/G22 -36.78, G22/G27 and C/G17 -44.18. Downstream G27/G28/G29/G17 move +2.8 m to retain joins. Furniture sizes/labels and walking connections are preserved. C-lounge source furniture now loads directly without additional offsets.
