# Altanfeethi spatial twin

First-floor lounges and stair lobby: `http://127.0.0.1:4209/?layout=first/bottom-lobby` — G35–G38 opposite G42, connected around the stair/escalator void, with H9/wide-image context and lobby furnishings. The original bottom-right row remains at `/?layout=first/bottom-right`.
Reception + SGS shared security/unused-counter bays: `http://127.0.0.1:4209/?layout=ground/departure-sgs`.

Departure_Reception: `http://127.0.0.1:4209/?block=ground/departure-reception` — [reception, entrance, e-gate and side-camera evidence](blocks/ground/departure-reception/README.md).

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
