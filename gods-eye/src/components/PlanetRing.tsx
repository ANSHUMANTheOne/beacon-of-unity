import { useMemo } from 'react';
import * as THREE from 'three';
import { createRingTexture } from '../utils/textures';

interface PlanetRingProps {
  planetRadius: number;
  color: string;
}

export function PlanetRing({ planetRadius, color }: PlanetRingProps) {
  const texture = useMemo(() => createRingTexture(color), [color]);

  const geometry = useMemo(() => {
    const inner = planetRadius * 1.35;
    const outer = planetRadius * 2.3;
    const geo = new THREE.RingGeometry(inner, outer, 96, 1);
    // Map the ring's radial extent onto the 1D gradient texture's U axis.
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const distance = v3.length();
      const t = (distance - inner) / (outer - inner);
      uv.setXY(i, t, 0.5);
    }
    return geo;
  }, [planetRadius]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2.35, 0, 0]}>
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
