# G41 · First-floor private lounge

Open `http://127.0.0.1:4209/?block=first/g41` after running `npm start` from the project root.

Independent editable group on branch `g41`. H12/H14 normal and wide captures, all four normal-image chair/table ROI files, first-floor PNG and saved camera registrations were reviewed. H12 is severely underexposed; H14 normal provides the clearest furniture evidence.

| Physical object | External identity |
| --- | --- |
| White two-seat sofa | Seat_H23 / Seat_H22 |
| Rear blue tub chair | Seat_H21 |
| Entrance blue tub chair | Seat_H24 |
| One organic nested stone table set | Table_H5 |

Seven editable objects include the four furniture objects, a wall TV, oval mirror and green flag stand. Small chairs use shared G18/G20 blue `#627d86`; the long sofa is pale. The table has two nested tops but one external identity. Tissue box is table context. Flag lettering/emblem and TV content are omitted; the mirror uses a static metallic material.

Three pale walls and reeded entrance glazing with a sliding glass door enclose a provisional 4 × 4.8 m working footprint with pale rug and clear TV-side access. Owner confirms the sliding mechanism; hardware profile, screen height, dimensions, sofa-slot order and global position need review. Ceiling uses the shared 4.1 m visualization estimate and is hidden by default.

Local +X faces the TV wall; +Z faces the reeded entrance; Y is up. G41 stays separate from the stair-lobby assembly. Camera map pixels/headings and neighboring blocks are unchanged. The four JSON files are authoritative; the editor saves furniture only.

Shared opt-in builders provide tub chairs, organic stone table and oval mirror. The flag uses main's shared standing-flag builder. G41 renders through `app/object-builders.js` in both the editor and shared asset library. See `evidence.json` for correspondence, image paths and uncertainty; detection ROIs are never applied to wide captures.

Validation on 2026-11-03: all 31 project tests pass. G41 was reviewed in isometric, top and full-wall views; the real editor Save button and reload preserved all seven object records. Both normal/wide camera pairs load through the server.

Main update on 2026-11-04: branch `g41` includes `origin/main` at `5418b1f`. G41's four JSON data files are preserved byte-for-byte. Custom variants now use the shared renderer/gallery; the object inventory is refreshed, and all 90 combined project tests pass. Main's updated default chair, flag and other asset builders are retained.

Owner entrance correction on 2026-11-04: the previous open gap beside the fixed reeded panel is a sliding door. One matching leaf closes X=0.45..1.8 and slides left over the fixed pane, with pull handles and overhead track. The architectural door defaults to closed; set `doors[0].openFraction` on `g41-entrance-screen` from 0 to 1 for a static open preview. Exact dimensions and hardware remain estimated.
