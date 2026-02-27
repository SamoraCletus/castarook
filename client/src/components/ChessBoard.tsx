import React from 'react';
import { useCursor } from '@react-three/drei';
import type { Piece, Position } from '../types';

interface SquareProps {
  x: number;
  y: number;
  color: string;
  isHighlight: boolean;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ x, y, color, isHighlight, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  useCursor(hovered);

  const displayColor = isHighlight ? '#ffeb3b' : (hovered ? '#c8e6c9' : color);

  return (
    <mesh 
      position={[x - 3.5, 0.01, y - 3.5]} 
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      receiveShadow
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={displayColor} />
    </mesh>
  );
};

interface BoardProps {
  pieces: Piece[];
  selectedPieceId: string | null;
  validMoves: Position[];
  onSquareClick: (x: number, y: number) => void;
  boardStyle: 'wood' | 'stone' | 'marble';
}

export const ChessBoard: React.FC<BoardProps> = ({ validMoves, onSquareClick, boardStyle }) => {
  const squares = [];
  
  const getStyleColors = () => {
    switch (boardStyle) {
      case 'stone': return { light: '#999', dark: '#444', base: '#222' };
      case 'marble': return { light: '#fff', dark: '#71d5e4', base: '#004d40' };
      default: return { light: '#f0d9b5', dark: '#b58863', base: '#4a3b2c' };
    }
  };

  const styleColors = getStyleColors();
  
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const isBlack = (x + y) % 2 === 1;
      const color = isBlack ? styleColors.dark : styleColors.light;
      const isHighlight = validMoves.some(m => m.x === x && m.y === y);
      
      squares.push(
        <Square 
          key={`${x}-${y}`} 
          x={x} 
          y={y} 
          color={color} 
          isHighlight={isHighlight}
          onClick={() => onSquareClick(x, y)}
        />
      );
    }
  }

  return (
    <group>
      {/* Board Base */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8.4, 1, 8.4]} />
        <meshStandardMaterial color={styleColors.base} />
      </mesh>
      
      {/* Squares */}
      {squares}
    </group>
  );
};
