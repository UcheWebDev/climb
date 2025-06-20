import React, { useState, useEffect, useMemo } from 'react';
import Confetti from 'react-confetti';
import Board from './Board';
import ChatBox from './ChatBox';
import GameLobby from './GameLobby';
import GameSkeleton from './GameSkeleton';
import { useSupabaseMultiplayer } from '../hooks/useSupabaseMultiplayer';
import { useRoute, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';

interface GameLayoutProps {
  roomId?: string;
}

const GameLayout: React.FC<GameLayoutProps> = ({ roomId }) => {
  const { user } = useAuth();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [currentWin, setCurrentWin] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // If roomId is provided (from route), use it as initial value
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(roomId || null);

  // If on /game/:id route, get id param
  const [match, params] = useRoute('/game/:id');
  const [, navigate] = useLocation();
  useEffect(() => {
    if (params && params.id && params.id !== currentRoomId) {
      setCurrentRoomId(params.id);
    }
  }, [params, currentRoomId]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Multiplayer game hook
  const {
    gameState,
    onlinePlayers,
    loading,
    error,
    isConnected,
    isMyTurn,
    createGame,
    joinGame,
    rollDice,
    leaveGame,
    messages,
    sendMessage,
  } = useSupabaseMultiplayer(user?.email || '', currentRoomId || undefined);

  // Determine if game is over
  const isGameOver = gameState?.winner !== null;
  const winner = gameState?.winner ? 
    (gameState.winner === gameState.player1_id ? gameState.player1_name : gameState.player2_name) : 
    null;

  // Determine if 5 rounds are completed
  const rounds = gameState?.round || [];
  const isMatchOver = rounds.length === 5;
  // Count wins for each player
  const player1Wins = rounds.filter((name) => name === gameState?.player1_name).length;
  const player2Wins = rounds.filter((name) => name === gameState?.player2_name).length;
  let overallWinner: string | null = null;
  if (isMatchOver) {
    if (player1Wins > player2Wins) overallWinner = gameState?.player1_name || null;
    else if (player2Wins > player1Wins) overallWinner = gameState?.player2_name || null;
    else overallWinner = 'Draw';
  }

  // Show confetti when game ends
  useEffect(() => {
    if (winner) {
      setShowConfetti(true);
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [winner]);

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(Number(e.target.value));
  };

  const incrementBet = () => {
    setBetAmount(prev => prev + 10);
  };

  const decrementBet = () => {
    setBetAmount(prev => Math.max(0, prev - 10));
  };

  const handleRestartGame = () => {
    setCurrentRoomId(null);
    setShowConfetti(false);
    navigate('/');
  };

  const handleGameJoined = (roomId: string) => {
    setCurrentRoomId(roomId);
  };

  const handleLeaveGame = async () => {
    await leaveGame();
    setCurrentRoomId(null);
    navigate('/');
  };

  // Show lobby if not in a game
  if (!currentRoomId) {
    return <GameLobby />;
  }

  // Show skeleton if loading or not connected
  if (loading || !isConnected) {
    return <GameSkeleton />;
  }

  // Show error if there's an error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 w-full p-4">
        <div className="bg-white/10 border border-blue-900/30 rounded-2xl p-8 max-w-md shadow-xl backdrop-blur-md">
          <h3 className="text-2xl font-bold mb-4 text-blue-100 text-center">Error</h3>
          <p className="text-red-200 mb-4 text-center">{error.message}</p>
          <button
            onClick={handleRestartGame}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 mt-2"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-xl justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 w-full p-6">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      {/* Winner Dialog */}
      {isMatchOver && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="p-8 rounded-3xl shadow-2xl w-full max-w-md bg-gradient-to-br from-green-400/80 to-green-600/90 border border-green-900/30">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center drop-shadow-lg">
              {overallWinner === 'Draw' ? 'It\'s a Draw!' : `${overallWinner} Wins the Match! 🎉`}
            </h2>
            <p className="text-lg md:text-xl text-white text-center mb-6">
              {gameState?.player1_name}: {player1Wins} rounds<br />
              {gameState?.player2_name}: {player2Wins} rounds
            </p>
            <button
              onClick={handleRestartGame}
              className="w-full bg-white text-green-900 px-6 py-3 rounded-xl font-semibold hover:bg-green-100 transition-colors duration-200"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Game Info Card */}
      <div className="flex flex-col w-full max-w-md mb-4 px-4 py-3 rounded-2xl bg-white/10 border border-blue-900/30 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between w-full">
          <div className="text-center">
            <p className="text-xs text-blue-200">Room ID</p>
            <p className="text-lg font-bold text-green-300 tracking-widest">{currentRoomId}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-blue-200">Online</p>
            <p className="text-lg font-bold text-blue-300">{onlinePlayers.length}</p>
          </div>
          <button
            onClick={handleLeaveGame}
            className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Leave
          </button>
        </div>
        {/* Player Emoji Row */}
        <div className="flex w-full justify-between items-center text-xs gap-2 mt-2">
          <div className="flex items-center gap-1">
            <span className="text-lg">🧑</span>
            <span className={`truncate max-w-[80px] ${user?.email === gameState?.player1_id ? 'font-bold text-green-200' : 'text-blue-100'}`}>{gameState?.player1_name || 'Player 1'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg">🤖</span>
            <span className={`truncate max-w-[80px] ${user?.email === gameState?.player2_id ? 'font-bold text-green-200' : 'text-blue-100'}`}>{gameState?.player2_name || 'Player 2'}</span>
          </div>
        </div>
      </div>

      {/* Top row of question marks */}
      <div className="flex space-x-4 mb-4">
        {[...Array(5)].map((_, i) => {
          const roundWinner = rounds[i];
          let icon = '?';
          if (roundWinner) {
            if (roundWinner === gameState?.player1_name) {
              icon = '🧑';
            } else if (roundWinner === gameState?.player2_name) {
              icon = '🤖';
            }
          }
          return (
            <div key={i} className="w-12 h-12 bg-blue-900/60 rounded-full flex items-center justify-center border border-blue-800 text-blue-100 text-2xl shadow-md">
              {icon}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center mb-5 w-full px-4">
        {/* Board component in the center */}
        <div className="w-full max-w-[400px] h-auto relative shadow-xl rounded-2xl bg-white/10 border border-blue-900/30 p-2 backdrop-blur-md">
          <Board 
            gameState={gameState} 
            currentPlayerId={user?.email || ''}
          />
        </div>
      </div>

      {/* Game Controls */}
      {isGameOver ? (
        <button
          type="button"
          onClick={handleRestartGame}
          className="bg-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-purple-700 transition-all duration-200 shadow-md mt-4"
        >
          Play Again
        </button>
      ) : onlinePlayers.length === 2 ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-md mb-8">
          {/* Turn indicator */}
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-100 drop-shadow-lg">
              {isMyTurn ? "Your Turn" : "Opponent's Turn"}
            </p>
            {gameState?.dice_value && (
              <p className="text-lg text-yellow-400 mt-2">
                Dice: {gameState.dice_value}
              </p>
            )}
          </div>

          {/* Player positions */}
          {/* <div className="flex gap-8 text-sm">
            <div className="text-center">
              <p className="text-blue-200">{gameState?.player1_name || 'Player 1'}</p>
              <p className="text-lg font-bold text-purple-300">Position: {gameState?.player1_position || 1}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-200">{gameState?.player2_name || 'Player 2'}</p>
              <p className="text-lg font-bold text-blue-300">Position: {gameState?.player2_position || 1}</p>
            </div>
          </div> */}

          {/* Roll button */}
          <button 
            className={`bg-blue-600 text-2xl rounded-xl flex items-center justify-center h-16 w-48 font-bold shadow-lg mt-2 ${!isMyTurn || gameState?.is_rolling ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            onClick={rollDice}
            disabled={!isMyTurn || gameState?.is_rolling}
          >
            <span>
              {gameState?.is_rolling ? `Rolling... ${gameState.dice_value}` : "Roll"}
            </span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full max-w-md mb-8">
          <div className="flex flex-col items-center justify-center mt-8">
            <svg className="animate-spin h-8 w-8 text-blue-200 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-blue-200 text-xl font-semibold">Waiting for peer...</span>
          </div>
        </div>
      )}

      <ChatBox 
        messages={messages}
        sendMessage={(text) => sendMessage(text, user?.name || 'Player')}
        userId={user?.email || ''}
      />
    </div>
  );
};

export default GameLayout; 