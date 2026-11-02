# G10 · Divider seating

Open http://127.0.0.1:4209/?block=ground/g10 after running npm start.

This reviewable draft reconstructs two sofas, four armchairs, two oval coffee tables and one central display divider from B4/B5/B6 and their ROI labels. Eight seat identities map to six seating objects. Lamps, glass side tables and plants are simplified context.

Dimensions, cushion designs, decorative shelf contents and spacing are estimates. The floor is a working rectangle. Map anchors are retained, but floor alignment, traced footprint and G9 seams remain unresolved. Contributor owner uses the configured Git name, Mohammed-Shahri.

The four JSON files are authoritative. Save writes objects.json; physical IDs and seat IDs remain separate. Use the Screen control to hide the central divider for review. Compare all three photos and confirm sofa seat order before accepting this block.

Run `npm test` and `node --test blocks/ground/g10/validate.test.mjs` before handoff. This block uses the existing shared builders from main at d30ab2d; no shared code changes are required. The divider uses screen/open-shelving, lamps use floor-lamp, and side tables use table with accessories disabled. These simplify some custom details from the original local draft.

Normal and wide B4/B5/B6 images were reviewed during integration. Wide views are accessible through the editor evidence buttons. Updated ROIs retain the same eight seat identities. ROI overlays, rendered top/isometric review, save/reload and architecture/seam acceptance remain pending. The new ground-floor map also requires anchor alignment review. Keep this contribution in draft review until those checks are complete.

## Shell quality review

The block now uses the same shared architecture and furniture builders as G11. Normal and wide B4/B5/B6 views support front glazing at local +Z, rounded corridor access at -Z, teal/gold TV cladding on +X (B6 camera-left) and black reflective side paneling on -X (B6 camera-right), corrected per owner. Two-arch spacing and dimensions remain provisional. One TV and one display console were added; all original 15 furniture objects, positions and seat/table identities were preserved.

Walls, Low walls and Ceiling controls work as in G11. The plain 4.1 m ceiling is hidden by default; the photographed pendant is not reconstructed. Current shell geometry supersedes the earlier furniture-only handoff above. Floor extent remains 6.6 × 5.4 provisional meters, with map alignment and G9 seams pending. Mirrors are simplified reflective finishes, not additional rooms or furniture.
