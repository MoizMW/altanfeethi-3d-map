# Chair and table ROI evidence

This folder is a shareable snapshot of the computer-vision ROI definitions used to reconstruct seating and table relationships.

**These ROIs are mapped to the normal zoomed-in detection views in `evidence/camera-snapshots/`.** Supplementary images in `evidence/wide capture snapshots/` show the same cameras with wider framing for architecture and surrounding details. Do not apply the normal ROI coordinates to those wide images; a separate verified mapping or annotation is required. See the [wide-capture guide](../wide%20capture%20snapshots/README.md).

## Contents

- `chair-rois/` — copied from `altanfeethi-cv/src/ChairOccupancy/Chair_ROIs`
- `table-rois/` — copied from `altanfeethi-cv/src/TableOccupancy/Table_ROIs`
- `reception-rois/g32/` — the four SGS reception-area polygons copied from `altanfeethi-cv/src/ReceptionOccupancy/Reception_ROIs/g32` for the G32 block. These are reception regions, not chair IDs.

The group folders (`g9`, `g10`, and so on) and camera-based filenames are preserved exactly so they can be matched with camera registration data and spatial blocks.

Treat these files as evidence, not as 3D coordinates. ROI polygons are expressed in each camera image's pixel space and may show the same physical chair or table from several views. Contributors should reconcile those views into one physical 3D object with one stable object ID.

This snapshot was copied from the local `altanfeethi-cv` repository on 2026-10-29. If the source ROIs change later, update both directories together and mention the source revision in the commit or pull request.
