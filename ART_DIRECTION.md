# Reference-driven 3D art acceptance — MAD CARNIVAL

## Authority: the user-supplied reference (October 31 / November 1, 2026)

**Visual direction to match:**
- Full-body adult, androgynous male-presenting jester with expressive face, defined hair, smile, crisp eyes and stylized makeup. NOT a mask made from spheres.
- Burgundy, royal purple, black and cream tailored costume, asymmetrical hat, multiple gold bells, intricate embroidery, gemstones and layered ruffled cuffs/collar.
- Casino card motifs, brass mechanisms, floating chips, gold magic trails, expressive hand gesture.
- Luxurious baroque theater with dramatic warm bulbs, dark depth, bevels and rich materials.
- Game wheel has **same level of physical detail**: deep real geometry, sculpted brass rim, jewel inlays, complex pointer, lit engravings and individually modeled segment borders. Not a UV texture glued to a flat plane.

The reference image is a **visual brief**, not a mesh or rig. It cannot be imported as a 3D skinned character, and wrapping the flat image onto geometry does not satisfy the brief.

## Required source files

- public/assets/characters/mad-jester.glb
- public/assets/wheels/fortune-royale.glb

The GLB character must contain a rigged humanoid mesh, a facial system (blendshapes or bones), 3D details and distinct authored animation clips with semantic names. Suggested: Idle, Present, Celebrate, Wheel, Lose, Anticipate. The GLB wheel must contain separate transform **WheelRotor** plus fixed pointer objects. Include PBR textures and compressed 2K/4K material maps appropriate to device targets. All intellectual property and licensing must be documented.

Place these files in the repo, validate them, then update public/assets/manifest.json to reference the URLs. The runtime uses PlayCanvas container assets and switches from the temporary blockout to the production models.

## Quality gates — no more pretending
1. A render preview from a real loaded GLB in PlayCanvas is compulsory.
2. Visual acceptance must use an actual screenshot from a running browser in desktop AND mobile.
3. The first camera angle must show **face and costume detail**, not a tiny distant generic silhouette.
4. Animation check samples moving joints or morph targets: playing a clip name alone does NOT count.
5. Wheel animation must stop on the exact server-confirmed sector after an integer number of revolutions. Avoid a layout mismatch between sectors and reward data.
6. Reject any model with only procedural spheres/cylinders as character stand-in, even if the screenshot looks colorful.
7. Validate licensing, asset size, device FPS, texture compression, skinning, normals, draw calls, and fallback behavior.
8. Keep demo results and fictional credits separate from a future real-money ledger. No certified RTP is implied.

## Production workflow
1. Sculpt or image-to-3D generate a high-resolution base under verified, commercial-appropriate asset rights.
2. Correct topology, hair cards and cloth details in Blender/ZBrush; produce proper PBR materials.
3. Rig and create authored keyframed performance (including face/eyes, bells, garment physics or baked secondary motion).
4. Model the prize wheel separately, with mathematically indexed sectors, rotor pivot, pointer, emissive bulbs and brass ornaments.
5. Export glTF 2.0 GLB with author names, animation clips and correct axes.
6. Use 'npm run art:inspect -- <path>' to inspect actual GLB structure and block release until both pass quality review.
7. Review actual browser screenshots, then switch productionArtReady in manifest.

**Status**: Art reference and premium GLB integration prepared. The production-quality GLB assets have NOT been created from this 2D reference in this chat. Do not label the current geometry a finished AAA asset.
