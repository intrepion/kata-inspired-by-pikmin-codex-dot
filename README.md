# Morrow Garden

An original 3D squad expedition inspired by **Pikmin 1**. Lead a tiny crew through a miniature garden, divide up work, recover a stranded ship and bring everyone home before sunset.

[**Play Morrow Garden →**](https://intrepion.github.io/kata-inspired-by-pikmin-codex-dot/) · [← Back to Kata Arcade](https://intrepion.github.io/)

**Status:** playable mechanical reconstruction. Mechanics and content are not certified one-to-one with Nintendo's game. Read the [research and fidelity notes](docs/GAMEPLAY.md) for the precise scope.

## Play locally

Use Node.js 20.19+ (or 22.12+) and npm:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:5230/**. Always serve the game over HTTP. Do not open `index.html` directly and do not test with `file://`.

```sh
npm run check        # JavaScript syntax
npm test             # deterministic simulation regressions
npm run build        # self-contained Vite production output
npm run test:browser # real production-build HTTP gameplay
npm run capture:arcade # two genuine gameplay screenshots with provenance
```

Browser tests use Playwright Chromium. If it is not already installed, run `npx playwright install chromium`. `scripts/browser-harness.mjs` serves `dist/` on an ephemeral **127.0.0.1** port. Browser tests never load local files directly.

## The expedition

- 30 days, 30 ship components, five unlocked expedition regions.
- 25 components are essential; five keepsakes are optional. Collect all 30 to leave early, or recover all essentials by the last day.
- Field trip pace gives four-minute days. Long daylight gives thirteen-minute days.
- Ember scouts resist fire and fight harder. Spark scouts throw higher and carry blast stones. Tide scouts survive water.
- Throw individual scouts onto tasks, whistle to recall, swarm toward a point, or dismiss them to pick nearby jobs.
- Haul weighted components, pellets and defeated creatures. More carriers increase hauling speed.
- Food grows seedlings. Matching colors yield more. Pluck seedlings at the nest; nectar produces faster flower scouts.
- Build a dry pond crossing, break root fences and use blast stones against stone barriers.
- Up to 100 scouts can be in the field. Store or withdraw followers at the nest.
- At sunset, followers and scouts near the nest are rescued; distant workers and idle scouts are lost. Planted seedlings remain safe.
- Local-device autosave, pause, resumable day summaries, a field map, responsive touch controls and optional synthesized sound.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrows | Move captain on the garden's x/z plane |
| Pointer + click / F | Aim and throw selected scout |
| Hold right-click / Space | Expanding whistle at the aim point |
| Hold Shift | Swarm toward aim point |
| 1 / 2 / 3, or Q | Select / cycle scout type |
| E | Pluck nearby seedlings |
| X | Dismiss followers |
| Tab | Landing nest and field journal |
| Escape | Pause / close a panel |

Touch: use the left thumbstick to move; tap the world to aim and throw; use the command buttons. Hold Whistle and Swarm. Use the pause menu to reach nest management.

## Research and scope

The baseline is the first Pikmin, not a blend of sequel mechanics. [Nintendo's description](https://www.nintendo.com/us/store/products/pikmin-1-switch/) establishes the three-type squad, obstacles, battles and ship salvage. Its [30 Days Later strategy guide](https://www.nintendo.com/en-gb/News/2009/30-Days-Later-Escaping-the-planet-of-the-Pikmin-250927.html) describes time pressure, workforce division, hauling, propagation, nectar, gates, bridges and bomb rocks. Community control details supplement these primary sources.

This is a compact reconstruction of that loop, not an exact clone: all types start available, the five regions share an original terrain template, combat has one generalized enemy pattern, and pathfinding, timings, progression and high-target access are simplified. Original assets, names, music-free sound and layouts are used throughout. See [GAMEPLAY.md](docs/GAMEPLAY.md) for full fidelity limits and sources.

## Architecture

- `src/game.js`: deterministic, DOM-independent simulation and validated JSON hydration.
- `src/scene.js`: original Three.js geometry, batched terrain, lighting, models, aiming and world labels.
- `src/main.js`: input, responsive UI, game loop, pause, audio and local save.
- `tests/game.test.js`: regression coverage.
- `scripts/`: loopback browser harness, gameplay tests and screenshot capture.
- `public/arcade/`: game-owned screenshots and capture evidence. Captures are local gameplay, not proof of a deployed build.

The game ships as a static site. All runtime graphics are generated locally, with no CDN or third-party asset fetch required. Three.js and Vite are pinned in the lockfile.

## Kata Arcade integration

The game is part of [Kata Arcade](https://intrepion.github.io/). The game-owned screenshot manifest preserves real local gameplay captures and their source/build hashes. Arcade imports them after verifying the public deployment.

## License

MIT, copyright 2026 Oliver Forral. See [LICENSE](LICENSE). Dependency licenses remain with their authors. `.gitignore` combines GitHub's Linux, Windows and macOS global patterns with Node/build artifacts.

Pikmin is Nintendo's property. This independent learning project is not affiliated with or endorsed by Nintendo and contains no Nintendo assets.
