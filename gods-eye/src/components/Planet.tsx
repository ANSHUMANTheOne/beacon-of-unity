import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group } from 'three';
import { getPositionAtDate } from '../data/orbitalMechanics';
import type { CelestialBody } from '../types/celestial';
import { useAppState } from '../hooks/useAppState';
import { createGasGiantTexture, createRockyTexture } from '../utils/textures';
import { PlanetRing } from './PlanetRing';

interface PlanetProps {
  body: CelestialBody;
  simulatedDate: Date;
}

const GAS_KINDS = new Set(['gas-giant', 'ice-giant']);

export function Planet({ body, simulatedDate }: PlanetProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { selectedObjectId, selectObject } = useAppState();
  const isSelected = selectedObjectId === body.id;

  const position = useMemo(
    () => getPositionAtDate(body.orbitalElements, simulatedDate),
    [body.orbitalElements, simulatedDate]
  );

  const isAsteroidLike = body.kind === 'asteroid' || body.kind === 'comet';
  const isGasLike = GAS_KINDS.has(body.kind);

  const texture = useMemo(() => {
    // Star has its own material; asteroids/comets stay untextured (too small
    // on screen for surface detail to read, and it keeps them visually
    // distinct as "small bodies" vs. planets).
    if (isAsteroidLike) return null;
    const seed = body.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return isGasLike ? createGasGiantTexture(body.color, seed) : createRockyTexture(body.color, seed);
  }, [body.id, body.color, isAsteroidLike, isGasLike]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const spinSpeed = isGasLike ? 0.28 : 0.12;
      groupRef.current.rotation.y += delta * spinSpeed;
    }
  });

  return (
    <group position={position}>
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          selectObject(body.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh>
          <sphereGeometry args={[body.displayRadius, isAsteroidLike ? 10 : 48, isAsteroidLike ? 10 : 48]} />
          <meshStandardMaterial
            map={texture ?? undefined}
            color={texture ? undefined : body.color}
            emissive={isSelected ? body.color : '#000000'}
            emissiveIntensity={isSelected ? 0.35 : 0}
            roughness={isAsteroidLike ? 1 : isGasLike ? 0.85 : 0.92}
            metalness={isAsteroidLike ? 0.15 : 0.02}
            flatShading={isAsteroidLike}
          />
        </mesh>

        {/* Thin atmospheric rim — Fresnel-style falloff via a slightly larger
            backface shell, restrained to Earth/Venus for now. */}
        {body.id === 'earth' && (
          <mesh scale={1.06}>
            <sphereGeometry args={[body.displayRadius, 32, 32]} />
            <meshBasicMaterial color="#6fc7e8" transparent opacity={0.16} side={1} depthWrite={false} />
          </mesh>
        )}
        {body.id === 'venus' && (
          <mesh scale={1.05}>
            <sphereGeometry args={[body.displayRadius, 32, 32]} />
            <meshBasicMaterial color="#e8d29a" transparent opacity={0.14} side={1} depthWrite={false} />
          </mesh>
        )}

        {body.id === 'saturn' && <PlanetRing planetRadius={body.displayRadius} color={body.color} />}

        {(isSelected || hovered) && (
          <mesh>
            <ringGeometry args={[body.displayRadius * 1.6, body.displayRadius * 1.75, 48]} />
            <meshBasicMaterial color="#a9e8f2" transparent opacity={isSelected ? 0.7 : 0.35} side={2} />
          </mesh>
        )}
      </group>

      <Html distanceFactor={18} occlude={false} zIndexRange={[10, 0]}>
        <div
          className={`select-none whitespace-nowrap font-mono-data text-[10px] tracking-wider uppercase transition-all duration-300 ${
            isSelected
              ? 'text-cyan-100 opacity-100 translate-y-0'
              : hovered
                ? 'text-slate-200 opacity-90'
                : 'text-slate-400 opacity-40'
          }`}
          style={{ transform: 'translate(10px, -6px)' }}
        >
          {body.name}
        </div>
      </Html>
    </group>
  );
}
