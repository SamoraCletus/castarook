import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

const Tree = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
        <meshStandardMaterial color="#4d2c19" />
      </mesh>
      {/* Leaves */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
    </group>
  );
};

const Firecamp = ({ position }: { position: [number, number, number] }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (lightRef.current) {
      // Flicker effect
      lightRef.current.intensity = 2 + Math.sin(state.clock.getElapsedTime() * 10) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Logs */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.1, 0.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#331a00" />
      </mesh>
      <mesh rotation={[0, Math.PI / 3, Math.PI / 2]} position={[0, 0.1, -0.2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color="#331a00" />
      </mesh>
      
      {/* Fire Effect */}
      <group position={[0, 0.3, 0]}>
        <pointLight ref={lightRef} color="#ff5722" distance={10} decay={2} castShadow />
        <Sparkles count={20} scale={0.5} size={4} speed={2} color="#ff9800" />
        <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#ff5722" emissive="#ff5722" emissiveIntensity={2} transparent opacity={0.6} />
          </mesh>
        </Float>
      </group>
    </group>
  );
};

export const Scenery = ({ isNight }: { isNight: boolean }) => {
  const trees: [number, number, number][] = [
    [-8, 0, -8], [-10, 0, -5], [-7, 0, -10],
    [8, 0, 8], [10, 0, 5], [7, 0, 10],
    [-8, 0, 8], [-10, 0, 5], [-7, 0, 10],
    [8, 0, -8], [10, 0, -5], [7, 0, -10],
  ];

  const firecamps: [number, number, number][] = [
    [-6, 0, -6], [6, 0, 6], [-6, 0, 6], [6, 0, -6]
  ];

  return (
    <group>
      {/* Ground plane for scenery */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={isNight ? "#1a2a1a" : "#2d4a2d"} />
      </mesh>

      {trees.map((pos, i) => <Tree key={`tree-${i}`} position={pos} />)}
      
      {isNight && firecamps.map((pos, i) => <Firecamp key={`fire-${i}`} position={pos} />)}
    </group>
  );
};
