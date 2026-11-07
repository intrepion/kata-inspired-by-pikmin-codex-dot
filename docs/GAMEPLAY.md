# Morrow Garden: research and mechanical scope

Morrow Garden is an original browser expedition inspired specifically by **Pikmin 1**, not a combined ruleset from its sequels. Names, geometry, characters and art are original. This is a compact, playable approximation, **not an exact recreation or full-content replacement**.

## Research summary

The original combines direct control of a small captain with real-time squad management. The player plucks plantlike helpers, whistles to recall them, throws individuals onto tasks, dismisses groups, and directs the squad around obstacles. Its central challenge is dividing a limited workforce among combat, hauling and construction while keeping everyone safe before sunset. Salvaging the ship provides campaign progress; pellets and defeated creatures replenish the workforce.

Three species establish distinct tactical roles: red helpers resist fire and deal greater damage; yellow helpers reach higher targets and carry explosive rocks; blue helpers survive water. Object weight is a minimum crew requirement, and larger crews can haul faster. Feeding a matching-color pellet to its nest increases the number of new helpers. Nectar matures helpers and improves their movement. A maximum of 100 active helpers constrains the field force. The 30-day campaign and sunset losses make route planning consequential.

## Sources reviewed

- [Nintendo: Pikmin 1 product description](https://www.nintendo.com/us/store/products/pikmin-1-switch/) confirms the original red/blue/yellow team, environmental obstacles, battles and missing ship parts.
- [Nintendo: 30 Days Later](https://www.nintendo.com/en-gb/News/2009/30-Days-Later-Escaping-the-planet-of-the-Pikmin-250927.html) documents the 30-day/30-part challenge, 100-unit multitasking, nectar, bridges, gates, yellow bomb rocks, color-based nest propagation and faster retrieval with extra carriers.
- [Pikipedia: Controls](https://www.pikminwiki.com/Controls) distinguishes throw, expanding whistle and directional swarm commands across versions.
- [Pikipedia: Carrying](https://www.pikminwiki.com/Carrying) provides supplementary detail on automatic transport and recall interruptions. This is a community reference, not a Nintendo specification.

## Implemented systems

- Five original expedition regions, unlocked at 0, 1, 5, 12 and 20 recovered parts; six parts in each, for 30 total. Twenty-five are required; five are optional keepsakes.
- Classic days last 13 minutes; Quick days last 4 minutes. Both have a maximum of 30 days. Recovering all parts wins immediately; after day 30, collecting all 25 required parts allows an incomplete escape.
- Direct captain movement, individual aimed throws, type selection, expanding recall whistle, directional swarm and dismissal.
- Ember/red fire resistance and 1.5× base attack; Spark/yellow higher/farther throws and blast-stone use; Tide/blue water survival.
- Autonomous nearby job assignment, weighted hauling, speed gains from additional workers, gate and bridge construction, telegraphed enemy attacks, and recoverable hazard panic.
- Food delivered to the nest produces the majority carrier color; matching-color pellets yield double seedlings. Seedlings can be plucked and mature while planted; nectar produces flower maturity.
- Nest reserves, withdrawal/storage, a 100-entity field cap, ongoing world changes, and day-end rescue/loss accounting.
- At dawn an extinct type receives one replacement seed, or one reserve scout if the field is full; planted survivors in other regions prevent this recovery.
- Helpers in the captain's following squad or near the nest are rescued at sunset; remote workers and idle helpers are lost. Planted seedlings persist in their area.
- Simulation state is plain JSON and can be validated with `hydrateGame` for local save/load, including inactive regions and their planted seedlings.

## Deliberate differences and remaining fidelity limits

This implementation does **not** reproduce Nintendo's exact levels, enemy roster, hitboxes, timings, movement speeds, knockback, animation-dependent damage, pathfinding bugs, bomb handling subtleties, captain combat, music, audiovisual presentation or controller-specific behavior. All five regions currently share a compact terrain template with different atmosphere, unlock requirements and enemy strength rather than the original game's five distinct maps. All three helper types are available immediately, simplifying the original unlock progression. There is one generalized enemy attack pattern. High objects use a species-based access rule rather than fully simulated climbable ledges. The bridge opens a full north-south dry strip through the pond, creating a shorter route to the far-bank keepsake. Workers build it from the dry southern endpoint. Hauling uses a coarse hazard-aware grid rather than a full dynamic navigation mesh. There are no special bosses, procedural cave floors, extra captains, mounts, sprays, electrical hazards or sequel-specific types.

Construction, food yields, movement, combat and throw ranges are explicitly tuned for this original compact map. The core loop and characteristic type/task/time tradeoffs are implemented, but **mechanics are not certified one-to-one**. Matching every original mechanic would require a substantially larger fidelity project and comparative playtesting against a specified release.

## Simulation interface

`createGame({mode: 'quick' | 'classic'})`, `stepGame(state, dt, input)`, `command(state, action, payload)`, and `hydrateGame(json)` are exported from `src/game.js`.

Input uses `moveX`, `moveZ`, `aim: {x,z}`, `whistle` and `swarm`. Throws require a matching follower within five metres of the captain. A throw aimed at an unfinished bridge resolves to its dry `workX`/`workZ` construction endpoint. Commands include `throw`, `select`, `dismiss`, `pluck`, `deploy`, `store`, `endDay`, and `nextDay`. The step function bounds each simulation update to 0.1 seconds to prevent a background-tab jump from skipping an entire day. Pause and UI transitions are managed outside the simulation. The JSON includes units, objects, region history, player health, reserves and campaign progress.
