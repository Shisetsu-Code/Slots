# Mad Carnival — Jester's Roulette 3D

Original, interactive 3D casino-slot **demonstration**. Built with PlayCanvas, a Blender-generated GLB Jester and a sculpted 3D bonus roulette. Fictional credits only. Reference art was used for design direction — not embedded as a fake 3D billboard.

## Run

Requires Node.js 24.

    npm install
    npm run dev

To run tests and compile:

    npm run check

The Vite server displays the address to open in the browser. On Cloudflare Pages, deploy build output \`dist\` using \`npm run build\`.

## Gameplay

- Five spinning 3D reel columns, three visible rows, five fixed lines and Joker Wild substitution.
- Demo credits, selectable stake, turbo/autoplay, sound and win animations.
- Three Scatter symbols trigger the carnival roulette. The optional fictional-credit bonus buy activates the same wheel.
- The real 3D roulette chooses a prize (8, 10, 12 or 15 demo spins) and displays its result before free spins proceed.
- Color-coded win lines, moving stage lights, 3D particles and camera presentation.

## Genuine 3D assets

The repository includes **production-format assets**, built in Blender in a dedicated workflow:

- \`public/assets/characters/mad-jester.glb\` — sculpted geometry, costume details, materials, 35 skeleton joints, Idle/Spin/Win/Wheel animation clips, and reactive bone posing in PlayCanvas.
- \`public/assets/wheels/fortune-royale.glb\` — physical enameled sectors, rim, inlays, pointer, independent WheelRotor and 3D decorations.

These models are loaded as PlayCanvas glTF containers at runtime. The preliminary geometric Jester is hidden in the released experience. For engineering inspection only, append \`?blockout=1\`.

The scene's manifest is \`public/assets/manifest.json\`; both assets must load before gameplay is enabled. There is no fake low-resolution art fallback.

### Rebuild 3D assets

Source: \`scripts/build_blender_assets.py\`. The GitHub Actions workflow \`build-production-art.yml\` runs Blender, generates GLBs, verifies them, and commits them to main automatically.

You can verify any prospective GLB model:

    npm run art:inspect -- ./my-character.glb jester
    npm run art:inspect -- ./my-wheel.glb wheel
    npm run art:verify

Tests also execute Playwright's headless Chromium WebGL rendering, a spin, a roulette award, and desktop/mobile screenshots.

## Project files

- \`src/scene-v2.js\`: stage, 3D reels, lights, imported models, prize wheel and camera.
- \`src/premium-assets.js\`: GLB loading, bone reactions and wheel root references.
- \`src/game.js\`: illustrative RNG and paylines, no regulated RTP claims.
- \`src/main.js\`: demo interface, bonus state machine, controls and synthetic sounds.
- \`src/v2.css\`: responsive theatrical interface.
- \`scripts/build_blender_assets.py\`: original 3D asset geometry.
- \`ART_DIRECTION.md\`: visual criteria and next art-production steps.

## Honest visual status

The demo **is not equivalent to the supplied cinematic concept illustration**. Its assets are original meshes with PBR materials, authored animation clips and a live 3D wheel, but the character remains a procedurally sculpted stylization rather than a professionally hand-sculpted photoreal hero. Photoreal skin, groomed hair, facial blendshapes, complex tailored fabric shaders, artist-authored choreography and premium sound remain further art-production work.

## Compliance and safety

All results and credits are generated and managed locally for the demo. There is **no** wallet, cashout, certified RTP, independent fairness verification or regulated real-money gaming. Real-world wagers require an authoritative and audited server/game math/ledger; never settle wagers using this client-side code.

PlayCanvas and original code are included, without supplier artwork or music.
