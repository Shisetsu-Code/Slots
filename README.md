# Slots Lab — Jester's Masquerade 3D

Original PlayCanvas 2.23.3 five-reel 3D slot **prototype**. Supplied screenshots were used as references for screen layout and dramatic presentation only; no supplier graphics, branding, or game mathematics have been copied.

## Run locally

Requires Node 24 (or recent Node 22).

    npm install
    npm run dev
    npm run test
    npm run build

Cloudflare Pages: build command npm run build, output directory dist.

## Features

- Five actual 3D spinning reel drums with lit custom symbol textures.
- Original procedural icon art, gilded controls, circus theater backdrop.
- Animated 3D pendants and gold coin bursts, win lighting and camera effects.
- Five paylines with wild substitutions; scattered bonus; 8 free spins.
- Fictitious demo credits, feature-buy demo, turbo, autoplay and synthetic audio.
- Separate, unit-tested illustrative game rules (src/game.js).

## Modules

src/art.js creates original symbol textures; src/scene.js implements PlayCanvas meshes and reel animation; src/game.js evaluates fictional results; src/main.js orchestrates the UI; src/style.css draws the responsive cabinet.

## Not a real-money product

Credits are **fictional**, local to the browser, and reset on refresh. No real money, certified RTP/RNG, transactional wallet, payout ledger, or fairness guarantees. Do not use client-side math for gambling.

A production game requires server-authoritative round generation and settlement, robust idempotent ledger transactions, audit and licensing work. Rust on Cloudflare Workers could serve confirmed results to this 3D renderer.

PlayCanvas is MIT licensed. Fonts may be fetched from Google Fonts with fallbacks.
