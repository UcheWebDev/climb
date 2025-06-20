import { useState, useEffect, useCallback } from 'react';
import { createClient, RealtimePresenceState } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Game state types
export interface GameState {
  id: string;
  room_id: string;
  player1_id: string;
  player1_name: string;
  player2_id?: string;
  player2_name?: string;
  current_turn: string;
  player1_position: number;
  player2_position: number;
  player1_hits: number;
  player2_hits: number;
  dice_value: number | null;
  is_rolling: boolean;
  winner: string | null;
  snake_bite_points: Record<string, string>;
  success_points: Record<string, string>;
  created_at: string;
  updated_at: string;
  messages?: any[];
  round: string[];
}

export interface Player {
  user_id: string;
  username: string;
  avatar_url?: string;
  status: 'online' | 'away' | 'offline';
  last_seen_at: string;
}

export interface GameMove {
  player_id: string;
  dice_value: number;
  new_position: number;
  timestamp: string;
}

// Hook return type
export interface MultiplayerHookReturn {
  gameState: GameState | null;
  onlinePlayers: Player[];
  loading: boolean;
  error: Error | null;
  isConnected: boolean;
  isMyTurn: boolean;
  createGame: (roomId: string, playerName: string) => Promise<string>;
  joinGame: (roomId: string, playerName: string) => Promise<void>;
  rollDice: () => Promise<void>;
  leaveGame: () => Promise<void>;
  messages: any[];
  sendMessage: (text: string, userName: string) => Promise<void>;
}

/**
 * Hook for multiplayer Snake & Ladder game with Supabase Realtime
 * @param userId - The current user's identifier
 * @param roomId - The game room identifier
 * @returns Object with game state, online players, loading state, and game functions
 */
export function useSupabaseMultiplayer(
  userId: string,
  roomId?: string
): MultiplayerHookReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Check if it's the current user's turn
  const isMyTurn = gameState?.current_turn === userId;

  // Generate random snake and ladder positions
  const generateSnakeAndLadderPositions = useCallback(() => {
    const snakeBitePoints: Record<string, string> = {};
    const successPoints: Record<string, string> = {};

    // Generate 11 snake positions
    while (Object.keys(snakeBitePoints).length < 11) {
      const home = Math.floor(Math.random() * 88) + 12; // 12-99
      const dest = Math.floor(Math.random() * (home - 2)) + 2; // 2 to home-1
      if (!snakeBitePoints[home.toString()]) {
        snakeBitePoints[home.toString()] = dest.toString();
      }
    }

    // Generate 7 ladder positions
    while (Object.keys(successPoints).length < 7) {
      const home = Math.floor(Math.random() * 89) + 2; // 2-90
      const dest = Math.floor(Math.random() * (100 - home)) + home; // home to 99
      if (!successPoints[home.toString()] && !snakeBitePoints[home.toString()]) {
        successPoints[home.toString()] = dest.toString();
      }
    }

    return { snakeBitePoints, successPoints };
  }, []);

  // Fetch initial game state
  useEffect(() => {
    const fetchGameState = async () => {
      if (!roomId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('room_id', roomId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw error;
        }

        if (data) {
          setGameState(data);
        }
      } catch (err) {
        console.error('Error fetching game state:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchGameState();
  }, [roomId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`game:${roomId}`)
      // Subscribe to game state changes
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setGameState(payload.new as GameState);
          } else if (payload.eventType === 'DELETE') {
            setGameState(null);
          }
        }
      )
      // Track presence
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as RealtimePresenceState;
        const presentPlayers: Player[] = [];

        Object.values(state).forEach(presence => {
          presence.forEach(p => {
            const player = p as unknown as Player;
            if (!presentPlayers.some(u => u.user_id === player.user_id)) {
              presentPlayers.push(player);
            }
          });
        });

        setOnlinePlayers(presentPlayers);
      })
      .subscribe(async (status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channel.track({
            user_id: userId,
            username: 'Player', // This will be updated when joining/creating game
            status: 'online',
            last_seen_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  // Create a new game
  const createGame = useCallback(async (roomId: string, playerName: string): Promise<string> => {
    try {
      setLoading(true);
      const { snakeBitePoints, successPoints } = generateSnakeAndLadderPositions();

      const newGame: Partial<GameState> = {
        room_id: roomId,
        player1_id: userId,
        player1_name: playerName,
        current_turn: userId,
        player1_position: 1,
        player2_position: 1,
        player1_hits: 0,
        player2_hits: 0,
        dice_value: null,
        is_rolling: false,
        winner: null,
        snake_bite_points: snakeBitePoints,
        success_points: successPoints,
        round: [],
      };

      const { data, error } = await supabase
        .from('games')
        .insert([newGame])
        .select()
        .single();

      if (error) throw error;

      return data.id;
    } catch (err) {
      console.error('Error creating game:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, generateSnakeAndLadderPositions]);

  // Join an existing game
  const joinGame = useCallback(async (roomId: string, playerName: string): Promise<void> => {
    try {
      setLoading(true);

      const { data: existingGame, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('room_id', roomId)
        .single();

      if (fetchError) throw fetchError;

      if (!existingGame) {
        throw new Error('Game not found');
      }

      if (existingGame.player2_id) {
        throw new Error('Game is full');
      }

      const { error } = await supabase
        .from('games')
        .update({
          player2_id: userId,
          player2_name: playerName,
          updated_at: new Date().toISOString()
        })
        .eq('room_id', roomId);

      if (error) throw error;
    } catch (err) {
      console.error('Error joining game:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Roll the dice
  const rollDice = useCallback(async (): Promise<void> => {
    if (!gameState || !isMyTurn || gameState.is_rolling) return;

    try {
      const diceValue = Math.floor(Math.random() * 6) + 1;
      const isPlayer1 = gameState.player1_id === userId;
      const currentPosition = isPlayer1 ? gameState.player1_position : gameState.player2_position;
      const currentHits = isPlayer1 ? gameState.player1_hits : gameState.player2_hits;

      // Calculate new position
      let newPosition = currentPosition;
      if ((currentPosition === 1 && diceValue === 1) || currentPosition > 1) {
        newPosition = Math.min(100, currentPosition + diceValue);
      }

      // Apply snake or ladder effects (repeat until safe square)
      const snakeBitePoints = gameState.snake_bite_points;
      const successPoints = gameState.success_points;
      let prevPosition;
      do {
        prevPosition = newPosition;
        if (snakeBitePoints[newPosition.toString()]) {
          newPosition = parseInt(snakeBitePoints[newPosition.toString()]);
        } else if (successPoints[newPosition.toString()]) {
          newPosition = parseInt(successPoints[newPosition.toString()]);
        }
      } while (newPosition !== prevPosition);

      // Check for winner
      const winner = newPosition === 100 ? userId : null;
      let updateData: Partial<GameState> = {
        dice_value: diceValue,
        is_rolling: true,
        current_turn: winner ? undefined : (gameState.player1_id === userId ? gameState.player2_id : gameState.player1_id),
        winner,
        updated_at: new Date().toISOString(),
      };
      if (isPlayer1) {
        updateData.player1_position = newPosition;
        updateData.player1_hits = currentHits + 1;
      } else {
        updateData.player2_position = newPosition;
        updateData.player2_hits = currentHits + 1;
      }
      // If round is won, update round array and reset positions if < 5 rounds
      if (winner) {
        // Ensure winnerName is always a string
        let winnerName = '';
        if (userId === gameState.player1_id) winnerName = typeof gameState.player1_name === 'string' ? gameState.player1_name : '';
        else if (userId === gameState.player2_id) winnerName = typeof gameState.player2_name === 'string' ? gameState.player2_name : '';
        const currentRounds: string[] = Array.isArray(gameState.round) ? gameState.round.filter((r): r is string => typeof r === 'string') : [];
        const updatedRounds: string[] = [...currentRounds, winnerName];
        if (updatedRounds.length < 5) {
          // Reset for next round
          updateData = {
            ...updateData,
            round: updatedRounds,
            player1_position: 1,
            player2_position: 1,
            player1_hits: 0,
            player2_hits: 0,
            winner: null,
            dice_value: null,
            is_rolling: false,
            current_turn: gameState.player1_id,
          };
        } else {
          // Game over after 5 rounds
          // Determine overall winner
          const player1Wins = updatedRounds.filter((name) => name === gameState.player1_name).length;
          const player2Wins = updatedRounds.filter((name) => name === gameState.player2_name).length;
          let overallWinner: string | null = null;
          if (player1Wins > player2Wins) overallWinner = gameState.player1_id || null;
          else if (player2Wins > player1Wins) overallWinner = gameState.player2_id || null;
          else overallWinner = 'Draw';
          updateData = {
            ...updateData,
            round: updatedRounds,
            winner: overallWinner,
          };
        }
      }
      const { error } = await supabase
        .from('games')
        .update(updateData)
        .eq('room_id', gameState.room_id);
      if (error) throw error;
      // Reset rolling state after a delay (only if not a round win)
      if (!winner) {
        setTimeout(async () => {
          const { error: resetError } = await supabase
            .from('games')
            .update({
              is_rolling: false,
              dice_value: null,
              updated_at: new Date().toISOString()
            })
            .eq('room_id', gameState.room_id);
          if (resetError) {
            console.error('Error resetting rolling state:', resetError);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Error rolling dice:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [gameState, isMyTurn, userId]);

  // Leave the game
  const leaveGame = useCallback(async (): Promise<void> => {
    if (!gameState) return;

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('room_id', gameState.room_id);

      if (error) throw error;

      setGameState(null);
    } catch (err) {
      console.error('Error leaving game:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [gameState]);

  // Send a chat message
  const sendMessage = useCallback(async (text: string, userName: string) => {
    if (!roomId || !userId || !text.trim()) return;
    const newMessage = {
      id: `${Date.now()}-${Math.random()}`,
      user_id: userId,
      user_name: userName,
      text,
      created_at: new Date().toISOString(),
    };
    // Fetch current messages
    const { data, error } = await supabase
      .from('games')
      .select('messages')
      .eq('room_id', roomId)
      .single();
    if (error) return;
    const updatedMessages = [...(data?.messages || []), newMessage];
    await supabase
      .from('games')
      .update({ messages: updatedMessages })
      .eq('room_id', roomId);
  }, [roomId, userId]);

  return {
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
    messages: gameState?.messages || [],
    sendMessage,
  };
} 