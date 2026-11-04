# Shared curved lounge armchair

The owner requested the shared default armchair match the supplied chair photographs across all locations and sizes. The latest side-angle photograph shows full upholstered arms, a broad padded back, a soft rounded seat, subtle tension creases and dark tapered timber legs. These are modeled in `app/curved-armchair.js`, including smooth continuous surface normals, fine seams, cloth bump and soft fabric sheen.

The master is normalized to .88 × .9 × .92 m. Every placed object still applies its own saved dimensions and scale; object IDs, seat IDs, positions and rotations are retained. The 134 default armchairs across 24 spaces share this builder. Egg-swivel, shell-lounge and sofa variants retain their own builders.

## Chair references

- `chair-with-pillow.png`: original owner reference for the chair and slate-blue upholstery.
- `chair-without-pillow.png`: exposed back and arm curve.
- `chair-side-angle.png`: latest owner reference for upholstery volume, arm shape, seat contour and creases.

Default material base color: `#3d4a55`. The material input accounts for the project's bright shared lighting; it is a visual match, not a calibrated fabric measurement.

## Clean pillow fabric

The owner explicitly replaced the original photographed pillow texture with a simple, clean generated design. The active asset is `shared/materials/textures/lounge-pillow/pillow-botanical-clean.png`: slate-blue woven cloth with sparse ivory leaves and sprigs, generated using the built-in ImageGen tool. The exact prompt is saved beside it in `generation-prompt.txt`.

The pillow uses direct square UV mapping. Its rounded corners, filling, small creases, edge piping, lean and shadows come from the 3D geometry and renderer. No sofa background or photographed folds are mapped onto the pillow. `pillow-reference.png` is retained as the original owner reference only and is no longer rendered.

The library's Pillow checkbox hides the pillow for inspection; `pillow: false` omits it in the shared builder. The gallery and all rooms use the same master and texture; no models are duplicated into room folders.
