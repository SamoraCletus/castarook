import React from 'react';
import { useCursor, Text } from '@react-three/drei';
import type { Piece, Position } from '../types';

interface SquareProps {
  x: number;
  y: number;
  color: string;
  isHighlight: boolean;
  highlightColor?: string;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ x, y, color, isHighlight, highlightColor, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  useCursor(hovered);

  const displayColor = isHighlight ? (highlightColor || '#ffeb3b') : (hovered ? '#c8e6c9' : color);

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
      <meshStandardMaterial 
        color={displayColor} 
        emissive={isHighlight ? (highlightColor || '#fbc02d') : '#000'}
        emissiveIntensity={isHighlight ? 0.5 : 0}
      />
    </mesh>
  );
};

interface BoardProps {
  pieces: Piece[];
  selectedPieceId: string | null;
  validMoves: Position[];
  highlightSquares?: Position[];
  highlightColor?: string;
  onSquareClick: (x: number, y: number) => void;
  boardStyle: 'wood' | 'stone' | 'marble';
  showCoordinates?: boolean;
}

export const ChessBoard: React.FC<BoardProps> = ({ validMoves, highlightSquares = [], highlightColor, onSquareClick, boardStyle, showCoordinates }) => {
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
      
      const isMoveHighlight = validMoves.some(m => m.x === x && m.y === y);
      const isExtraHighlight = highlightSquares.some(m => m.x === x && m.y === y);
      const isHighlight = isMoveHighlight || isExtraHighlight;
      const squareHighlightColor = isExtraHighlight ? highlightColor : undefined;
      
      squares.push(
        <Square 
          key={`${x}-${y}`} 
          x={x} 
          y={y} 
          color={color} 
          isHighlight={isHighlight}
          highlightColor={squareHighlightColor}
          onClick={() => onSquareClick(x, y)}
        />
      );
    }
  }

  const renderCoordinates = () => {
    if (!showCoordinates) return null;
    const labels = [];
    const textColor = boardStyle === 'stone' ? '#fff' : '#d4af37';

    for (let i = 0; i < 8; i++) {
      // A-H (X-axis)
      labels.push(
        <Text
          key={`label-x-${i}`}
          position={[i - 3.5, 0.51, 4.3]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.3}
          color={textColor}
        >
          {String.fromCharCode(65 + i)}
        </Text>
      );
      // 1-8 (Y-axis)
      labels.push(
        <Text
          key={`label-y-${i}`}
          position={[-4.3, 0.51, i - 3.5]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          fontSize={0.3}
          color={textColor}
        >
          {i + 1}
        </Text>
      );
    }
    return labels;
  };

  return (
    <group>
      {/* Board Base */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8.4, 1, 8.4]} />
        <meshStandardMaterial color={styleColors.base} />
      </mesh>
      
      {/* Coordinates */}
      {renderCoordinates()}

      {/* Squares */}
      {squares}
    </group>
  );
};
