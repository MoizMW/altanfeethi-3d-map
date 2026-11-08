# G10 Gaussian reconstruction

## Current result: one photo-trained hybrid scene

Open http://127.0.0.1:4211/g10-photo.html. If the local server is stopped, run
`node app/server.mjs 4211` from the repository root and keep that process running.

The viewer loads one `G10-photo.splat` containing **350,039 Gaussians**. B4, B5
and B6 move the viewing camera through that same scene. The downloadable
`G10-photo.ply` contains the same shared geometry and appearance.

The user approved using existing furniture shapes as a structural guide. This
is now a **hybrid, photometrically trained Gaussian reconstruction**:

- Camera positions and focal lengths fit hand-reviewed wide-photo landmarks,
  with soft priors from the existing object positions. These are provisional
  estimates, not surveyed calibration. The illustrative map is not a metric scan.
- Surface samples from the 19 authored objects and a floor initialize the
  structure. Shared landmarks adjust these experimental samples; the source
  objects, architecture, layouts and shared assets are unchanged.
- Visibility and surface orientation select colors from the real photographs.
  One set of Gaussians is then optimized against all three photos for 5,000 GPU
  steps at 768 × 432. Positions stay close to the structural guide; minimum
  surface footprints and fixed thin normals restrain gaps and floating streaks.
- Surfaces not observed by a camera receive estimated colors interpolated from
  the same object's photographed material, or retain the material prior when
  no suitable observation exists. These are not recovered photographic detail.

The complete arrangement remains recognizable from both sides and above.
Texture seams, approximate furniture shapes, foliage, lamps and unobserved
surfaces remain imperfect. This is not a measured or complete photographic scan.
Training-image PSNR is recorded for diagnostics, not as proof of novel-view
accuracy. Roughly 41% of initial surface samples receive direct photograph
colors; the rest include backs, undersides, internal and occluded surfaces.

`joint-report.json` records provenance, source hashes, shared camera poses,
training history, estimated surfaces and validation notes. The selected training
artifact is `G10-hybrid-solid`; its four `-orbit-0..3.jpg` files show diagnostic
new viewpoints. Local `.pt` training checkpoints are ignored by Git.

## Reproduce the current hybrid

Use an isolated CUDA-enabled Python environment and the dependencies in
`scripts/g10-gpu-requirements.txt`. gsplat also needs a compatible CUDA toolkit
and C++ compiler. The verified local run used the RTX 4060 Laptop GPU,
PyTorch 2.9.1+cu126 and gsplat 1.5.3 (Python 3.10). Model downloads are not needed
for hybrid training once the estimated camera priors are available.

```bash
python scripts/calibrate-g10-priors.py
node scripts/seed-g10-hybrid.mjs
python scripts/train-g10-hybrid.py --steps 5000 --name G10-hybrid-solid
python scripts/render-g10-validation.py --name G10-hybrid-solid
```

Training writes a candidate, not the live viewer files. Inspect the source and
orbit renders before copying the candidate `.splat`, `.ply` and `-report.json`
to `G10-photo.splat`, `G10-photo.ply` and `joint-report.json`. Preserve the existing
live files first. Recompute the export hash and use it for cache invalidation.

Run `node --test app/g10-splat.test.mjs` for export validity, evidence hashes,
shape provenance and HTTP asset restrictions. These checks cannot establish
photographic accuracy; new-angle visual inspection is also required.

## Rejected photo-depth experiments

The earlier DUSt3R depth sheets, higher-density resampling, layout-constrained
TSDF fusion and unconstrained GPU fits produced warped or floating geometry in
new views. Their source-camera appearance was not enough to validate them.
They remain local comparison artifacts, not the current viewer result.

Pow3R was also run with camera rays, relative poses and sparse landmark/floor
priors. Its predicted depths are saved in `prior-network-depths.npz`; they are
not used by the selected hybrid. The interrupted report-writing compatibility
error was fixed. A fresh full run is required before treating that alternative
pipeline as validated. Official model licensing still applies to those research
experiments. Earlier claims that the GPU was unavailable came from a restricted
execution check; subsequent local GPU training succeeded.

## Earlier model-conversion experiment — superseded

The old `g10-splat.html` URL now redirects to the photographic viewer. The following files are retained only as records of the superseded experiment.
`G10.splat` and `G10.ply` contain one shared scene with all 19 authored G10
objects, a floor and cutaway walls. Orbiting preserves their common positions.
This is **the existing approximate model sampled into Gaussian surfaces**; it
does not fuse the camera photographs, project photographic textures, or train
3DGS. Colors come from the existing model materials with simple baked shading.
Regenerate with `node scripts/generate-g10-block-splat.mjs` after installing the
app dependencies. The generator records source-file hashes and object IDs in
`manifest.json` under `combined`; source block files are read only.

Photo alignment was attempted using COLMAP/SIFT on the six normal/wide images,
then indoor LoFTR matching on the three wide images. SIFT produced no sparse
model. The learned matches produced a degenerate result: B6 retained zero 3D
points, its estimated focal length was negative, and lens distortion estimates
were implausible. This result was rejected rather than used to fuse the views.
Reliable photographic reconstruction still needs better overlapping captures
and camera calibration. The separate depth previews are retained as files, but are not loaded by the current viewer.

## Earlier per-camera depth previews

These files record the first experiment; the current viewer uses only the shared photographic reconstruction.

## What was generated

Each camera has its own standard binary Gaussian `.ply` and compact `.splat`
file, plus a source thumbnail and a relative depth image. The manifest records
the source image hashes, Gaussian counts, assumed field of view and coordinate
convention. This experiment reads the three wide B4/B5/B6 captures; it does not
apply the normal-view ROIs to them.

These are **depth-assisted Gaussian previews, not a trained or fused multi-view
3DGS reconstruction**. Depth Anything V2 Small predicts relative inverse depth.
The generator remaps it to 1.2–6 arbitrary visualization units, unprojects it
with an assumed 80-degree horizontal field of view, and creates surface-aligned
anisotropic Gaussians colored from the source photograph. The Gaussian scales
come from neighboring depth samples; discontinuity samples are omitted to reduce
stretched edges. Opacity is fixed at 0.94 and color uses SH degree zero.

The files use X right, Y up, with the source camera at the origin looking along
negative Z. Each camera is an independent coordinate frame. Do not merge these
files at the origin or interpret their dimensions as physical measurements.
The depth model's output is not camera calibration.

Hidden surfaces are absent. Moving far from the source view reveals holes and
distorted shapes. Mirrors, glazing, foliage and background seating can have
incorrect depth; photographed neighboring rooms remain visible. The existing
G10 architecture, furniture, seat IDs and floor layouts are unchanged.

## Reproduce

Use an isolated Python environment, then:

```bash
python -m pip install -r scripts/g10-splats-requirements.txt
python scripts/generate-g10-splats.py
npm run install:app
npm start
```

The default depth model downloads from Hugging Face on first use. For offline
generation, pass `--model /path/to/local/model`, containing `config.json`,
`preprocessor_config.json` and `model.safetensors`. Model weights and the Python
environment are not stored in the repository. Inference runs on the CPU.

Sources: [Depth Anything V2 Small](https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf)
and [Spark renderer](https://sparkjs.dev/docs/). The next reconstruction step is
to estimate separate camera intrinsics and relative poses, check cross-view
correspondences, and obtain additional overlapping captures if needed before
training and aligning a shared G10 scene.

## Historical verification of earlier experiments

For the refined shared scene, B4/B5/B6 and orbit views were inspected. The four
focused export and HTTP tests pass, including all 1,619,391 finite Gaussian
records, source hashes, positive scales, rotations and binary lengths. The
existing authored blocks, layouts and shared assets remain unchanged.

For the original separate-preview experiment, all three camera views were opened in the browser; orbit, reset, camera switching
and the depth comparison were checked. The two new export/HTTP tests pass,
including finite Gaussian positions/scales, normalized rotations, source hashes,
PLY record lengths and rejection of unintended asset paths and writes.

The full app suite reports 161/163 passing. Existing failures expect eight TV
placements where the saved library has nine, and an older G41 chair color. The
separate G10 block tests also retain an older 17-object count (the current block
has 19) and the superseded two-arch central pier. None of the source blocks,
layouts, shared assets or their existing tests were modified by this experiment.
