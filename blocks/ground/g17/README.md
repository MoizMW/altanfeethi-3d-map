# G17 · Diriyah Majlis

Run `npm run install:app`, then `npm start` from the repository root. Open http://127.0.0.1:4209/?block=ground/g17 or select **G17 · Diriyah Majlis** in the editor header.

## Reconstructed draft

Four two-seat sofas and two gold armchairs form a U-shaped lounge against patterned rear glazing and two pale side walls. Four oval coffee tables, one round side table and two tall corner plants bring the draft to 13 editable objects. The corridor-facing side stays open.

| Physical furniture | ROI identities | Main evidence |
| --- | --- | --- |
| Sign-wall armchair | Seat_E2 | E1 |
| Sign-wall sofa | Seat_E3 / Seat_E4 | E1 |
| Rear left sofa | Seat_E5 / Seat_E6 | E1, E4 |
| Rear right sofa | Seat_E7 / Seat_E8 | E4 |
| Plain-wall sofa | Seat_E9 / Seat_E10 | E2 |
| Plain-wall armchair | Seat_E11 | E2 |
| Four oval coffee tables | Table_E1 / Table_E2 / Table_E4 / Table_E5 | E1, E2, E4 |
| Round table between rear sofas | Table_E3 | E4 |

All three normal snapshots, their six chair/table ROI overlays, all three wide captures and the ground-floor map crop were reviewed. Repeated observations resolve to one physical object. There is no G17 Seat_E1 annotation; none is invented. Sofa slot order still needs owner review.

## Coordinates and architecture

Local +X runs from the Diriyah sign wall toward the opposite plain wall; +Z runs from rear glazing toward the open corridor; +Y points up. The 6.8 × 6.8 m working crop and 4.1 m plain ceiling are unmeasured visualization estimates. **Walls**, **Low walls** and **Ceiling** control structural visibility without changing saved geometry.

The wide views support rear blue patterned glazing and the two side walls, but dimensions, frame spacing, opacity and shared boundary ownership remain provisional. E2-wide's lift-lobby arches are outside the majlis; no guessed arch closes its entrance. Pale circulation alongside the seating, temporary stools and neighboring fixtures are excluded pending boundary review. The modeled floor is the dark seating crop.

Current registered camera anchors and the registration hash are retained in `architecture.json`. The illustrated map differs from the photographed furniture; the photographs establish the local arrangement. Global map alignment, neighboring seams and physical scale remain unresolved. Camera headings are not copied into world yaw. Detection ROI pixels apply only to the normal snapshots, never to the wide views.

## Appearance and editing

Uses existing shared lounge builders and material conventions. Gold high-back swivel chairs are approximated by the shared armchair silhouette; the round table's brass pedestal is approximated by ordinary table supports. Rear sofa base colors provisionally follow their greyer appearance in E4-wide. Patterned cushions, frosted geometric glazing, exact chair shells/bases, signage, waste bin and ceiling lighting are not reproduced.

Select furniture to move, rotate, resize, recolor or correct seat/table labels. Physical `g17-...` IDs stay stable. **Save block** writes only `objects.json`, retains a backup and rejects stale revisions. Structural edits use `architecture.json`. See `evidence.json` for source mappings, assumptions and review items.

Run `npm test` and `node --test blocks/ground/g17/validate.test.mjs` before handoff. Follow the root `CONTRIBUTING.md` for review and sharing.

Initial validation passed, including ROI identity reconciliation and entrance/central-access clearance. Isometric, top and full-wall views were inspected in the browser; all six evidence views loaded, and Save/reload preserved the authored object records. This verifies the editable draft, while owner acceptance of the reconstruction and neighboring seams remains pending.
