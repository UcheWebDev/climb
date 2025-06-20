import { useState, useCallback } from 'react';

interface GameState {
  player1Position: number;
  player2Position: number;
  currentPlayer: number;
  diceValue: number;
  winner: number | null;
  gameOver: boolean;
}

const SNAKES_AND_LADDERS: Record<number, number> = {
  // Ladders
  1: 38,
  4: 14,
  8: 30,
  21: 42,
  28: 76,
  50: 67,
  71: 92,
  80: 99,
  
  // Snakes
  32: 10,
  36: 6,
  48: 26,
  62: 18,
  88: 24,
  95: 56,
  97: 78,
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState>({
    player1Position: 0,
    player2Position: 0,
    currentPlayer: 1,
    diceValue: 0,
    winner: null,
    gameOver: false,
  });

  const rollDice = useCallback(() => {
    if (gameState.gameOver) return;

    const diceRoll = Math.floor(Math.random() * 6) + 1;
    
    setGameState(prevState => {
      const currentPlayerPosition = prevState.currentPlayer === 1 
        ? prevState.player1Position 
        : prevState.player2Position;
      
      let newPosition = currentPlayerPosition + diceRoll;
      
      // Can't exceed 100
      if (newPosition > 100) {
        newPosition = currentPlayerPosition;
      } else {
        // Check for snakes and ladders
        if (SNAKES_AND_LADDERS[newPosition]) {
          newPosition = SNAKES_AND_LADDERS[newPosition];
        }
      }
      
      // Check for winner
      const isWinner = newPosition === 100;
      
      const newState: GameState = {
        ...prevState,
        diceValue: diceRoll,
        winner: isWinner ? prevState.currentPlayer : null,
        gameOver: isWinner,
        currentPlayer: isWinner ? prevState.currentPlayer : (prevState.currentPlayer === 1 ? 2 : 1),
      };
      
      if (prevState.currentPlayer === 1) {
        newState.player1Position = newPosition;
      } else {
        newState.player2Position = newPosition;
      }
      
      return newState;
    });
  }, [gameState.gameOver]);

  const restartGame = useCallback(() => {
    setGameState({
      player1Position: 0,
      player2Position: 0,
      currentPlayer: 1,
      diceValue: 0,
      winner: null,
      gameOver: false,
    });
  }, []);

  return {
    ...gameState,
    rollDice,
    restartGame,
  };
};