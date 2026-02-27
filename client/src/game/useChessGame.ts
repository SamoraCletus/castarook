import { useState } from 'react';
import type { Piece, BattleResult } from '../types';
import { setupBoard, getValidMoves, rollDice } from './ChessLogic';

export const useChessGame = () => {
  const [pieces, setPieces] = useState<Piece[]>(setupBoard());
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);

  const resetGame = () => {
    setPieces(setupBoard());
    setTurn('white');
    setSelectedPieceId(null);
    setBattleResult(null);
    setIsRolling(false);
    setIsPaused(false);
    setWinner(null);
  };

  const getPieceAt = (x: number, y: number) => pieces.find(p => p.x === x && p.y === y);

  const handleSquareClick = (x: number, y: number) => {
    if (isRolling || isPaused || winner) return; // Block input during dice roll, pause, or game over

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
          
          setIsRolling(true);
          setBattleResult({ 
            attackerRoll, attackerTotal, attackerStats: selectedPiece.kills,
            defenderRoll, defenderTotal, defenderStats: clickedPiece.defends,
            success 
          });

          setTimeout(() => {
            setIsRolling(false);
            if (success) {
              // Attacker wins
              if (clickedPiece.type === 'king') {
                setWinner(selectedPiece.color);
              }
              setPieces(prev => prev.map(p => {
                if (p.id === selectedPiece.id) return { ...p, x, y, kills: p.kills + 1 };
                return p;
              }).filter(p => p.id !== clickedPiece.id));
            } else {
              // Defender wins, attacker is destroyed
              if (selectedPiece.type === 'king') {
                 setWinner(clickedPiece.color);
              }
              setPieces(prev => prev.map(p => {
                if (p.id === clickedPiece.id) return { ...p, defends: p.defends + 1 };
                return p;
              }).filter(p => p.id !== selectedPiece.id));
            }
            if (clickedPiece.type !== 'king' && selectedPiece.type !== 'king' || (!success && selectedPiece.type !== 'king') || (success && clickedPiece.type !== 'king')) {
                setTurn(turn === 'white' ? 'black' : 'white');
            }
            setSelectedPieceId(null);
          }, 2000); // Show rolling animation for 2 seconds

          return;
        } else if (!clickedPiece) {
          // Normal empty square move
          setPieces(prev => prev.map(p => {
            if (p.id === selectedPiece.id) return { ...p, x, y };
            return p;
          }));
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
    setIsPaused,
    resetGame,
    handleSquareClick
  };
};
