# Altanfeethi spatial twin

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
  camera-snapshots/          source images
  maps/                      supplied PNG/PDF floor maps
  registration/              camera registration source of truth
  references/                historical reference exports
tools/camera-registration/   separate 2D camera registration dashboard
```

## Run the block editor

```bash
npm run install:app
npm start
```

Open `http://127.0.0.1:4209/?block=ground/g9`. Change the query value to another `floor/block-slug` after that block exists.

Run `npm test` before sharing a branch. Run `npm run camera-registration` to open the camera tool at `http://127.0.0.1:4199`.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before creating or merging a block. Project evidence and reconstruction decisions are recorded in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).
