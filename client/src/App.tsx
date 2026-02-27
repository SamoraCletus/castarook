import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Stars } from '@react-three/drei';
import { useChessGame } from './game/useChessGame';
import { getValidMoves } from './game/ChessLogic';
import { ChessBoard } from './components/ChessBoard';
import { ChessPiece } from './components/ChessPiece';
import { GameUI } from './components/GameUI';
import { DiceRoll } from './components/DiceRoll';

function App() {
  const { pieces, turn, selectedPieceId, battleResult, isRolling, isPaused, winner, setIsPaused, resetGame, handleSquareClick } = useChessGame();

  const selectedPiece = useMemo(() => 
    pieces.find(p => p.id === selectedPieceId) || null,
  [pieces, selectedPieceId]);

  const validMoves = useMemo(() => 
    selectedPiece ? getValidMoves(selectedPiece, pieces) : [],
  [selectedPiece, pieces]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 8, -10], fov: 50 }}>
        {/* Lighting & Environment - Better Skybox */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          castShadow 
          position={[5, 15, -5]} 
          intensity={1.2} 
          shadow-mapSize={[2048, 2048]} 
        />
        
        {/* Epic Twilight/Sunset Skybox */}
        <Sky sunPosition={[0, 1, -10]} turbidity={0.3} rayleigh={2} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="sunset" />

        {/* Game Scene */}
        <group>
          <ChessBoard 
            pieces={pieces} 
            selectedPieceId={selectedPieceId} 
            validMoves={validMoves} 
            onSquareClick={handleSquareClick} 
          />
          {pieces.map(piece => (
            <ChessPiece 
              key={piece.id} 
              piece={piece} 
              isSelected={piece.id === selectedPieceId} 
              onClick={() => handleSquareClick(piece.x, piece.y)}
            />
          ))}
        </group>

        {/* 3D Dice Rolling Animation */}
        {(isRolling || battleResult) && battleResult && (
           <DiceRoll 
             attackerRoll={battleResult.attackerRoll} 
             attackerStats={battleResult.attackerStats}
             defenderRoll={battleResult.defenderRoll} 
             defenderStats={battleResult.defenderStats}
             isRolling={isRolling} 
           />
        )}

        {/* Camera Controls */}
        <OrbitControls 
          target={[0, 0, 0]} 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={5} 
          maxDistance={25} 
          enabled={!isPaused} // Disable camera rotation when paused
        />
      </Canvas>

      {/* 2D UI Overlay */}
      <GameUI 
        turn={turn} 
        selectedPiece={selectedPiece} 
        battleResult={isRolling ? null : battleResult} // Hide 2D result while rolling
        pieces={pieces}
        isPaused={isPaused}
        winner={winner}
        setIsPaused={setIsPaused}
        resetGame={resetGame}
      />
    </div>
  );
}

export default App;
