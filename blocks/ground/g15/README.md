# G15 · Security checkpoint

Run `npm start` from the repository root, then open http://127.0.0.1:4209/?block=ground/g15 or select **G15 · Security checkpoint** in the header. Install dependencies with `npm run install:app` if needed.

The live registration assigns **C8, C15 and C16** to ground-floor G15 in Zone C. Their images show the map's Custom Check Point. This draft contains 13 editable objects:

| Equipment | Count | Evidence |
| --- | --- | --- |
| Blue baggage scanner with integrated in/out roller beds | 2 | C8, C15, C16 |
| Walk-through detector frame | 2 | C8 |
| Lane divider | 2 | C8, C15, C16 |
| Dual-monitor operator console with pedestal/keyboard tray | 2 | C15, C16 |
| Staff office chair | 2 | C15, C16 |
| Central information kiosk | 1 | C8 |
| Central rectangular planter and wall-side tall plant | 2 | C8, C16 |

Each scanner appears once even though C8 and its operator-side camera show it separately. Roller beds are components of the selectable scanner; each pair of monitors is part of one selectable operator console. Screens are placeholders. The right detector's closed-belt cue follows C8 and is a static draft detail.

## Evidence and identities

All three normal snapshots and supplied wide captures, both C15/C16 reception ROI overlays and the ground-floor map crop were reviewed. Each reception file's `R1` is a region around a scanner/operator area. It is neither a table identity nor a physical reception desk. C8 has no supplied G15 ROI.

There are no G15 chair ROI identities. `Seat_G15_TMP_01` and `Seat_G15_TMP_02` are temporary editor slots, **not approved CV occupancy IDs**. Replace them after review, preserving physical `g15-...` object IDs.

The older `evidence/rois/table-rois/g15/` files refer to C22/C23/C25. The current registration assigns C22/C25 to G12 and C23 to G14. These seating-table observations are excluded from the checkpoint. Their historical folder names do not override the current camera assignments; see `evidence.excludedRoiAssociations`.

## Coordinates and limits

Local +X crosses from the patterned-glass side (C15 station) toward the pale wall (C16 station); +Z follows the lanes toward the operator chairs/lobby; +Y points up. The checkpoint floor is provisionally 10.4 × 9.3 m. The overall 16.2 × 11.625 m working extent includes the owner-requested Passport and Customs office boxes on local -X. Dimensions and the 4.1 m plain ceiling are unmeasured visualization estimates. Both checkpoint ends stay open. The glazing is schematic and lightly transparent. Curtain backing, side-door positions, neighboring turnstiles, shared boundary ownership and global alignment remain unresolved.

The Passport Office is at the approach end (-Z), and the Customs Office is toward the operator/lobby end (+Z), following the supplied map. Only their checkpoint-facing frontage is glass. Rear walls, end walls and one shared partition are white. Passport and Customs run in sequence along one longer row. Their bottom edge (+Z) in Top view aligns with the checkpoint, and their combined length is 11.625 m versus the checkpoint’s 9.3 m: the checkpoint is 80% of the office-row length. The office row extends 2.325 m toward the top (-Z) of Top view, beyond the checkpoint; it does not extend below the checkpoint. Both offices remain 6 m deep, with provisional 5.8125 m frontages. These proportions supersede the earlier mistaken equal-end interpretation. The C15-facing glass uses a more opaque frosted finish (estimated opacity 0.8). Each office has a distinct closed glass door and a dark vertical pull handle on each side. These are simple empty shells, with no inferred desks or other room furnishings. Room sizes, door/handle placement and partition placement remain estimates.

Both dual-monitor pairs have a shallow inward bend based on C15. Posts, crossbars and mounting brackets are behind the screens; they do not cross the front display faces. The centre kiosk and all saved equipment positions, rotations and scales are retained.

Registered map anchors, headings and a registration hash are retained. ROI pixels remain specific to the normal detection images and are not projected into 3D or onto the wide captures. Curtains, exact frosting, floor veins, labels, live screens and distant gate equipment are not reproduced.

## Editing and validation

Office floor sections meet the glass at X=-5, closing the seam beyond the checkpoint end without overlapping the checkpoint floor. The central kiosk uses `screenScale: 1.3` to enlarge only its display panel; the pedestal and saved object placement remain unchanged.

Move, rotate, resize or recolor equipment using the shared editor. **Partitions** hides lane dividers; **Walls**, **Low walls** and **Ceiling** control the shell. **Save block** writes only `objects.json`, retains backups and rejects stale revisions. Structural edits use `architecture.json` directly.

Run `npm test` and `node --test blocks/ground/g15/validate.test.mjs` before handoff. Follow root `CONTRIBUTING.md` for sharing and ownership review.

Initial validation passed, including current camera associations, equipment bounds and clear detector lanes. Isometric, top and full-wall views were inspected in the browser; all six camera references loaded, selection worked, and Save/reload preserved the authored object records. Owner acceptance of dimensions, arrangement and neighboring boundaries remains pending.
