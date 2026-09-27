import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { createSunTexture } from '../utils/textures';

const SUN_RADIUS = 2.1;
const SUN_COLOR = '#fff3d6';

export function Sun() {
  const meshRef = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);
  const texture = useMemo(() => createSunTexture(), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.025;
    }
    if (coronaRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.015;
      coronaRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <meshBasicMaterial map={texture} color={SUN_COLOR} />
      </mesh>
      {/* Restrained corona: layered soft shells with a slow pulse, no bloom pass */}
      <mesh ref={coronaRef} scale={1.12}>
        <sphereGeometry args={[SUN_RADIUS, 32, 32]} />
        <meshBasicMaterial color={SUN_COLOR} transparent opacity={0.14} depthWrite={false} />
      </mesh>
      <mesh scale={1.32}>
        <sphereGeometry args={[SUN_RADIUS, 32, 32]} />
        <meshBasicMaterial color={SUN_COLOR} transparent opacity={0.06} depthWrite={false} />
      </mesh>
      <mesh scale={1.6}>
        <sphereGeometry args={[SUN_RADIUS, 24, 24]} />
        <meshBasicMaterial color="#ffcf7a" transparent opacity={0.025} depthWrite={false} />
      </mesh>
      <pointLight color={SUN_COLOR} intensity={2.6} distance={0} decay={0.35} />
    </group>
  );
}
