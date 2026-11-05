# G19 · Construction shell and escalator approach

Open `/?block=ground/g19` for the independent shell, `/?layout=ground/g17-g19` for the close G17/front-room connection, or `/?layout=ground/b-g-lounges` for the main ground floor.

G19 is intentionally unfurnished. It contains dark marble flooring, the pale crossing path, cream core wall and return, blue glazing, a structural glass corridor gate, and the lower stair/escalator pair beside the wall in F2, with the staircase confirmed by the owner. No chairs, sofas, counters, staff equipment, checkpoint posts, portraits, plants or other movable objects are added. `objects.json` is empty.

## Evidence

Only the normal F2, F1, E5 and E8 camera views were used. The owner explicitly excluded newer wide captures; `wideSnapshots` stays empty. The attached F2 detail is retained at `evidence/references/g19-f2-owner-escalator.png`. The ground-floor map and saved registration establish relative topology. F1/F2 are positioned; E5/E8 remain unplaced and their positions/headings are not invented. No ROI identities are needed for this architectural scope.

F1/F2 show the same pale crossing, opposite cream core wall, glass connection and escalator beyond the wall end. E5/E8 provide reverse views of the blue backing and glazed doorway. Observed historical furnishings and temporary gate barriers are deliberately excluded by the owner's construction scope.

## Provisional geometry and joins

The 11.7 × 12.8 m working crop uses local +X toward G17/front room, +Z toward the core wall, and +Y up. Main placement is [-59.63,0,3.4], yaw 0, spanning global X=-65.48..-53.78 and Z=-3..9.8. It meets G17 and the front empty room at X=-53.78. The 2.6 m pale path continues G17's corridor at Z=3..5.6 through the glass gate. The front room retains its existing separate entrance.

Standalone context partitions reference G17's sign wall, the front room's side wall and the G28/G29 backing. The compositions exclude those duplicate G19 context walls and retain the neighboring owner walls once. Existing source furniture and block placements are preserved.

The owner correction reverses the escalator by 180° (yaw 180 → 0) and adds parallel stone stairs on its interior side. Both lanes now use the same shared geometry builder as the first-floor stair/escalator pair: stone stair treads with metal nosings/rails, metal escalator treads with yellow edges and black handrails, glass balustrades, and one common lower landing. Five lower treads use the first-floor tread pitch and riser height (approximately 2.417 m run and 0.731 m rise). Stair width, escalator width and lane gap keep the first-floor proportions within the provisional camera crop (1.25 m escalator width; transverse scale 1.25/2.2). The lower landing is 0.5 m long. The rotated assembly keeps its foot near the original corner, rising toward local +X, and clears the cream return. Exact width calibration and upper-floor placement remain unresolved; only the visible lower section is modeled.

Wall height 4.1 m, shell extents, door leaves, glass tint, wall return and escalator dimensions remain estimates. Frosting graphics and the core's service door are not reconstructed. Structural changes use `architecture.json`; normal editor saves preserve this file.

## Validation

`npm test` includes G19 construction exclusions, shared-wall/gate clearance, escalator clearance and finite geometry, and preservation of architectural structures under rotated/elevated composition. Review low/full walls, top and isometric views before accepting physical dimensions.
