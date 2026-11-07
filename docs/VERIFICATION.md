# Verification record

Pre-publication verification completed locally on November 7, 2026. The checks below record that local snapshot; publication and current deployment status are tracked separately in GitHub Actions and the Kata Arcade catalog.

## Passed

- `npm run check`: all three runtime JavaScript modules parse.
- `npm test`: **29 simulation regressions**. These cover commands, weighted hauling, food/maturity, color hazards, safe routes, bridge and gate construction, public gate throws, bomb release, reserves and field caps, sunset rescue, all-five-region campaign accounting, 25-required/30-total endings, extinction recovery, and active/inactive save validation.
- `npm run build`: Vite production build.
- `npm run test:browser`: genuine production-build Chromium gameplay served from an ephemeral **http://127.0.0.1** address. Checks WebGL startup, Arcade backlink, keyboard navigation and launch, three-scout component retrieval, pellet delivery and plucking, movement, type selection, pause/resume, reserve operations, dismiss/recall, sunset cancellation, help during the mandatory day-summary screen, an unlocked region transition, reload persistence, new-game confirmation, mobile layout and touch-style joystick movement. No page JavaScript errors were recorded.
- `npm run capture:arcade`: two unedited browser gameplay captures, with a loopback source URL, browser/tool versions, action record, source commit and production-input SHA256 hashes. Both images were visually reviewed.
- `git diff --check`: no whitespace errors.

The Arcade's local catalog integration also passed its Astro check, catalog tests and build. The catalog requires a verified public deployment before exposing its play link and screenshots.

## Evidence

The capture source commit is `1a885d283b4e8666ebf670eb83adfb71df06cbbb`. Capture metadata lives in `public/arcade/manifest.json`; original screenshots and action records live under `public/arcade/capture-evidence/`. These are **local gameplay captures**, not proof of deployed-build equivalence.

1. Scouts carrying the Navigation prism back to the landing nest.
2. A real Mossback fight after the first component was recovered, including a defeated creature and scout losses.

## Limits

This is focused local verification, not exhaustive playtesting. The browser suite does not manually play an entire 30-day campaign, every hazard, or every region. Full campaign bookkeeping is covered by deterministic simulation tests. No real phone hardware, screen reader, gamepad, Safari or Firefox test was run. Browser automation used desktop Chromium with a mobile-sized viewport, not a physical touch device.

The game intentionally approximates the original's mechanics and reuses an original terrain template across regions. See `GAMEPLAY.md` for the fidelity boundary. Nothing here establishes exact parity with a particular Pikmin release.
