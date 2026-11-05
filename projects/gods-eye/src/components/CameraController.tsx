import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { getPositionAtDate } from '../data/orbitalMechanics';
import { allCelestialBodies } from '../data/celestialBodies';
import { useAppState } from '../hooks/useAppState';

const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 62, 78);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

export function CameraController({ simulatedDate }: { simulatedDate: Date }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const { followObjectId } = useAppState();
  const desiredTarget = useRef(new THREE.Vector3());

  // On mount, start at the elevated "God's Eye" position.
  useEffect(() => {
    camera.position.copy(DEFAULT_CAMERA_POSITION);
    camera.lookAt(DEFAULT_TARGET);
  }, [camera]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (followObjectId) {
      const body = allCelestialBodies.find((b) => b.id === followObjectId);
      if (body) {
        const [x, y, z] = getPositionAtDate(body.orbitalElements, simulatedDate);
        desiredTarget.current.set(x, y, z);
        controls.target.lerp(desiredTarget.current, 0.06);
      }
    } else {
      desiredTarget.current.set(0, 0, 0);
      controls.target.lerp(desiredTarget.current, 0.06);
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={220}
      maxPolarAngle={Math.PI * 0.49}
      makeDefault
    />
  );
}
