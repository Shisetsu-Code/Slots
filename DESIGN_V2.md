# Mad Carnival — Creative Design V2

## Identity
A mischievous clockwork jester invites the player into a luxurious, slightly sinister night circus. Not a flat reel screen: an uninterrupted interactive 3D theater. All bonus transitions occur in the same world. The centerpiece is a mechanical Wheel of Madness.

## Scene
LEFT: The Ringmaster, a striking porcelain-faced jester on a hydraulic brass pedestal, with asymmetrical magenta/violet coat, teal jewelry, articulated arms, bobbing cap bells and orbiting cards.
CENTER: Five tall 3D reel cabinets, etched frames, staggered mechanical stops and bright readable symbols.
RIGHT: Wheel of Madness, twelve labeled physical sectors, glass bulbs, brass selector, gears and strong spotlight.
BACKGROUND: deep velvet, moving searchlights, shadow gears, dark theater panels.
HUD: only credits, stake, spins and useful controls; keep the 3D stage unobstructed.

## Palette
| Material | Color |
| --- | --- |
| Ink | #10091d |
| Aubergine velvet | #38113f |
| Carmine | #e93b62 |
| Brass | #f0bb60 |
| Magical teal | #16c6cd |
| Porcelain | #f4dec1 |

## Production symbol identity
| Symbol | Visual treatment |
| --- | --- |
| JOKER / Wild | Living porcelain mask with sharp mischievous grin |
| Scatter | Gold ticket embossed with Wheel of Madness seal |
| Crown | Bent brass crown with sapphire flaw |
| Diamond | Teal cursed gem within talon-like mounts |
| Seven | Ruby-lit mechanical number |
| Bell | Braided brass clown bell with purple silk |
| Heart | Red glass heart with gold stitching |
| Star | Irradiated eight-point circus star |
| A/K/Q | Original ornamental card typography |

Current textures are intentionally provisional code-generated art. Future high-quality symbol renders must be commissioned/sculpted independently.

## Animation states
IDLE: breathing, eye movement, hat bells and cards orbit, gears and wheel rotate.
SPIN: host raises arms, reel cassettes slide in depth with staggered acceleration and independent deceleration.
WIN: host cheers, brass particles fly, winning lines illuminate.
BONUS: host gestures to wheel, camera pushes right, 3D wheel accelerates then eases to selected sector; free spins credited.
BIG WIN FUTURE: curtain transformation, theatrical smoke, animated character close-up, pyrotechnic lights and original voice.
ANTICIPATION FUTURE: extra spotlights or percussion when predetermined symbols approach, never changing game math.

## Technical production
PlayCanvas WebGL as view layer. UI and finite-state control separated from pure demo math. For regulated play replace all client math with a server-authoritative Rust game and atomic ledger; never use local RNG results or the current demo paylines.

## Status
Implemented: original 3D scene, code-based articulated rig, physical bonus wheel, reactive visual poses, three dimensional reel cards, win particles, camera cues, live-tested Playwright WebGL interactions.
Not implemented: bespoke sculpted PBR assets and blendshapes, voice acting, procedural choreography system, certified math, real wallet, game provider integration, telemetry and regulatory audit.
