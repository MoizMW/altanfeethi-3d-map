# G13 · Arrival passport control

Run `npm start` from the repository root and open http://127.0.0.1:4209/?block=ground/g13, or select **G13 · Arrival passport control** in the header. Install dependencies with `npm run install:app` if needed.

## Editable draft

The owner-corrected row runs **right to left: fixed glass → glass door → two-officer booth → gate → single booth → gate → end single booth**. There are three passenger gate assemblies: from right to left their glass-leaf counts are **1, 1, 2**. Only the last gate between the single booths has two leaves. The two single openings are **0.975 m each, half the 1.95 m double opening**; these remain provisional dimensions. Booth groups are compacted so no extra gaps remain. Four officer positions are reconciled across C13/C17/C18/C21 rather than duplicated per camera.

| Objects | Count | Main evidence |
| --- | --- | --- |
| Glass/brass officer booths | 4 | C13/C17 double end; C18/C21 end-single side |
| Separately editable staff chairs | 4 | All four overlapping views |
| Separately editable officer monitors | 4 | C17, C21, corroborated by front views |
| Swing-glass passenger gates (two single-leaf, one double-leaf) | 3 | C13/C18 front views, C17/C21 rear views |
| Portrait information totem | 1 | C13, C18 |

There are **16 editable objects**. Each booth includes the counter, worktop, keyboard, brass/glass partitions, low staff platform and simplified reader/tissue/green-flag cues. The double bank's shared divider is owned once by booth 2; booth 1 omits its left partition. **Partitions** hides booth dividers while retaining the desks.

Bank order follows the owner correction. Individual slot matching remains provisional. The portrait information screen is beside the two-officer bank, not at the rear wall. The map supports the double/single/single bank topology; current finishes and detail follow the photographs. Review the correspondence before accepting the block.

## Evidence and identities

All four normal images and wide counterparts, all four normal-view reception ROI overlays, and the annotated ground-floor map crop were reviewed. `R1` is a separate image-space region in each camera. These overlapping polygons are not four unique desks, chair identities, or world coordinates. ROIs are not projected onto wide images.

No G13 chair/table ROI identities are supplied. `Seat_G13_TMP_01`–`Seat_G13_TMP_04` are temporary editor slots, **not approved CV occupancy IDs**. Keep physical `g13-...` object IDs stable when correcting them. Each chair sits on its booth's low platform; monitors face the officer side.

## Architecture and limits

Local +X follows the row from the end single booth toward the double bank and outer glass door; +Z points toward the traveller approach, with staff circulation behind the desks at -Z; +Y points up. The 11.5 × 7.6 m working crop, booth dimensions and 4.1 m plain ceiling are unmeasured visualization estimates.

The pale rear wall follows C13/C18, and an estimated return beside the end single booth follows C18/C21. The right-hand end now includes fixed glass and the third passenger door; the traveller approach stays open. The continuous rear staff aisle remains clear. **Walls**, **Low walls** and **Ceiling** control structural visibility.

The single gates follow C13: one round hinge post beside the double booth, clear glass, a slim top rail and a small latch at the opposite counter; there is no second standalone post. The last double gate retains its two posts. Gate leaves are a static closed reference state; `openFraction` can preview an opening between 0 and 1. No access-control connection or live passport screen is implied. Exact biometric equipment, flag inscriptions, rear staff doors, waste bins, signs and ceiling fixtures are omitted or simplified.

Background checkpoint equipment in C17/C21 is not duplicated here. G15's files and saved objects remain unchanged. Global placement and the eventual G13/G15 relationship require review; no raw camera heading is copied into world yaw.

## Editing and checks

Use the existing move/rotate/resize/material controls. **Save block** writes only `objects.json`, retains backups and rejects stale revisions. Architecture is maintained in `architecture.json`.

Run `npm test` and `node --test blocks/ground/g13/validate.test.mjs` before handoff. Follow root `CONTRIBUTING.md` for evidence, ownership and merge review.

Initial checks passed for evidence access, geometry bounds, single ownership of the double-bank divider, rear staff clearance and API Save/reload. The local server serves the block and all eight camera references. Browser preview access was unavailable during this update, so rendered isometric/top review and owner acceptance remain pending.
