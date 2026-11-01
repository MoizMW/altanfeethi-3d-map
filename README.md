# Altanfeethi spatial twin

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

Available blocks: [G9 private seating](blocks/ground/g9/README.md) and [G32 SGS check-in](blocks/ground/g32/README.md). Use the header selector to switch blocks, or open `http://127.0.0.1:4209/?block=ground/g32` directly.

Run `npm test` before sharing a branch. Run `npm run camera-registration` to open the camera tool at `http://127.0.0.1:4199`.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before creating or merging a block. Project evidence and reconstruction decisions are recorded in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).

Before building a block, check [wide capture snapshots](evidence/wide%20capture%20snapshots/README.md) for wider images of the same cameras. Existing ROIs apply to the normal detection images, not the wide captures.
