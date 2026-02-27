import { useState } from 'react';
import type { Piece, BattleResult, LogEntry } from '../types';
import { setupBoard, getValidMoves, rollDice } from './ChessLogic';

export const useChessGame = () => {
  const [pieces, setPieces] = useState<Piece[]>(setupBoard());
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [fogNear, setFogNear] = useState(10);
  const [fogFar, setFogFar] = useState(80);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const resetGame = () => {
    setPieces(setupBoard());
    setTurn('white');
    setSelectedPieceId(null);
    setBattleResult(null);
    setIsRolling(false);
    setIsPaused(false);
    setWinner(null);
    setHasStarted(true); // Don't show start screen again on reset
    setLogs([]);
    addLog('Match Restarted', 'move');
  };

  const getPieceAt = (x: number, y: number) => pieces.find(p => p.x === x && p.y === y);

  const handleSquareClick = (x: number, y: number) => {
    if (isRolling || isPaused || winner || !hasStarted) return; // Block input during dice roll, pause, game over, or if not started

    // Clear battle result on next action if it's already shown
    if (battleResult && !isRolling) setBattleResult(null);

    const clickedPiece = getPieceAt(x, y);
    const selectedPiece = pieces.find(p => p.id === selectedPieceId);

    // If a piece is selected and a valid move is chosen
    if (selectedPiece) {
      const validMoves = getValidMoves(selectedPiece, pieces);
      const isValidMove = validMoves.some(m => m.x === x && m.y === y);

      if (isValidMove) {
        if (clickedPiece && clickedPiece.color !== selectedPiece.color) {
          // RPG Battle Phase!
          const attackerRoll = rollDice();
          const defenderRoll = rollDice();
          const attackerTotal = attackerRoll + selectedPiece.kills;
          const defenderTotal = defenderRoll + clickedPiece.defends;
          
          const success = attackerTotal > defenderTotal;
          const damage = Math.abs(attackerTotal - defenderTotal);
          
          setIsRolling(true);
          setBattleResult({ 
            attackerRoll, attackerTotal, attackerStats: selectedPiece.kills,
            defenderRoll, defenderTotal, defenderStats: clickedPiece.defends,
            success,
            targetX: x, targetY: y
          });

          setTimeout(() => {
            setIsRolling(false);
            if (success) {
              // Attacker wins
              const newHp = clickedPiece.hp - damage;
              const defenderKilled = newHp <= 0;
              
              if (defenderKilled) {
                if (clickedPiece.type === 'king') {
                  setWinner(selectedPiece.color);
                  addLog(`${selectedPiece.color.toUpperCase()} SLAUGHTERED THE KING!`, 'kill');
                } else {
                  addLog(`${selectedPiece.color} ${selectedPiece.type} killed ${clickedPiece.color} ${clickedPiece.type}`, 'kill');
                }
                setPieces(prev => prev.map(p => {
                  if (p.id === selectedPiece.id) {
                    let type = p.type;
                    let maxHp = p.maxHp;
                    let hp = p.hp;
                    // Promotion
                    if (p.type === 'pawn' && (y === 0 || y === 7)) {
                      type = 'queen';
                      maxHp = 40;
                      hp = 40;
                      addLog(`${p.color} Pawn promoted to Queen!`, 'promotion');
                    }
                    return { ...p, x, y, type, hp, maxHp, kills: p.kills + 1, hasMoved: true };
                  }
                  return p;
                }).filter(p => p.id !== clickedPiece.id));
              } else {
                addLog(`${selectedPiece.color} ${selectedPiece.type} dealt ${damage} dmg to ${clickedPiece.color} ${clickedPiece.type}`, 'attack');
                setPieces(prev => prev.map(p => {
                  if (p.id === clickedPiece.id) return { ...p, hp: newHp };
                  if (p.id === selectedPiece.id) return { ...p, hasMoved: true };
                  return p;
                }));
              }
            } else {
              // Defender wins (or draw)
              const newHp = selectedPiece.hp - (damage === 0 ? 1 : damage); // Draw deals 1 damage to attacker
              const attackerKilled = newHp <= 0;
              
              if (attackerKilled) {
                addLog(`${clickedPiece.color} ${clickedPiece.type} counter-killed ${selectedPiece.color} ${selectedPiece.type}`, 'kill');
                if (selectedPiece.type === 'king') {
                   setWinner(clickedPiece.color);
                   addLog(`${clickedPiece.color.toUpperCase()} DEFENDED THE THRONE!`, 'kill');
                }
                setPieces(prev => prev.map(p => {
                  if (p.id === clickedPiece.id) return { ...p, defends: p.defends + 1 };
                  return p;
                }).filter(p => p.id !== selectedPiece.id));
              } else {
                addLog(`${clickedPiece.color} ${clickedPiece.type} repelled attack (${damage === 0 ? 1 : damage} dmg to attacker)`, 'attack');
                setPieces(prev => prev.map(p => {
                  if (p.id === selectedPiece.id) return { ...p, hp: newHp, hasMoved: true };
                  if (p.id === clickedPiece.id) return { ...p, defends: p.defends + 1 }; // Integer bonus for survival
                  return p;
                }));
              }
            }
            
            // Turn always ends after an attack
            setTurn(turn === 'white' ? 'black' : 'white');
            setSelectedPieceId(null);
          }, 2000); 

          return;
        } else if (!clickedPiece) {
          // Normal empty square move
          setPieces(prev => {
            let nextPieces = prev.map(p => {
              if (p.id === selectedPiece.id) {
                let type = p.type;
                let maxHp = p.maxHp;
                let hp = p.hp;
                // Promotion
                if (p.type === 'pawn' && (y === 0 || y === 7)) {
                  type = 'queen';
                  maxHp = 40;
                  hp = 40;
                  addLog(`${p.color} Pawn promoted to Queen!`, 'promotion');
                }
                return { ...p, x, y, type, hp, maxHp, hasMoved: true };
              }
              return p;
            });

            // Castling Move Execution (Rook follows)
            if (selectedPiece.type === 'king' && Math.abs(x - selectedPiece.x) === 2) {
              const isKingside = x > selectedPiece.x;
              const row = selectedPiece.color === 'white' ? 0 : 7;
              const rookX = isKingside ? 7 : 0;
              const newRookX = isKingside ? 5 : 3;
              addLog(`${selectedPiece.color} Castled ${isKingside ? 'Kingside' : 'Queenside'}`, 'castle');
              nextPieces = nextPieces.map(p => {
                if (p.type === 'rook' && p.color === selectedPiece.color && p.x === rookX && p.y === row) {
                  return { ...p, x: newRookX, hasMoved: true };
                }
                return p;
              });
            } else {
              addLog(`${selectedPiece.color} ${selectedPiece.type} moved to ${String.fromCharCode(97 + x)}${y + 1}`, 'move');
            }

            return nextPieces;
          });
          setTurn(turn === 'white' ? 'black' : 'white');
          setSelectedPieceId(null);
          return;
        }
      }
    }

    // Select piece if it belongs to current player
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedPieceId(clickedPiece.id);
    } else {
      setSelectedPieceId(null);
    }
  };

  return {
    pieces,
    turn,
    selectedPieceId,
    battleResult,
    isRolling,
    isPaused,
    winner,
    isNight,
    hasStarted,
    fogNear,
    fogFar,
    logs,
    setFogNear,
    setFogFar,
    setHasStarted,
    setIsNight,
    setIsPaused,
    resetGame,
    handleSquareClick
  };
};
