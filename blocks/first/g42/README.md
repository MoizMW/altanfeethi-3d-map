# G42 — First-floor paired seating

Run `npm start` and open http://127.0.0.1:4209/?block=first/g42, or select G42 in the header.

This block contains only G42: four individual armchairs in two facing pairs and two round stone tables on brass pedestals. All six objects are editable. The pale rug, adjoining dark access strip and immediate stair-side glass guard provide local context. The lift, display console, checker-pattern lobby floor, plants, bins, stairs/escalator and neighboring groups are outside scope.

| Physical object | ROI identity | Main evidence |
| --- | --- | --- |
| Lift-end outer chair | Seat_H17 | H19 |
| Lift-end inner chair | Seat_H18 | H18 |
| Screen-end inner chair | Seat_H19 | H19 |
| Screen-end outer chair | Seat_H20 | H18 |
| Lift-end round table | Table_H8 | H18 |
| Screen-end round table | Table_H9 | H19 |

Pairing is provisional: H17/H18 around Table_H8, H19/H20 around Table_H9. Opposite views show repeated front/back observations; each chair exists once. These chairs have tan shells, light cushions and dark star bases in the photos, represented by the shared `shell-lounge` variant. This evidence-supported finish differs from the blue upholstered lounge-chair default. Geometry and material identity remain approximate.

Local +X runs from lobby-side access toward the railing. +Z runs from the screen-side end toward the lift-side end. The 3.2 × 8.6 m crop, 4.1 m ceiling estimate, spacing, chair angles and guard dimensions are provisional. The floor is a working crop, not a surveyed room. Map anchors and headings are retained as evidence; no world calibration, first-floor elevation or neighboring merge is assigned.

Both normal snapshots and H18-wide were reviewed. No H19-wide file is supplied. Detection ROIs apply to the normal 1920 × 1080 images only; historical authoring resolution is unrecorded. Table_H8 reaches y=1080. Original annotations are unchanged and are not interpreted as world coordinates.

The four JSON files are authoritative. Save block updates only `objects.json` with backups and revision checks. Structural edits use `architecture.json`. Stable physical `g42-...` IDs remain fixed when external labels change. Run `npm test` before handoff. Pair/table correspondence, exact dimensions and structural boundaries await owner review.
