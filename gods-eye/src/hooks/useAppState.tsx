import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useFrame } from '@react-three/fiber';
import type { CameraMode, ObjectCategory, VisibilityState } from '../types/celestial';

interface AppStateValue {
  selectedObjectId: string | null;
  selectObject: (id: string | null) => void;
  visibility: VisibilityState;
  toggleVisibility: (category: ObjectCategory) => void;
  isPlaying: boolean;
  togglePlaying: () => void;
  speedMultiplier: number;
  setSpeedMultiplier: (speed: number) => void;
  simulatedDate: Date;
  setSimulatedDate: Dispatch<SetStateAction<Date>>;
  cameraMode: CameraMode;
  followObjectId: string | null;
  followObject: (id: string) => void;
  stopFollowing: () => void;
  showOrbitForId: string | null;
  toggleShowOrbit: (id: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

const DAY_MS = 1000 * 60 * 60 * 24;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<VisibilityState>({
    planet: true,
    'near-earth-asteroid': true,
    'near-earth-comet': true,
    'potentially-hazardous-asteroid': true,
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(4);
  const [simulatedDate, setSimulatedDate] = useState<Date>(() => new Date());
  const [followObjectId, setFollowObjectId] = useState<string | null>(null);
  const [showOrbitForId, setShowOrbitForId] = useState<string | null>(null);

  const cameraMode: CameraMode = followObjectId ? 'following' : 'overview';

  const selectObject = useCallback((id: string | null) => {
    setSelectedObjectId(id);
    if (id === null) {
      setFollowObjectId(null);
    }
  }, []);

  const toggleVisibility = useCallback((category: ObjectCategory) => {
    setVisibility((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const togglePlaying = useCallback(() => setIsPlaying((p) => !p), []);

  const followObject = useCallback((id: string) => setFollowObjectId(id), []);
  const stopFollowing = useCallback(() => setFollowObjectId(null), []);

  const toggleShowOrbit = useCallback((id: string) => {
    setShowOrbitForId((prev) => (prev === id ? null : id));
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      selectedObjectId,
      selectObject,
      visibility,
      toggleVisibility,
      isPlaying,
      togglePlaying,
      speedMultiplier,
      setSpeedMultiplier,
      simulatedDate,
      setSimulatedDate,
      cameraMode,
      followObjectId,
      followObject,
      stopFollowing,
      showOrbitForId,
      toggleShowOrbit,
    }),
    [
      selectedObjectId,
      selectObject,
      visibility,
      toggleVisibility,
      isPlaying,
      togglePlaying,
      speedMultiplier,
      simulatedDate,
      cameraMode,
      followObjectId,
      followObject,
      stopFollowing,
      showOrbitForId,
      toggleShowOrbit,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

/**
 * Advances the simulated date forward each frame while playing. Lives as a
 * hook (called from inside the R3F Canvas) rather than a setInterval so it
 * stays perfectly in sync with the render loop.
 */
export function useSimulationClock() {
  const { isPlaying, speedMultiplier, setSimulatedDate } = useAppState();
  const accumulatorRef = useRef(0);

  useFrame((_, delta) => {
    if (!isPlaying) return;
    accumulatorRef.current += delta;
    // Update roughly 20x/sec to avoid excessive re-renders of UI text.
    if (accumulatorRef.current < 0.05) return;
    const elapsedDays = accumulatorRef.current * speedMultiplier;
    accumulatorRef.current = 0;
    setSimulatedDate((prev) => new Date(prev.getTime() + elapsedDays * DAY_MS));
  });
}
