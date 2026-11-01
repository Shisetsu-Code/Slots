# MAD CARNIVAL — JESTER'S ROULETTE V2

A PlayCanvas-powered, original **3D slot-show prototype**. Credits are fictional and there are no real-money wagers.

## Quickstart (Node 24)
    npm install
    npm run dev
    npm run test
    npm run build

Cloudflare Pages: npm run build, output dist.

## Implemented
- Articulated three-dimensional Jester, independent animated head, hands, legs, hat bells, floating cards, expressive poses.
- Mechanical theater, rotating 3D gears, colored lighting and dynamic camera.
- 3D 12-segment bonus wheel with physical pointer and prizes of 8, 10, 12 or 15 demo free spins.
- Five 3D reel columns with reactive motion, hand-drawn original icon textures, independent stops and payline FX.
- Bonus demo, scripted 3D wheel sequence, scatter-triggered free spins, win particles and synthesised sound.
- Turbo, autoplay, bet and demo credit controls.
- Responsive desktop/mobile stage, Playwright WebGL tests in GitHub Actions with screenshot artifacts.

## Source
- src/scene-v2.js: current 3D world and jester/wheel animation.
- src/main.js: UI and bonus state machine.
- src/art.js: procedural illustrations for textured geometry.
- src/game.js: demo-only game math.
- src/v2.css: new responsive art direction.
- src/scene.js: original v1 scene, kept as reference.
- tests/: unit and WebGL acceptance checks.
- DESIGN_V2.md: visual concept, mood, symbols, animation states, and art production roadmap.

## Known visual limitations
This is a working **low-poly vertical slice**, not AAA cinematic character art.
The current rig and props are all programmatic 3D primitives. Final-quality assets would require a custom skinned GLB character, blendshape facial animation, physically based textures, and a bespoke sound/VFX pass. Game math and symbols are illustrative only.

## Important
No real money, cashout, production wallet, authoritative RNG, mathematically certified RTP or regulatory certification. A compliant production game must receive and animate server-confirmed results with a transactional, auditable ledger. Client-side results here must not be used for real-money bets.

Original code and procedural art in this repository; no third-party game art copied.
