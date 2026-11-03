# G57 — I-zone planter lounge

Run `npm start` from the repository root, then open http://127.0.0.1:4209/?block=ground/g57 or select **G57 · I-zone planter lounge** in the header. Install app dependencies with `npm run install:app` if needed.

## Editable draft

Two blue lounge chairs face one pale two-seat sofa across an oval glass/brass coffee table. Four occupancy slots resolve to three seating objects; the table observed by both cameras is created once.

| Physical object | External identity | Primary evidence |
| --- | --- | --- |
| Wall-side armchair | Seat_I1 | I17 |
| Aisle-side armchair | Seat_I2 | I17 |
| Two-seat sofa | Seat_I4 / Seat_I3 | I26 |
| Oval glass coffee table | Table_I1 | I17, I26 |

A raised timber planter shell, four schematic foliage objects and a grooved screen behind the sofa bring the draft to 10 editable objects. They use existing shared builders. The cabinet-based planter omits white stones and open soil; the screen is an opaque approximation of the photographed ribbed panel. Rounded chair shells/wood legs, table shelf and exact stone finishes remain simplified. The four foliage objects do not claim an observed plant count.

## Architecture and evidence

Both normal images and both wide captures were inspected, together with the ground-floor map around the registered I17/I26 anchors. The normal snapshots are 3840 × 2160; the chair/table ROIs align when those views are reduced to a 1920 × 1080 review canvas. This display scale is recorded in `evidence.json`. Those ROIs do not apply to the separate 1920 × 1080 wide captures.

Local +X runs from the pale paneled wall toward the open aisle. Local +Z runs from the planter and I1/I2 chairs toward the I3/I4 sofa; Y is up. The 4.2 × 4.8 m floor is a provisional working crop with dark stone under the seating and an adjacent pale aisle strip. The wall, screen, planter, furniture dimensions and 4.1 m ceiling are estimates. Use **Walls**, **Low walls**, **Partitions** and **Ceiling** for inspection.

The screen is editable context rather than an asserted structural wall. The planter's neighboring continuation and the full aisle ownership remain unresolved. Window-side brown chairs, small tables and distant glazing visible across the aisle are excluded from this block. No global alignment, survey scale or calibrated CCTV view is claimed.

## Review and save

The four source JSON files are authoritative. Select objects to move, rotate, resize or correct seat/table labels; keep the physical `g57-...` IDs stable. **Save block** writes only `objects.json`, checks revisions and retains a backup. Architecture is edited in `architecture.json`.

Before acceptance, review isometric/top views, normal/wide camera evidence, seat order and neighboring ownership. Run `npm test` and follow [CONTRIBUTING.md](../../../CONTRIBUTING.md) for the shared handoff workflow.
