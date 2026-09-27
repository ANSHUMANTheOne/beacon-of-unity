import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { AppStateProvider } from './hooks/useAppState';
import { SolarSystem } from './components/SolarSystem';
import { CameraController } from './components/CameraController';
import { ControlPanel } from './components/ControlPanel';
import { Timeline } from './components/Timeline';
import { ObjectInspector } from './components/ObjectInspector';
import { UIOverlay } from './components/UIOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { useAppState } from './hooks/useAppState';

function SceneRoot() {
  const { simulatedDate } = useAppState();
  return (
    <>
      <SolarSystem />
      <CameraController simulatedDate={simulatedDate} />
    </>
  );
}

function AppShell() {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 2000 }}
        gl={{ antialias: true }}
        onCreated={({ raycaster }) => {
          raycaster.params.Line = { threshold: 0.6 };
        }}
      >
        <color attach="background" args={[new THREE.Color('#05070d')]} />
        <fog attach="fog" args={['#05070d', 140, 420]} />
        <SceneRoot />
      </Canvas>

      <div className="pointer-events-none absolute inset-0">
        <UIOverlay />

        <div className="pointer-events-none absolute left-6 top-24">
          <ControlPanel />
        </div>

        <div className="pointer-events-none absolute right-6 top-24">
          <ObjectInspector />
        </div>

        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
          <Timeline />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <AppStateProvider>
      <LoadingScreen visible={showLoading} onComplete={() => setShowLoading(false)} />
      <AppShell />
    </AppStateProvider>
  );
}

export default App;
