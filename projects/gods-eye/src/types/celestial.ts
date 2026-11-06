/**
 * Core data model for GOD'S EYE.
 *
 * Positions in this first pass are placeholder / mathematically-reasonable
 * circular-orbit approximations (see src/data/orbitalMechanics.ts). The shape
 * of `OrbitalElements` below already matches standard Keplerian elements so
 * that a future data layer (e.g. NASA JPL Small-Body Database / NeoWs) can be
 * swapped in without changing any consuming component.
 */

export type ObjectCategory =
  | 'planet'
  | 'near-earth-asteroid'
  | 'near-earth-comet'
  | 'potentially-hazardous-asteroid';

export type BodyKind = 'star' | 'terrestrial-planet' | 'gas-giant' | 'ice-giant' | 'asteroid' | 'comet';

/**
 * Standard Keplerian orbital elements. Angles in degrees, distances in AU.
 * Real datasets (JPL SBDB, NASA NeoWs) map directly onto this shape.
 */
export interface OrbitalElements {
  /** Semi-major axis, in AU */
  semiMajorAxisAu: number;
  /** Orbital eccentricity, 0 = circular */
  eccentricity: number;
  /** Inclination to the ecliptic, in degrees */
  inclinationDeg: number;
  /** Longitude of the ascending node, in degrees */
  ascendingNodeDeg: number;
  /** Argument of periapsis, in degrees */
  argOfPeriapsisDeg: number;
  /** Mean anomaly at epoch, in degrees */
  meanAnomalyDeg: number;
  /** Orbital period, in Earth days */
  orbitalPeriodDays: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  category: ObjectCategory;
  kind: BodyKind;
  /** Display radius in scene units — visually enhanced, NOT to physical scale */
  displayRadius: number;
  /** Base color used for placeholder materials / orbit line tint */
  color: string;
  orbitalElements: OrbitalElements;
  /** Free-form descriptive fields shown in the Object Inspector */
  description?: string;
  /** True for objects flagged as potentially hazardous */
  isHazardous?: boolean;
  /** Estimated diameter range in meters, when known (asteroids/comets) */
  diameterMetersMin?: number;
  diameterMetersMax?: number;
  /** Closest approach to Earth in the current dataset, in AU (placeholder) */
  earthCloseApproachAu?: number;
}

export interface VisibilityState {
  planet: boolean;
  'near-earth-asteroid': boolean;
  'near-earth-comet': boolean;
  'potentially-hazardous-asteroid': boolean;
}

export type CameraMode = 'overview' | 'following';

export interface SimulationState {
  /** Simulated date, driven forward by speedMultiplier while playing */
  currentDate: Date;
  isPlaying: boolean;
  /** Days simulated per real second, e.g. 1, 10, 100 */
  speedMultiplier: number;
}
