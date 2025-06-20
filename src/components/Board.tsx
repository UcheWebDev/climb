// import "./styles.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { GameState } from "../hooks/useSupabaseMultiplayer";

interface BoardProps {
  gameState: GameState | null;
  currentPlayerId: string;
}

// Responsive board size
const MAX_BOARD_SIZE = 400;
const MIN_PADDING_RATIO = 0.05; // 5% padding

function getSPathPositions(cellCount = 100, cellsPerRow = 10, cellSize = 40) {
  const positions = [];
  for (let i = 0; i < cellCount; i++) {
    const row = Math.floor(i / cellsPerRow);
    let col = i % cellsPerRow;
    if (row % 2 === 1) col = cellsPerRow - 1 - col;
    const x = col * cellSize;
    const y = row * cellSize;
    positions.push({ x, y });
  }
  return positions;
}

// Generate a smooth SVG path connecting the centers of the cells
function getSPathD(positions: { x: number; y: number }[], cellSize: number, padding: number) {
  if (!positions.length) return '';
  let d = '';
  for (let i = 0; i < positions.length; i++) {
    const { x, y } = positions[i];
    const cx = x + cellSize / 2 + padding;
    const cy = y + cellSize / 2 + padding;
    if (i === 0) {
      d += `M${cx},${cy}`;
    } else {
      // For row ends, use a curve
      const prev = positions[i - 1];
      const prevCx = prev.x + cellSize / 2 + padding;
      const prevCy = prev.y + cellSize / 2 + padding;
      // If new row, curve
      if (Math.abs(cy - prevCy) > 1) {
        // Curve control points for S shape
        d += ` Q${prevCx},${cy} ${cx},${cy}`;
      } else {
        d += ` L${cx},${cy}`;
      }
    }
  }
  return d;
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

  // Responsive sizing using ResizeObserver
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(300); // default fallback

  useEffect(() => {
    function updateSize() {
      if (boardRef.current) {
        const width = boardRef.current.offsetWidth;
        setBoardSize(width);
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    let observer: ResizeObserver | null = null;
    if (boardRef.current && 'ResizeObserver' in window) {
      observer = new ResizeObserver(() => updateSize());
      observer.observe(boardRef.current);
    }
    return () => {
      window.removeEventListener('resize', updateSize);
      if (observer && boardRef.current) observer.disconnect();
    };
  }, []);

  const padding = boardSize * MIN_PADDING_RATIO;
  const cellArea = boardSize - 2 * padding;
  const cellSize = cellArea / 10;
  const positions = useMemo(() => getSPathPositions(100, 10, cellSize), [cellSize]);
  const pathD = useMemo(() => getSPathD(positions, cellSize, padding), [positions, cellSize, padding]);

  return (
    <div className="w-full max-w-[400px] aspect-square mx-auto">
      <div
        ref={boardRef}
        className="s-board"
        style={{ width: '100%', height: '100%', position: "relative" }}
      >
        {/* SVG Path Overlay */}
        <svg
          width={boardSize}
          height={boardSize}
          className="absolute top-0 left-0 z-0 pointer-events-none"
          style={{ width: boardSize, height: boardSize }}
        >
          <path
            d={pathD}
            fill="none"
            stroke="#1e3a8a"
            strokeWidth={cellSize / 5}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.9}
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        {positions.map((pos, idx) => {
          const cellNum = idx + 1;
          const sEntry = successPoint.get(cellNum.toString());
          const bEntry = snakeBitePoint.get(cellNum.toString());
          const isPlayer1 = cellNum === player1Position;
          const isPlayer2 = cellNum === player2Position;
          return (
            <div
              key={cellNum}
              className={`s-board-cell ${sEntry ? "success" : ""} ${bEntry ? "alert" : ""}`}
              style={{
                left: pos.x + padding,
                top: pos.y + padding,
                width: cellSize * 0.9,
                height: cellSize * 0.9,
                zIndex: 2,
                position: "absolute",
                fontSize: Math.max(12, cellSize * 0.35),
                borderRadius: cellSize * 0.2,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center z-10">
                {isPlayer1 && <Player1Avatar />}
                {isPlayer2 && <Player2Avatar />}
              </div>
              {cellNum === 100 ? (
                <span className="relative z-0 flex flex-col items-center justify-center">
                  <span className="text-yellow-300 text-lg md:text-xl drop-shadow font-bold">👑</span>
                </span>
              ) : (
                <span className={`relative z-0 ${isPlayer1 || isPlayer2 ? "opacity-0" : "opacity-80"}`}>{cellNum}</span>
              )}
              {(sEntry || bEntry) && (
                <sub className="absolute bottom-1 right-1 bg-yellow-400/90 w-4 h-4 text-[10px] text-black flex items-center justify-center rounded shadow z-20">
                  {sEntry || bEntry}
                </sub>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
