# Altanfeethi spatial twin

**Contributors and Codex:** run `npm run install:app` before working or pushing; dependency installation activates Husky main protection automatically. Root `npm install` or `npm ci` also activates it. Direct pushes to `main` are prohibited. **Only owner/admin MoizMW may explicitly authorize an exception for a specific push; nobody else may bypass or disable protection.** Read [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md). Local hooks must be installed in each clone and are not server-side access control.

Editor shortcuts: search the object list by name, seat/table ID or source room (`/` focuses search); use **Reset view** or **Home** to recenter. Apply adjustments, then use **Save block** or **Ctrl/Cmd+S**. **Ctrl/Cmd+Z** undoes applied edits outside text fields. The header shows saved/unsaved/saving state. In a combined view, select an object and use **Edit in source room** to open that exact object for editing.

G45 privacy lounge: `http://127.0.0.1:4209/?block=first/g45` — seven leather chairs, five stone pedestal tables and rounded privacy screens. Lounge-only scope excludes H45 reception; see [G45 evidence and review notes](blocks/first/g45/README.md).
G39 → G40 → G41 private-room row: `http://127.0.0.1:4209/?layout=first/private-lounges` — three independent rooms composed in registered map order, with 12 seats, three table identities, shared dividing walls and an entrance corridor. Individual rooms remain editable at `/?block=first/g39`, `/?block=first/g40` and `/?block=first/g41`.

Shared object library: `http://127.0.0.1:4209/library.html` — searchable 3D inventory of saved furniture and fixtures, with size/finish configurations and source-room links. Refresh the saved directory inventory with `npm run library:refresh`. See [library workflow](shared/assets/library/README.md).

Combined G15/G13: `http://127.0.0.1:4209/?layout=ground/g15-g13` — checkpoint, two offices and passport control, with a provisional connecting approach. Both source blocks load live with their saved furniture and gate sizes.

G13 arrival passport control: `http://127.0.0.1:4209/?block=ground/g13` — [booth evidence and review notes](blocks/ground/g13/README.md).

G15 security checkpoint: `http://127.0.0.1:4209/?block=ground/g15` — [equipment evidence and review notes](blocks/ground/g15/README.md).
First-floor right G46/G47/G49: `http://127.0.0.1:4209/?block=first/g46-g47-g49` — [right-side reconstruction notes](blocks/first/g46-g47-g49/README.md). Combined left + center + right: `/?layout=first/center-right`, with G50/G51 on the left, 64 seats and 20 tables.

First-floor center G52–G55: `http://127.0.0.1:4209/?block=first/g52-g55` — [center lounge evidence and review notes](blocks/first/g52-g55/README.md). One editable area with 32 seats, ten tables, curved sofas, tree beds, carpet and brass lighting.

First-floor lounges and stair lobby: `http://127.0.0.1:4209/?layout=first/bottom-lobby` — G35–G38 opposite G42, connected around the stair/escalator void, with H9/wide-image context and lobby furnishings. The original bottom-right row remains at `/?layout=first/bottom-right`.
Reception + SGS shared security/unused-counter bays: `http://127.0.0.1:4209/?layout=ground/departure-sgs`.

Departure_Reception: `http://127.0.0.1:4209/?block=ground/departure-reception` — [reception, entrance, e-gate and side-camera evidence](blocks/ground/departure-reception/README.md).

Small I-zone lounges: `/?block=ground/g60` (I37/I42) and `/?block=ground/i33-lounge` (I33). Two blue chairs and one white two-seat sofa each; both included after G63 in the main combined layout.

G63 portrait lounge: `http://127.0.0.1:4209/?block=ground/g63` — [evidence and review notes](blocks/ground/g63/README.md). Four armchairs, four two-seat sofas, 12 owner-authorized temporary seat IDs; 7.4 m width, half the G12/G14 span.

G41 first-floor private lounge: `http://127.0.0.1:4209/?block=first/g41` — [evidence and review notes](blocks/first/g41/README.md). White sofa, two blue chairs, Table_H5, TV, mirror and flag stand; four unique seats H21–H24.

G12 + G14 shared C-zone lounge: `http://127.0.0.1:4209/?block=ground/g12-g14` — [evidence and review notes](blocks/ground/g12-g14/README.md). One editable space for both groups, with 21 unique seat IDs.

Zone C pods and approach: `http://127.0.0.1:4209/?block=ground/zone-c-pods`.

G2 arrival reception/exit: `http://127.0.0.1:4209/?block=ground/g2` — [evidence and review notes](blocks/ground/g2/README.md).

Combined B/C/G lounges: `http://127.0.0.1:4209/?layout=ground/b-g-lounges` — twelve areas including G27, G12/G14, G21/G22, G2 reception/exit and Zone C pods, with matched bay edges and connected walking routes.

G16/G18/G20 arched lounges: `http://127.0.0.1:4209/?layout=ground/g16-g18`.

G16 window lounge: `http://127.0.0.1:4209/?block=ground/g16` — [evidence and review notes](blocks/ground/g16/README.md).

Combined G9/G10 preview: run `npm start`, then open `http://127.0.0.1:4209/?layout=ground/g9-g10`. It loads the source blocks with a shared partition and provisional corridor. See the [layout workflow](layouts/README.md). Edit furniture in its individual block; the combined view is for review.

G11 C-zone lounge: `http://127.0.0.1:4209/?block=ground/g11` — [block evidence and review notes](blocks/ground/g11/README.md).

Contributor visual standard: [MATERIAL_GUIDE.md](MATERIAL_GUIDE.md).

This repository contains a shared Three.js block editor and independently owned spatial blocks. Contributors build one bounded area at a time; the complete building will be composed from those blocks later.

## Directory map

```text
app/                         shared Three.js editor and local save server
blocks/
  _template/                 copy this when starting a block
  ground/<block-slug>/       ground-floor contributor blocks
  first/<block-slug>/        first-floor contributor blocks
shared/
  schema/                    validation contract used by every block
  assets/                    reusable object type catalog
  materials/                 shared material definitions
  floor-transforms/          centrally owned floor coordinate transforms
evidence/
  camera-snapshots/          normal zoomed-in detection images; ROI reference views
  wide capture snapshots/   wider views for architecture, paths and decorative details
  maps/                      supplied PNG/PDF floor maps
  registration/              camera registration source of truth
  rois/                      shareable chair/table ROI evidence
  references/                historical reference exports
tools/camera-registration/   separate 2D camera registration dashboard
```

## Run the block editor

```bash
npm run install:app
npm start
```

Open `http://127.0.0.1:4209/?block=ground/g9`. Change the query value to another `floor/block-slug` after that block exists.

Available blocks: [G9 private seating](blocks/ground/g9/README.md), [G11 C-zone lounge](blocks/ground/g11/README.md), [G18 G-zone passage lounge](blocks/ground/g18/README.md), [G20 G-zone passage lounge](blocks/ground/g20/README.md), [G21 G-zone mixed seating lounge](blocks/ground/g21/README.md), [G27 G-zone mixed seating lounge](blocks/ground/g27/README.md), and [G32 SGS check-in](blocks/ground/g32/README.md). Use the header selector to switch blocks, or open `http://127.0.0.1:4209/?block=ground/g27` directly.

G28 shelf lounge is also available at `http://127.0.0.1:4209/?block=ground/g28` — [draft evidence and review notes](blocks/ground/g28/README.md).

Run `npm test` before sharing a branch. Run `npm run camera-registration` to open the camera tool at `http://127.0.0.1:4199`.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before creating or merging a block. Project evidence and reconstruction decisions are recorded in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

Before building a block, check [wide capture snapshots](evidence/wide%20capture%20snapshots/README.md) for wider images of the same cameras. Existing ROIs apply to the normal detection images, not the wide captures.


Table drawing references: place PNGs named after table IDs (for example `B1.png` for `Table_B1`) in `evidence/tables_drawing/`. The editor adds matching `B1 drawing` buttons beside normal/wide camera views, including combined layouts. Missing drawings are omitted. These files are owner visual references for checking chair names; they do not modify or calibrate the model.

G19 construction shell: `/?block=ground/g19` — floors, supported walls/glazing, corridor glass gate and the visible lower escalator from F2, with no furniture. Close connection to G17 and its empty front room: `/?layout=ground/g17-g19`; also included in the main ground-floor layout. Uses normal E5/E8/F1/F2 views only, per owner. See [G19 evidence and provisional joins](blocks/ground/g19/README.md).

## Unified building dashboard

Open `/building.html` for the connected ground + first-floor experience. Ground, First, Building and Exploded modes have animated camera/floor transitions, searchable rooms/seats/tables, click-to-focus spaces, a stair-connection close-up, top/full-wall controls and source-room links. The floor editor header also links here. Small screens use **Find a space** to open the room drawer; reduced-motion preferences are respected.

The viewer reads the saved `ground/b-g-lounges` and `first/center-right` layouts live through read-only `/api/building`. It rigidly aligns the first-floor lower escalator landing with G19, using a provisional 3.8 m elevation. One shared 7.6 m flight uses G19's lane widths, plus an upper landing bridge filling the unused part of the original opening. These are building-view estimates, not surveyed measurements. Original floor layouts, room furniture and standalone stairs remain unchanged. Existing rooms retain their source editor links.

Implementation: `app/building.mjs` composes alignment; `app/building.js` renders the dashboard using the shared builders/materials and static instancing. Test alignment, shared-flight/wall clearance, upper-bridge continuity, source preservation and read-only API with `node app/building.test.mjs` (also included in `npm test`).
