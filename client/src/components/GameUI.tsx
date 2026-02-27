import React from 'react';
import type { BattleResult, Piece } from '../types';

interface Props {
  turn: string;
  selectedPiece: Piece | null;
  battleResult: BattleResult | null;
  pieces: Piece[];
  isPaused: boolean;
  winner: 'white' | 'black' | null;
  setIsPaused: (paused: boolean) => void;
  resetGame: () => void;
}

export const GameUI: React.FC<Props> = ({ turn, selectedPiece, battleResult, pieces, isPaused, winner, setIsPaused, resetGame }) => {
  const whitePieces = pieces.filter(p => p.color === 'white');
  const blackPieces = pieces.filter(p => p.color === 'black');
  
  const whiteKills = whitePieces.reduce((sum, p) => sum + p.kills, 0);
  const blackKills = blackPieces.reduce((sum, p) => sum + p.kills, 0);

  const menuButtonStyle = {
    display: 'block',
    width: '100%',
    padding: '15px',
    marginBottom: '15px',
    fontSize: '18px',
    cursor: 'pointer',
    background: '#444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    transition: 'background 0.2s'
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      padding: '20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'sans-serif'
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Top Left: Score Board */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          minWidth: '150px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Scoreboard</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>White:</span>
            <span>{whitePieces.length} left (Kills: {whiteKills})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Black:</span>
            <span>{blackPieces.length} left (Kills: {blackKills})</span>
          </div>
        </div>

        {/* Top Center: Turn Indicator */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '24px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {turn}'s Turn
        </div>
        
        {/* Top Right Spacer / Menu Button */}
        <div style={{ minWidth: '150px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setIsPaused(true)}
            disabled={!!winner}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              border: '1px solid #444',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: winner ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              pointerEvents: 'auto',
              opacity: winner ? 0.5 : 1
            }}
          >
            Menu
          </button>
        </div>
      </div>

      {/* Game Over Overlay */}
      {winner && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          zIndex: 20
        }}>
          <div style={{
            background: winner === 'white' ? 'linear-gradient(135deg, #ffffff, #e0e0e0)' : 'linear-gradient(135deg, #424242, #1a1a1a)',
            padding: '50px 80px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: `0 0 40px ${winner === 'white' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.8)'}`,
            animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <h1 style={{ 
              color: winner === 'white' ? '#1a1a1a' : '#ffffff', 
              fontSize: '48px',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {winner} Wins!
            </h1>
            <p style={{ 
              color: winner === 'white' ? '#444' : '#aaa', 
              fontSize: '20px', 
              margin: '0 0 40px 0' 
            }}>
              The enemy King has fallen.
            </p>
            
            <button onClick={resetGame} style={{ 
              ...menuButtonStyle, 
              background: winner === 'white' ? '#1976d2' : '#d32f2f',
              padding: '20px',
              fontSize: '24px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          zIndex: 10
        }}>
          <div style={{
            background: '#222',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            minWidth: '300px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
          }}>
            <h1 style={{ color: 'white', marginTop: 0, marginBottom: '30px' }}>Game Paused</h1>
            
            <button onClick={() => setIsPaused(false)} style={menuButtonStyle}>
              Resume
            </button>
            
            <button onClick={resetGame} style={{ ...menuButtonStyle, background: '#d32f2f' }}>
              Restart Match
            </button>

            <button onClick={() => alert('Settings menu coming soon!')} style={menuButtonStyle}>
              Options
            </button>
          </div>
        </div>
      )}

      {/* Center: Battle Result Banner (Only show when not rolling to avoid overlap with 3D dice) */}
      {battleResult && (
        <div style={{
          background: battleResult.success ? 'rgba(0, 150, 0, 0.9)' : 'rgba(150, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          alignSelf: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          animation: 'popIn 0.3s ease-out',
          marginTop: 'auto',
          marginBottom: 'auto'
        }}>
          <h2>Battle Resolved!</h2>
          <div style={{ fontSize: '18px', margin: '10px 0' }}>
            Attacker Total: {battleResult.attackerTotal}
          </div>
          <div style={{ fontSize: '18px', margin: '10px 0' }}>
            Defender Total: {battleResult.defenderTotal}
          </div>
          <h3>{battleResult.success ? 'Attacker Wins!' : 'Defender Holds!'}</h3>
        </div>
      )}

      {/* Bottom Bar: Selected Piece Stats */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        {selectedPiece && (
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            color: 'black',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            pointerEvents: 'auto'
          }}>
            <h3 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>
              {selectedPiece.color} {selectedPiece.type}
            </h3>
            <div>⚔️ Kills: {selectedPiece.kills}</div>
            <div>🛡️ Defends: {selectedPiece.defends}</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
