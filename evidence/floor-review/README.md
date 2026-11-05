# Floor material camera review — 2026-11-04

Reviewed 221 available normal/wide images from 112 distinct cameras, covering all 35 authored blocks and the additional connecting-layout cameras. `camera-inventory.json` maps cameras to blocks and source images; `reviewed-images.json` lists the images actually reviewed. Camera lighting, exposure and image compression do not provide surveyed color or a measured roughness value.

## Observations and chosen finish

| Area / example cameras | Observed surface | Rendering decision |
| --- | --- | --- |
| Dark B/C/G/I lounge floors; B3, C17/C21, E1/E4 and overlapping G/I views | Warm charcoal/brown-grey marble with irregular pale calcite veining. Ceiling lights, windows and furniture reflect in the surface. | Polished dielectric stone, roughness 0.24; fine natural veins, restrained softened reflections. |
| Pale reception, passage, central walking strips and G63 portrait lounge | Ivory/cream stone, subtle grey/beige veining and softer light reflections. | Satin-polished dielectric stone, roughness 0.32; softer reflection than the dark stone. |
| B dining floor; B2, C11/C14 and adjacent B views | Pale floor with genuine large dark border/diamond bands. | Keep authored decorative inlays; give them the same stone treatment. |
| First-floor lobby; H18/H19/H9 | Real small dark square inlays within a pale long island. | Preserve the authored inset-checker pattern; remove only the generic grid drawn across every block. |
| First-floor seating; H1–H8 | Dark reflective paths, with beige rugs in seating areas. | Improve the authored stone. Do not invent or redraw uncalibrated rug boundaries in this finish pass. |
| EXIT exterior/service transition | Coarser grey surface, much less reflective than the interior. | Do not infer polished marble beyond the authored interior floor boundary. |

## Boundaries and uncertainty

- Floor sections, circulation polygons, inlay polygons and furniture positions are unchanged. This is a shared rendering update, not a floor-plan reconstruction.
- G29's explicit owner-requested dark finish remains authoritative, although the G16/G17 camera views show a paler floor. G16's existing seating/path boundary is also retained.
- Underexposed/obstructed views, including the C10/I42 wide views, do not independently establish a finish. Use their overlapping views; no new finish boundary is inferred from them.
- The old 0.6 m drawn grid was a modeling convention. The replacement joints are an understated 0.8 mm visual estimate at the same nominal spacing, not a surveyed slab layout. They fade at map scale. The TV-side fake line inlays are suppressed at rendering time, while true decorative shapes remain.
- The generated stone images are visual approximations, not exact scans. Both cover 4.8 m at a consistent world scale across rotated sections and polygon overlays. The exact built-in ImageGen prompts are saved in `shared/materials/textures/floor-generation-prompts.json`.
- Reflection is a bounded 512 px planar render of the current scene, softened with mip filtering and Fresnel weighting. It updates when the camera/scene changes, works with both cameras and excludes edit helpers and floor meshes. No reflections or shadows are painted into the stone textures. The cutaway scene does not contain all real ceiling/windows, so its reflections cannot reproduce every photographic highlight.

## Block coverage

| Source block | Reviewed cameras |
| --- | --- |
| blocks/first/g35 | H1, H2 |
| blocks/first/g36 | H3, H8 |
| blocks/first/g37 | H4, H5 |
| blocks/first/g38 | H6, H7 |
| blocks/first/g42 | H18, H19 |
| blocks/ground/departure-reception | ReceptionCam1, ReceptionCam2, ReceptionCam3, ENTRANCE, Egate1, SGSCam2, SGSCam4 |
| blocks/ground/egate-office-passage | Egate1, A1, A3, EXIT, B1, B3 |
| blocks/ground/g10 | B4, B5, B6 |
| blocks/ground/g11 | C1, C2, C3 |
| blocks/ground/g12-g14 | C12, C22, C23, C24, C25, C26, E3, F18 |
| blocks/ground/g13 | C13, C17, C18, C21, C10, C8 |
| blocks/ground/g15 | C8, C15, C16 |
| blocks/ground/g16 | G20, G23 |
| blocks/ground/g17 | E1, E2, E4 |
| blocks/ground/g18 | G24, G25, G28, G29 |
| blocks/ground/g2 | E13, G26, G27, G4, G5 |
| blocks/ground/g20 | G26, G27, G21, G22 |
| blocks/ground/g21 | G4, G5, G1, G2 |
| blocks/ground/g22 | G7, G8, G9, G10 |
| blocks/ground/g27 | G6, G12, G13, G14 |
| blocks/ground/g28 | G11, G15, G18, G19 |
| blocks/ground/g29 | G16, G17 |
| blocks/ground/g3-g24-g25 | B2, C11, C14, B13, B7, B8, B9, B10, B11, B12, B14 |
| blocks/ground/g32 | SGSCam2, SGSCam4, SGSCam1, SGSCam3 |
| blocks/ground/g57 | I17, I26 |
| blocks/ground/g58 | I18, I22 |
| blocks/ground/g59 | I13, I24 |
| blocks/ground/g60 | I37, I42 |
| blocks/ground/g61 | I14, I15, I16 |
| blocks/ground/g62 | I25, I27, I28 |
| blocks/ground/g63 | I29, I30, I31, I32, I34 |
| blocks/ground/g9 | B1, B3 |
| blocks/ground/i-map-extension | I24 |
| blocks/ground/i33-lounge | I33 |
| blocks/ground/zone-c-pods | C2, C22, E13, Cor2 |

## Verification

All 35 block validations and 93 project tests pass. Browser review covered G10 dark stone in isometric and perspective, G63 pale stone, and the first-floor lobby's preserved checker inlay in top view, without browser warnings/errors. Saved previews are in `previews/`.
