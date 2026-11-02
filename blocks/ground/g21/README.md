# G21 — G-zone mixed seating lounge

Run `npm start` and open http://127.0.0.1:4209/?block=ground/g21, or select **G21 · G-zone mixed seating lounge** in the editor header. Install dependencies with `npm run install:app` if needed.

## Asymmetric seating draft

The reflective side has four armless lounge chairs, one angled armchair and a tall dark display shelf. The curtain side has two two-seat sofas and three armchairs. The draft contains **12 physical seat slots: 11 supplied ROI identities plus one explicitly temporary identity**. Four main coffee tables, two round side tables, a square plant stand, three floor lamps and two plants bring the total to 23 editable objects.

| Physical furniture | ROI identities | Evidence |
| --- | --- | --- |
| Four armless chairs | Seat_G38–Seat_G41 | G5 |
| Reflective-side angled chair | Seat_G42 | G4, G5 |
| Curtain-side near sofa | Seat_G43 / Seat_G44 | G1, G2 |
| Curtain-side far sofa | Seat_G46 / Seat_G47 | G1, G4 |
| Two mapped curtain-side chairs | Seat_G45 / Seat_G48 | G1, G4 |
| Additional central armchair | Seat_G21_TMP_01 — temporary, no ROI mapping | G1, G4 |
| Main coffee tables | Table_G11–Table_G14 | G1, G2, G4, G5 |
| Background tables, not modeled | Table_G15 / Table_G17, candidate group g22 | G4 and bundled g22 ROIs |

G1 shows two separate central armchairs beside one another. Only the chair on image-right has the Seat_G45 ROI; the second chair has no supplied label. Its stable physical ID is `g21-chair-unmapped-01`, with `identityStatus: temporary-unmapped`. **Seat_G21_TMP_01 is an editor placeholder, not an approved occupancy ID.** Replace it after owner review; do not assign Seat_G45 to both chairs. Source-image inspection regions are recorded separately from official ROIs in `evidence.json`.

Each supplied seat/table label is reconciled once across all four normal snapshots and overlays. G4's Seat_G45 ROI extends two pixels below the 1920 × 1080 source image; its annotation is preserved unchanged. Historical authoring resolution is unrecorded. ROI pixels are supporting evidence, not world coordinates.

## Boundaries and neighboring evidence

G4's background Table_G15/G17 also occur in the g22 ROI collection. They are recorded under `deferredObservations` with corroborating project-relative paths. Neither table is instantiated or claimed by G21; confirm ownership while building that neighboring block. Reception fixtures visible in G2 and reflected furniture in G5 are excluded.

Local +X crosses the pale walkway from G5's reflective backing toward G1's curtains. Local +Z runs from Seat_G38/G43 toward Seat_G42/G48; Y is up. The 8.4 × 8.8 m crop, 2.8 m path, 4.1 m ceiling and all furniture dimensions are unmeasured estimates. Camera points, headings and registration revision/hash remain evidence; no global floor transform is fitted.

Side glazing is schematic. Patterned lower panels, reflections, curtains and partly visible curved surrounds/pier returns remain unresolved. Both ends of the path stay open. No wide captures exist for G1/G2/G4/G5 in the supplied folder.

## Shared geometry and review

The shared chair builder adds an `armless` variant, and the table builder adds a `rectangular` variant for the square plant stand. Other blocks retain their existing variants. The tall organic display unit uses the existing open-shelving approximation; its contours, tier count and artifacts are not exact. The plant on the square stand has an elevated pot base. Ottoman, small stone stands, tabletop lamp and detailed finishes are not modeled.

Review sofa slot order, central chair orientations, the temporary identity, context correspondence, dimensions, architecture and neighboring seams before acceptance. Select furniture to adjust transforms, sizes, colors and IDs. Keep physical `g21-...` identities stable. **Save block** writes `objects.json` with backups and stale-revision protection; architecture is edited in its own JSON. See root `CONTRIBUTING.md` and this block's `evidence.json` for handoff rules and remaining review items.
