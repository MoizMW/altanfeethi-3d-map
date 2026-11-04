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
| Common dark tiled floor | `dark-stone-floor` | Same finish across adjoining areas unless evidence shows a transition |
| Beige lounge upholstery | `beige-upholstery` | G9 sofa |
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
