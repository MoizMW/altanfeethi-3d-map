# Walls, openings and ceilings in distributed blocks

Record architectural evidence while authoring each block. Merge review resolves neighboring joins and ownership; collecting all boundaries for the first time at merge would cause rework.

## Evidence and confidence

Always check `evidence/wide capture snapshots/` for wider images of the block's cameras before tracing boundaries. Use them for walls, glass, entrances, corridors, walking paths and side furnishings/artifacts; compare the normal snapshots and map for correspondence. Existing ROIs remain tied to the normal zoomed-in detection views. See the [wide-capture guide](evidence/wide%20capture%20snapshots/README.md) for exact file pairing and evidence references.

Use floor-map topology and overlapping camera views to identify walls, glazing, columns, doors and corridor edges. A camera view can establish a wall or opening even without a dedicated architecture photo. Hidden extents, thicknesses and heights remain estimates. Furniture and decorative dividers do not automatically imply a room wall. Leave unknown boundaries unresolved rather than closing every block rectangle.

For each boundary, record a stable ID, type (solid wall, glazing, doorway, open corridor, or unknown), local floor endpoints, evidence-camera IDs, confidence, estimated height/thickness where applicable, owning block and neighboring reference. Keep this evidence with the block's architecture/evidence files. Source image landmarks should accompany derived positions for later calibration.

The shared structural renderer now reads `architecture.walls`, `openings` and optional `ceiling`. Walls use `id`, `kind` (`solid` or `glass`), local X/Z `start` and `end`, `height` and `thickness`. Rounded passages reference `wallId`, with `offset` measured from the wall start, `width`, `springHeight` and total `height`. Use owner, evidence sources and confidence alongside dimensions. The validator rejects invalid extents and overlapping openings. Furniture saving preserves architecture on disk; structural edits currently use the architecture JSON directly.

## Workflow

1. During block creation, trace supported boundaries and flag uncertain spans. Keep corridor sides open. Review them in top view before calling the shell complete.
2. Exactly one block owns a shared wall or opening. Its neighbor references the same stable boundary ID instead of generating a duplicate.
3. During merge, align the blocks to the common floor transform, resolve seams and wall endpoints, confirm door/corridor connectivity, and resolve uncertain ownership with the contributors.
4. Review wall placement against all relevant views. An inferred wall should not cover a visible aisle or pass through furniture.

## Ceiling

Use 4.1 m as the current provisional visualization height within the user's approximate 12–15 ft range. Ceiling height is separate from floor-to-floor elevation and does not prove camera mounting height. Record local exceptions only when supported.

An overhead dashboard should be able to hide ceiling meshes and cut away obstructing walls. A future interior/perspective view can show them. Visibility controls must not delete the saved architecture. Unsupported ceiling fixtures, beams and decorative details should remain unresolved.

## Current review status

G11 now has a provisional structural shell based on wide captures and owner confirmation. G9 is a furniture draft and G32 includes rear cladding. All global floor alignment and estimated structural dimensions require review. Do not infer an enclosure from a block's rectangular floor alone.
