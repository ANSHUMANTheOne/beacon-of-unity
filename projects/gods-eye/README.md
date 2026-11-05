# GOD'S EYE — Near-Earth Object Observatory

An interactive 3D orrery: the Sun, all 8 planets, and a sample set of
near-Earth asteroids, comets, and potentially hazardous asteroids, rendered
as a NASA-style scientific visualization.

## Stack

React + Vite + TypeScript + Three.js + React Three Fiber + drei + Tailwind CSS.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

To produce a production build:

```bash
npm run build
npm run preview
```

## What's real vs. placeholder right now

- Planet orbital elements (semi-major axis, eccentricity, inclination,
  period) are real, stable astronomical constants.
- Planet *positions* use a simplified circular-orbit approximation
  (`src/data/orbitalMechanics.ts`), not full Keplerian propagation — enough
  to look correct while the interface is the focus.
- The near-Earth asteroid / comet / PHA objects (`src/data/celestialBodies.ts`
  → `neoSampleObjects`) are illustrative placeholders standing in for NASA
  NeoWs / JPL Small-Body Database records.

## Where to plug in real NASA data later

- Swap `neoSampleObjects` for a live NeoWs/SBDB fetch — the `CelestialBody`
  and `OrbitalElements` types already match standard Keplerian fields, so no
  other component needs to change.
- Replace `getPositionAtDate` / `getOrbitPathPoints` in
  `orbitalMechanics.ts` with true orbital propagation (solving Kepler's
  equation) for physically accurate positions.
- `AU_TO_SCENE_UNITS` is the single scale knob if distances need to be
  re-tuned (e.g. for an Earth-centric mode).

## Project structure

```
src/
  components/   Sun, Planet, OrbitPath, StarField, CameraController,
                ControlPanel, Timeline, ObjectInspector, UIOverlay,
                LoadingScreen, SolarSystem
  data/         celestialBodies.ts (dataset), orbitalMechanics.ts (math)
  hooks/        useAppState.tsx (selection, visibility, sim clock, camera)
  types/        celestial.ts (shared data model)
```
