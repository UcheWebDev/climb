import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { useLocation } from 'wouter';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface GameRow {
  id: string;
  room_id: string;
  player1_id: string;
  player1_name: string;
  player2_id?: string;
  player2_name?: string;
  winner: string | null;
  updated_at: string;
}

const RecentGames: React.FC = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const fetchGames = async () => {
      if (!user?.name && !user?.email) return;
      setLoading(true);
      setError(null);
      try {
        // Find games where user is player1 or player2 (by name or email)
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .or(`player1_name.eq.${user.name},player2_name.eq.${user.name},player1_id.eq.${user.email},player2_id.eq.${user.email}`)
          .order('updated_at', { ascending: false })
          .limit(10);
        if (error) throw error;
        setGames(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch games');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [user]);

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 rounded-2xl shadow-xl border border-blue-900/30 p-6 w-full max-w-xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-blue-100 mb-4 text-center">Recent Games</h2>
      {loading && (
        <div className="flex justify-center items-center py-4">
          <svg className="animate-spin h-6 w-6 text-blue-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {error && <div className="text-red-300 text-center mb-2">{error}</div>}
      {!loading && games.length === 0 && <div className="text-blue-200 text-center">No recent games found.</div>}
      <ul className="divide-y divide-blue-900/30">
        {games.map((game) => {
          const isPlayer1 = game.player1_id === user?.email || game.player1_name === user?.name;
          const isPlayer2 = game.player2_id === user?.email || game.player2_name === user?.name;
          const opponent = isPlayer1 ? game.player2_name : game.player1_name;
          return (
            <li key={game.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div className="text-blue-100 font-semibold">Room: <span className="text-green-300">{game.room_id}</span></div>
                <div className="text-blue-200 text-sm">Opponent: <span className="text-blue-300">{opponent || 'Waiting...'}</span></div>
                <div className="text-blue-400 text-xs">Last updated: {new Date(game.updated_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                {game.winner ? (
                  <span className="px-3 py-1 rounded-full bg-green-700/80 text-green-100 text-xs font-bold">Finished</span>
                ) : (
                  <button
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-sm shadow-md"
                    onClick={() => navigate(`/game/${game.room_id}`)}
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentGames; 