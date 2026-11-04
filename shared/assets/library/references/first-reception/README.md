# First-floor banquette and reception assets

H49/H51 normal and wide captures show a stored, plastic-covered four-seat banquette, two side tables, tall timber cabinets, rear dried planting and dark pierced ornaments. H45 shows a stone-fronted reception counter, three office chairs, black veined branded backdrop, three portraits, patterned ceramic vessels and a portable folding louver screen.

New reusable designs are registered in `shared/assets/catalog.json` and implemented once in `app/first-floor-reception.js`:

- `sofa / four-seat-banquette`: four actual cushions and one continuous timber base/back, provisional 4.6 × 1.12 × 1.1 m. Four ROI slots remain one physical object.
- `cabinet / stored-shelving`: open timber shelves and protective tape, 0.85 × 2.6 × 0.58 m.
- `counter / stone-reception`: open staff side, full pale bookmatched fascia, worktop and brass plinth, 4.8 × 1.15 × 0.9 m.
- `screen / folding-louver`: five hinged slatted leaves, feet and alternating folds, 2.4 × 1.8 × 0.4 m.
- `plant / pampas-trough`: one timber trough with schematic dried plumes, 4.8 × 1.6 × 0.32 m. Plume count is illustrative.
- `display-console / pierced-ornament`: dark double-loop sculpture on a small base, 0.35 × 0.9 × 0.22 m.
- `display-console / patterned-vase`: charcoal round vessel with pale decorative marks, 0.38 × 0.44 × 0.38 m.
- `wall-panel / branded-marble`: charcoal marble panel, brass bands and official vector bilingual logo, 5 × 3.4 × 0.08 m. The flat material texture in `shared/materials/textures/reception-marble/charcoal-veined.png` was generated from H45 as a visual reconstruction; its exact prompt is saved alongside it. The texture excludes signage, portraits, furniture, shadows and lighting. The logo reuses the existing official source paths and their native proportions through `shared/assets/branding/altanfeethi-reception.svg`; no text or emblem is drawn by hand.
- `wall-panel / leaning-glass-panel`: framed reeded construction glazing with a small estimated lean, 6 × 2.35 × 0.22 m. It stays an editable stored object, separate from the structural boundary.

Optional `constructionCover: true` adds loose translucent protective film. The inventory records it as a configuration property so covered and uncovered versions stay distinct. Geometry and stone patterns are procedural approximations; no camera image, reflected furniture or people are baked into an asset. All assets normalize to existing type dimensions, preserving the editor's size, scale and rotation behavior. Refresh the inventory after placing them in blocks.

G45 opts into `frameStyle: "slim-brass"` on the existing `reception-portrait` asset: physical brass rails, an ivory mount, a dark backing and an aspect-correct print. Portrait artwork, physical IDs and other rooms' default portrait frames are preserved. The gallery records the frame style as a configuration option. Frame spacing and the logo's wall placement follow H45 approximately; no survey dimensions are claimed.
