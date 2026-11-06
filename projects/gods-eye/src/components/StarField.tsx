import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Points } from 'three';

/**
 * A layered star field: a dense dim layer for depth, and a sparse brighter
 * layer that gently twinkles. Deliberately dim and small so it reads as
 * depth cues rather than a "gaming skybox".
 */
export function StarField() {
  const twinkleRef = useRef<Points>(null);

  const dim = useMemo(() => buildStars(2600, 300, 900, 0.42), []);
  const bright = useMemo(() => buildStars(260, 300, 900, 0.9), []);

  useFrame((state) => {
    if (twinkleRef.current) {
      const material = twinkleRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.65 + Math.sin(state.clock.elapsedTime * 1.4) * 0.2;
    }
  });

  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dim.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[dim.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </points>
      <points ref={twinkleRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[bright.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[bright.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={1.1}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function buildStars(count: number, minRadius: number, maxRadius: number, baseBrightness: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color('#c7d4e0'),
    new THREE.Color('#dbe6f0'),
    new THREE.Color('#f0e6d2'),
    new THREE.Color('#bfe0ec'),
  ];

  for (let i = 0; i < count; i++) {
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    const c = palette[Math.floor(Math.random() * palette.length)].clone();
    const brightness = baseBrightness * (0.6 + Math.random() * 0.5);
    c.multiplyScalar(brightness);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  return { positions, colors };
}
