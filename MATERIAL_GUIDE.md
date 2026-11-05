# Shared materials and visual standard

G45 uses the opt-in `leather-privacy` armchair finish: dark brown leather `#4c4140`, roughness 0.48, no woven bump or decorative pillow, supported by H15/H16 normal and wide views. The connected shared curved-chair geometry and dark legs are reused; default blue fabric chairs keep their established finish.

Every block uses one project-wide rendering style. Choose materials by the physical surface: the same stone, fabric or metal should have the same material definition wherever it appears. Different areas can have different furniture and finishes when the camera evidence supports them.

## Source of truth

Use `shared/materials/catalog.json` for material names, base colors, roughness and metalness. Shared object builders own the assignment of these materials to component parts. Contributors should reuse those builders so another block's version of the same chair has the same construction and surface treatment.

The catalog currently serves as a contributor reference. Existing builders still contain their material parameters directly; automatic catalog-to-renderer binding remains a follow-up integration step. Match the catalog when changing these builders, and review shared changes centrally.

An object's existing `color` field is an editable base-color override. It does not describe a texture image or make a surface a different physical material. Preserve manual color choices when updating the shared builders.

## Choose by component, not camera

| Surface | Shared material | Usage |
| --- | --- | --- |
| Pale circulation / reception stone | `pale-stone-floor` | Satin-polished ivory stone, softer reflection |
| Common dark tiled floor | `dark-stone-floor` | Same finish across adjoining areas unless evidence shows a transition |
| Beige lounge upholstery | `beige-upholstery` | G9 sofa |
| Updated shared lounge sofa upholstery | `warm-offwhite-sofa` | Owner reference sofa, warm off-white/greige weave; supersedes the beige sofa finish |
| Plain light-blue sofa pillows | `light-blue-sofa-pillow` | Shared sofa; dark contrast piping, no photographic texture |
| Blue lounge upholstery | `blue-upholstery` | G9 armchairs |
| Pale coffee-table stone | `pale-stone-table` | G9 coffee table |
| Decorative brass | `brass-screen` | G9 screen frame |
| Check-in counter stone | `counter-stone` | G32 counter shell |
| Teal counter inserts | `teal-laminate` | G32 fascia |
| Wood cabinetry/cladding | `warm-wood` | Worktops, rear cabinets and wall panel |
| Dark office-chair upholstery | `office-upholstery` | SGS chair cushions and backrest |
| Dark plastic | `dark-plastic` | Frames, armrests and monitor housings |
| Brushed metal | `brushed-metal` | Chair base and luggage-scale metalwork |
| Blue inspection-equipment housing | `security-blue` | G15 baggage scanner covers |

Camera exposure, white balance and reflections can make one material look different in two views. Compare overlapping views before adding a material variant. Record a genuine local finish change in the block's evidence file, including the supporting camera IDs.

## Texture asset format for future detail

Most blocks use procedural geometry and flat PBR colors. The default curved armchair uses a fine procedural upholstery bump, fabric sheen and a clean generated botanical pillow fabric through `app/curved-armchair.js`. Its shared texture is `shared/materials/textures/lounge-pillow/pillow-botanical-clean.png`, mapped directly without photographed perspective or folds. Wood grooves, chair mesh lines and floor grids remain geometry/detail, not a complete texture system.

When adding texture images, keep each reusable set in `shared/materials/textures/<material-id>/` and extend that material's catalog entry with this proposed metadata:

```json
{
  "color": "#897055",
  "roughness": 0.65,
  "metalness": 0,
  "textures": {
    "baseColor": "shared/materials/textures/warm-wood/basecolor.jpg",
    "normal": "shared/materials/textures/warm-wood/normal.png",
    "roughness": "shared/materials/textures/warm-wood/roughness.png"
  },
  "tileSizeMeters": [1, 1],
  "grainDirection": "component-local-Y",
  "source": "Source/license and evidence reference"
}
```

Generic catalog-driven texture loading remains a future extension. The botanical pillow entry is explicitly connected by the shared armchair builder; arbitrary catalog texture entries are not automatically loaded. Base-color images use sRGB; normal/roughness maps use linear data. Start with 1024px reusable maps, no more than 2048px without a demonstrated need. Keep physical tile/grain size consistent across meshes and block seams. Do not bake camera shadows, reflections, perspective or people into a reusable surface. The original owner-provided pillow screenshot is retained only as evidence; the active pillow uses the generated flat fabric texture and its recorded prompt.

## Contributor review

- Reuse an existing material ID before adding a new one; document any new variant.
- Keep lighting, exposure, tone mapping and shadow setup shared across blocks.
- Use the same model detail level: recognizable furniture with connected supports, restrained bevels and consistent proportions.
- Inspect chair backrest/seat/base connections and support contact from the front, rear and top, including after resizing.
- Compare neighboring floor finish, grid/tile spacing and grain direction before merging.
- Keep exact dimensions and material identification marked as estimates until reviewed.

G9 and G32 should share this visual language while retaining their observed lounge and check-in finishes. A floor transition requires evidence; a different camera angle alone does not.

Architectural glass variant `blue-gold-geometric` uses translucent blue glazing, brass edging and a procedural gold twelve-point rosette/lattice approximation from the owner's Zone C reference. Reuse it through `architecture.walls[].variant` for the same observed finish; do not replace clear or smoked glazing elsewhere without evidence. The motif is geometry, not a photographic texture.

Owner lounge-chair standard (3 November 2026): default armchairs use the reference curved back/low arms, shaped seat, dark tapered timber legs, slate-blue upholstery `#3d4a55` and a botanical pillow using a clean generated fabric pattern, replacing the earlier screenshot texture at the owner's request. All matching placements share that builder regardless of saved dimensions. See `shared/assets/library/references/curved-armchair/README.md`. This supersedes the previous G18/G20 blue standard. Egg-swivel and shell-lounge variants retain their designs. The former G27 green overrides remain retired and rejected by shared block validation. Other physical materials and editable colors remain available.


## Camera-reviewed floors

See [the floor review](evidence/floor-review/README.md) for the 221 normal/wide image audit across all 35 blocks, finish decisions and exceptions. Shared implementation: `app/floor-materials.js`, `app/floors.js` and `app/floor-reflections.js`.

Dark marble is polished warm charcoal with fine pale calcite veins (roughness .24). Pale stone is restrained ivory/cream with quiet grey-beige veining (roughness .32). Both are nonmetallic, with softened scene reflections; no highlights are baked into the albedo images. Use world-metre UVs at 4.8 m per texture rather than stretching a texture over each room. Ordinary joints are fine, low contrast and fade at map scale. Do not reintroduce LineSegments tile grids.

Preserve the real first-floor small-square inlays and the B dining geometric bands. Keep authored floor transitions and owner finish overrides. The old TV-side grid strips are schematic and are suppressed by the renderer. Generated albedo images and their exact built-in ImageGen prompts are in `shared/materials/textures/`; these approximate the observed stone rather than claiming an exact material scan.


## Full-map rendering performance

The shared stone textures and material colors are retained. To keep navigation responsive, the editor renders on demand, caches static shadows and suspends planar floor captures during motion. Live floor reflections are limited to settled close views in scenes below 1,500 visible meshes; large combined maps retain the stone's material response without an additional scene capture. All views keep the original pixel-ratio cap of 2, including during movement. Reflection captures resume only after orbit damping settles in eligible close views.

Read-only layouts reuse furniture templates and exact-match geometry/materials, with spatial instances grouped in 8 m cells for view culling. Original object IDs, selection bounds and picking geometry remain available. Glass and custom shader materials stay separate. Static world matrices are computed once. All views retain the exact original detailed chair/sofa geometry. The former distant-view simplification has been removed at the owner’s request; instancing shares resources without simplifying any object. Seat labels are decluttered in combined views and updated only when a frame is needed.

The opt-in `profile=1` URL parameter exposes render counts and timings through the canvas `data-render-profile` attribute. Local before/after measurements and their limitations are saved in `evidence/floor-review/performance/summary.json`. Repeat on the same device and viewport; CPU submission timing is not a guaranteed frame rate.


Reception quality correction (4 November 2026): cached object clones must reset all Euler axes with `rotation.set(0, yaw, 0)`. Replacing Y alone after quaternion cloning can turn a 180° Y rotation into an unintended identity rotation, reversing counters and hiding one-sided branding in combined maps. Saved object poses remain authoritative and unchanged. The reception wall uses the existing official bilingual vector logo paths in `shared/assets/branding/reception-wall.svg` with ivory lettering on teal.

Soft contact shadows beneath floor-standing furniture use one shared draw in `app/contact-shadows.js`. The cached directional shadow camera is fitted to the entire scene, including distant reception rooms, while keeping the established lighting direction. Full maps use a bounded 4096-pixel shadow map; individual blocks use 2048. Both contact and directional shadows stay visible during movement; reflection capture remains paused. The earlier performance report contains historical measurements from before the full-detail restoration; see `evidence/floor-review/performance/reception-quality-update.json` for the current verification.

G3/G24/G25 owner close-up (5 November 2026): opt-in `surfacePattern: "etched-sweeps"` on opaque blue cladding uses a clear-coated teal finish and faint curved lines on both faces. Pattern spacing is an approximation of the supplied photo; this does not add live wall-mirror captures. The royal-themed painting above B41/B42 remains a placeholder pending exact artwork identification.

G3/G24/G25 detailed review (5 November 2026) supersedes the rounded sweep motif: `white-geometric` uses thin ivory joints and straight white art-deco etching, gold perimeter trims and cream finish breaks defined by wall-local `creamSections`. Walls remain opaque reflective cladding, including cream sections; these are not openings. Photo-reviewed botanical print, plant and lantern-stand variants live in the shared dining builder, with crockery through `detailLevel: "dining-reviewed"` and table `accessories: "dining-service"`. Exact ornament forms and dimensions remain estimates.

Owner-requested seated display figures: `human-avatar` variants `saudi-thobe-seated` and `saudi-abaya-seated` share the procedural builder in `app/human-avatars.js`. Stylized adults wear respectively ivory thobe/white ghutra/black agal and charcoal abaya/hijab. These are fictional decorative figures without occupancy IDs or camera identities. Local +Z faces forward like chairs. Demo placements store chair references for initial alignment; they remain separately editable assets.

Male-avatar refinement: owner photographic reference informs a fuller silver beard, aged sculpted face, folded ghutra and tailored ivory thobe with continuous lap/hem cloth surfaces, sleeves, cuffs, chest pocket, fingers and prayer beads. Chair-fitting pose and existing dimensions are retained. Procedural 3D interpretation; no photographic face texture or source-image watermark manipulation. Female avatar is unchanged.
