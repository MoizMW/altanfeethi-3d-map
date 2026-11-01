# Wide camera captures

These supplementary images show more of the surroundings of the normal seat-detection views. The currently supplied captures use the same camera mount positions with wider zoom. Use them to inspect walls, glazing, entrances, rounded wall profiles, corridors, walking paths, columns, lighting, display tables, artifacts and other edge details.

## Pair with the normal view

| Camera | Normal image / ROI reference | Wide architectural image |
| --- | --- | --- |
| B1 | `evidence/camera-snapshots/B1.jpg` | `evidence/wide capture snapshots/B1.jpg` |
| B3 | `evidence/camera-snapshots/B3.jpg` | `evidence/wide capture snapshots/B3.jpg` |
| C1 | `evidence/camera-snapshots/C1.jpg` | `evidence/wide capture snapshots/C1.jpg` |
| C2 | `evidence/camera-snapshots/C2.jpg` | `evidence/wide capture snapshots/C2.jpg` |
| C3 | `evidence/camera-snapshots/C3.jpg` | `evidence/wide capture snapshots/C3.jpg` |

This table highlights camera pairs already used by the G9 and G11 block evidence. The folder now also contains wide captures for many other camera IDs; check the folder for each block's available views. Filenames are case-sensitive and use the camera ID capitalization. Keep the original normal snapshots intact.

## ROI rule

Existing ROI coordinates in `evidence/rois/` belong to the normal zoomed-in detection images. A wide image has a different projection and framing even when the camera mount is unchanged. Do not reuse the normal ROI boxes/polygons on it, assume a simple resize, or infer new world coordinates from those boxes. A wide-view annotation or mapping requires separate verification. Historical ROI authoring resolution may also be uncertain; inspect normal-view alignment before relying on pixel geometry.

## Block evidence format

Use canonical camera IDs as keys, and exact project-relative filenames as values:

```json
{
  "snapshots": {
    "B1": "evidence/camera-snapshots/B1.jpg"
  },
  "wideSnapshots": {
    "B1": "evidence/wide capture snapshots/B1.jpg"
  },
  "wideCaptureContext": {
    "mountPosition": "Unchanged per owner",
    "zoom": "Wider architecture view",
    "roiUsage": "Existing ROIs apply only to normal detection snapshots",
    "capturedAt": null
  }
}
```

Include only available wide views for that block. Record capture date, resolution, zoom/direction changes and source when known; leave unknown metadata explicit. The block editor shows wide-camera buttons when `wideSnapshots` entries are present.

Review both views and the floor map together. Create repeated furniture and artifacts once, distinguish reflections from real additional objects, and preserve owner-reviewed seat/table identities and manual edits. Record uncertain wall extents, heights, material interpretation and open-path connections in the block's architecture/evidence files. Wider imagery supports reconstruction but does not establish measured dimensions or camera calibration.
