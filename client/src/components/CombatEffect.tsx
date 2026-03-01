import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { BattleResult } from '../types';

interface Props {
  battleResult: BattleResult | null;
  isRolling: boolean;
  isSiegeFiring: 'white' | 'black' | null;
}

const Projectile = ({ index, color, direction }: { index: number, color: string, direction: 1 | -1 }) => {
  const ref = useRef<THREE.Mesh>(null);
  const startX = (Math.random() - 0.5) * 8;
  const startY = 15;
  const startZ = direction === 1 ? -15 : 15;
  
  const targetX = (Math.random() - 0.5) * 8;
  const targetY = 0;
  // White hits 0-3 (z: -3.5 to -0.5). Black hits 7-4 (z: 3.5 to 0.5)
  const targetZ = direction === 1 ? -3.5 + Math.random() * 3 : 3.5 - Math.random() * 3;

  useFrame((state) => {
    if (ref.current) {
      const t = (state.clock.getElapsedTime() * 1.5 + (index * 0.1)) % 2;
      if (t < 1) {
        ref.current.position.x = THREE.MathUtils.lerp(startX, targetX, t);
        ref.current.position.y = THREE.MathUtils.lerp(startY, targetY, Math.pow(t, 2));
        ref.current.position.z = THREE.MathUtils.lerp(startZ, targetZ, t);
        ref.current.rotation.x += 0.1;
        ref.current.visible = true;
      } else {
        ref.current.visible = false;
      }
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <icosahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
    </mesh>
  );
};

export const CombatEffect: React.FC<Props> = ({ battleResult, isRolling, isSiegeFiring }) => {
  const swordsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isRolling && swordsRef.current) {
      const time = state.clock.getElapsedTime();
      swordsRef.current.rotation.z = Math.sin(time * 30) * 0.3;
      swordsRef.current.rotation.y = time * 2;
      swordsRef.current.position.y = 1 + Math.sin(time * 15) * 0.1;
    }
  });

  return (
    <>
      {isSiegeFiring && (
        <group>
          {Array.from({ length: 12 }).map((_, i) => (
            <Projectile key={i} index={i} color="#ff5722" direction={isSiegeFiring === 'white' ? 1 : -1} />
          ))}
          {/* Landing Smoke/Fire Sparkles */}
          <group position={[0, 0.5, isSiegeFiring === 'white' ? -2 : 2]}>
             <Sparkles count={100} scale={[8, 1, 4]} size={10} speed={5} color="#ff9800" />
          </group>
        </group>
      )}

      {battleResult && (
        <group position={[battleResult.targetX - 3.5, 0.5, battleResult.targetY - 3.5]}>
          {isRolling && (
            <group>
              <Sparkles count={60} scale={2} size={6} speed={3} opacity={0.8} color="#ffeb3b" />
              <Sparkles count={40} scale={1.5} size={8} speed={4} opacity={0.8} color="#ff5722" />
              
              <group ref={swordsRef} position={[0, 1, 0]}>
                <mesh position={[-0.3, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
                  <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[-0.3, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
                  <boxGeometry args={[0.3, 0.05, 0.05]} />
                  <meshStandardMaterial color="#d32f2f" />
                </mesh>

                <mesh position={[0.3, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
                  <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0.3, -0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
                  <boxGeometry args={[0.3, 0.05, 0.05]} />
                  <meshStandardMaterial color="#1976d2" />
                </mesh>
              </group>
            </group>
          )}
        </group>
      )}
    </>
  );
};
