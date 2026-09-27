import { Sun } from './Sun';
import { Planet } from './Planet';
import { OrbitPath } from './OrbitPath';
import { StarField } from './StarField';
import { planets, neoSampleObjects } from '../data/celestialBodies';
import { useAppState, useSimulationClock } from '../hooks/useAppState';

export function SolarSystem() {
  const { visibility, simulatedDate, selectedObjectId, selectObject, showOrbitForId } = useAppState();
  useSimulationClock();

  const neos = neoSampleObjects.filter((body) => visibility[body.category]);
  const visiblePlanets = visibility.planet ? planets : [];

  return (
    <group>
      <ambientLight intensity={0.18} />
      <StarField />
      <Sun />

      {visiblePlanets.map((body) => (
        <group key={body.id}>
          <OrbitPath
            elements={body.orbitalElements}
            color={body.color}
            highlighted={selectedObjectId === body.id || showOrbitForId === body.id}
            onClick={() => selectObject(body.id)}
          />
          <Planet body={body} simulatedDate={simulatedDate} />
        </group>
      ))}

      {neos.map((body) => (
        <group key={body.id}>
          <OrbitPath
            elements={body.orbitalElements}
            color={body.color}
            highlighted={selectedObjectId === body.id || showOrbitForId === body.id}
            onClick={() => selectObject(body.id)}
          />
          <Planet body={body} simulatedDate={simulatedDate} />
        </group>
      ))}

      {/* Deselect when clicking empty space */}
      <mesh
        visible={false}
        onClick={(e) => {
          e.stopPropagation();
          selectObject(null);
        }}
      >
        <sphereGeometry args={[400, 8, 8]} />
        <meshBasicMaterial side={2} />
      </mesh>
    </group>
  );
}
