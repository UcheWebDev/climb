// import "./styles.css";

import { useEffect, useMemo, useState } from "react";
import { GameState } from "../hooks/useSupabaseMultiplayer";

interface BoardProps {
  gameState: GameState | null;
  currentPlayerId: string;
}

export default function Board({ gameState, currentPlayerId }: BoardProps) {
  const memoizedValue = useMemo(() => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1);
    const newArr = [];
    while (arr.length) newArr.push(arr.splice(0, 10));
    return newArr;
  }, []);

  // Convert snake and ladder points to Maps for compatibility
  const snakeBitePoint = useMemo(() => {
    if (!gameState?.snake_bite_points) return new Map();
    return new Map(Object.entries(gameState.snake_bite_points));
  }, [gameState?.snake_bite_points]);

  const successPoint = useMemo(() => {
    if (!gameState?.success_points) return new Map();
    return new Map(Object.entries(gameState.success_points));
  }, [gameState?.success_points]);

  // Determine player positions
  const player1Position = gameState?.player1_position || 1;
  const player2Position = gameState?.player2_position || 1;

  // Player avatars (could be replaced with SVGs or images)
  const Player1Avatar = () => (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 border-2 border-white shadow-lg flex items-center justify-center ">
      <span className="text-white text-lg font-bold drop-shadow">🧑</span>
    </div>
  );
  const Player2Avatar = () => (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 border-2 border-white shadow-lg flex items-center justify-center ">
      <span className="text-white text-lg font-bold drop-shadow">🤖</span>
    </div>
  );

  return (
    <div className="flex w-full">
      <table className="w-full bg-white/10 rounded-2xl shadow-xl border border-blue-900/30 backdrop-blur-md overflow-hidden">
        <tbody>
          {memoizedValue.map((i, ind) => (
            <tr key={`tr-${ind}`} className="">
              {i.map((ij) => {
                const sEntry = successPoint.get(ij.toString());
                const bEntry = snakeBitePoint.get(ij.toString());
                const isPlayer1 = ij === player1Position;
                const isPlayer2 = ij === player2Position;
                return (
                  <th
                    key={`th-${ij}`}
                    className={`relative w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm font-semibold text-blue-100 bg-blue-900/40 border border-blue-800 transition-all duration-200 rounded-lg overflow-hidden p-0 align-middle ${
                      sEntry ? 'bg-green-600/60' : ''
                    } ${
                      bEntry ? 'bg-red-700/60' : ''
                    }`}
                  >
                    {/* Player Avatars */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      {isPlayer1 && <Player1Avatar />}
                      {isPlayer2 && <Player2Avatar />}
                    </div>
                    {/* Cell number, faded if player is present, or crown for 100 */}
                    {ij === 100 ? (
                      <span className="relative z-0 flex flex-col items-center justify-center">
                        <span className="text-yellow-300 text-lg md:text-xl drop-shadow font-bold">👑</span>
                      </span>
                    ) : (
                      <span className={`relative z-0 ${isPlayer1 || isPlayer2 ? 'opacity-0' : 'opacity-80'}`}>{ij}</span>
                    )}
                    {/* Success or snake/ladder marker */}
                    {(sEntry || bEntry) && (
                      <sub
                        className="absolute bottom-1 right-1 bg-yellow-400/90 w-4 h-4 text-[10px] text-black flex items-center justify-center rounded shadow z-20"
                      >
                        {sEntry || bEntry}
                      </sub>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
