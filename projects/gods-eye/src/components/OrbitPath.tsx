import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { getOrbitPathPoints } from '../data/orbitalMechanics';
import type { OrbitalElements } from '../types/celestial';

interface OrbitPathProps {
  elements: OrbitalElements;
  color: string;
  highlighted: boolean;
  onClick: () => void;
}

export function OrbitPath({ elements, color, highlighted, onClick }: OrbitPathProps) {
  const points = useMemo(() => getOrbitPathPoints(elements), [elements]);

  return (
    <Line
      points={points}
      color={highlighted ? '#a9e8f2' : color}
      transparent
      opacity={highlighted ? 0.85 : 0.22}
      lineWidth={highlighted ? 1.4 : 1}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    />
  );
}
