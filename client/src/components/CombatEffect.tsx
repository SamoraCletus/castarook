import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import type { BattleResult } from '../types';

interface Props {
  battleResult: BattleResult | null;
  isRolling: boolean;
}

export const CombatEffect: React.FC<Props> = ({ battleResult, isRolling }) => {
  const swordsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isRolling && swordsRef.current) {
      // Animate the swords clashing (rapidly wobbling and shaking)
      const time = state.clock.getElapsedTime();
      swordsRef.current.rotation.z = Math.sin(time * 30) * 0.3;
      swordsRef.current.rotation.y = time * 2; // slow spin
      swordsRef.current.position.y = 1 + Math.sin(time * 15) * 0.1;
    }
  });

  if (!battleResult) return null;

  const posX = battleResult.targetX - 3.5;
  const posZ = battleResult.targetY - 3.5;

  return (
    <group position={[posX, 0.5, posZ]}>
      {isRolling && (
        <group>
          {/* Intense Sparkles to indicate a fight */}
          <Sparkles count={60} scale={2} size={6} speed={3} opacity={0.8} color="#ffeb3b" />
          <Sparkles count={40} scale={1.5} size={8} speed={4} opacity={0.8} color="#ff5722" />
          
          <group ref={swordsRef} position={[0, 1, 0]}>
            {/* Sword 1 */}
            <mesh position={[-0.3, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 8]} />
              <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[-0.3, -0.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.3, 0.05, 0.05]} />
              <meshStandardMaterial color="#d32f2f" />
            </mesh>

            {/* Sword 2 */}
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
  );
};
