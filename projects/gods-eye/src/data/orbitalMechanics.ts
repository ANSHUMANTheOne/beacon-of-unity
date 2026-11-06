import type { OrbitalElements } from '../types/celestial';

/**
 * Scene-scale conversion. 1 AU maps to this many Three.js scene units.
 * Kept in one place so the whole scene can be re-scaled later once real
 * NASA distance data (and Earth-centric mode) is introduced.
 */
export const AU_TO_SCENE_UNITS = 12;

/**
 * Computes a body's position at a given simulated date.
 *
 * NOTE: this is a placeholder circular-orbit approximation, not true
 * Keplerian propagation. It ignores eccentricity/inclination shape beyond a
 * simple tilt and linear mean-motion, which is sufficient for a visually
 * correct, relatively-ordered foundation. Replace this function with real
 * orbital propagation (solving Kepler's equation from `OrbitalElements`)
 * once authoritative ephemeris data is wired in — no other component needs
 * to change, since everything consumes `getPositionAtDate`.
 */
export function getPositionAtDate(
  elements: OrbitalElements,
  date: Date,
  epoch: Date = new Date('2000-01-01T00:00:00Z')
): [number, number, number] {
  const daysSinceEpoch = (date.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24);
  const meanMotionDegPerDay = 360 / elements.orbitalPeriodDays;
  const currentAngleDeg = elements.meanAnomalyDeg + meanMotionDegPerDay * daysSinceEpoch;
  const angleRad = (currentAngleDeg * Math.PI) / 180;

  const radiusAu =
    elements.semiMajorAxisAu * (1 - elements.eccentricity * Math.cos(angleRad));
  const radiusScene = radiusAu * AU_TO_SCENE_UNITS;

  const inclinationRad = (elements.inclinationDeg * Math.PI) / 180;

  const x = radiusScene * Math.cos(angleRad);
  const zFlat = radiusScene * Math.sin(angleRad);

  // Apply inclination as a simple tilt out of the ecliptic plane.
  const y = zFlat * Math.sin(inclinationRad);
  const z = zFlat * Math.cos(inclinationRad);

  return [x, y, z];
}

/**
 * Generates a closed-loop set of points approximating the orbit path for
 * rendering as a Three.js line. Same caveats as getPositionAtDate apply.
 */
export function getOrbitPathPoints(
  elements: OrbitalElements,
  segments = 128
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const inclinationRad = (elements.inclinationDeg * Math.PI) / 180;

  for (let i = 0; i <= segments; i++) {
    const angleRad = (i / segments) * Math.PI * 2;
    const radiusAu =
      elements.semiMajorAxisAu * (1 - elements.eccentricity * Math.cos(angleRad));
    const radiusScene = radiusAu * AU_TO_SCENE_UNITS;

    const x = radiusScene * Math.cos(angleRad);
    const zFlat = radiusScene * Math.sin(angleRad);
    const y = zFlat * Math.sin(inclinationRad);
    const z = zFlat * Math.cos(inclinationRad);

    points.push([x, y, z]);
  }

  return points;
}
