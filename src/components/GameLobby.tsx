import React, { useState } from 'react';
import { useSupabaseMultiplayer } from '../hooks/useSupabaseMultiplayer';
import { useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { Plus, Gamepad2, Users, Clock } from "lucide-react";
import { useSpring, animated } from '@react-spring/web';
import { FaUserFriends } from "react-icons/fa";


const gameTypes = [
  {
    name: "Quick Match",
    description: "Start a game immediately",
    icon: Clock,
    color: "bg-blue-100 border-blue-200",
    iconColor: "text-blue-600"
  },
  {
    name: "Custom Game",
    description: "Configure your own rules",
    icon: Gamepad2,
    color: "bg-green-100 border-green-200",
    iconColor: "text-green-600"
  },
  {
    name: "Tournament",
    description: "Organize a competitive event",
    icon: Users,
    color: "bg-purple-100 border-purple-200",
    iconColor: "text-purple-600"
  }
];

const CreateIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
    <rect x="10" y="30" width="100" height="60" rx="15" fill="#DBEAFE" />
    <circle cx="60" cy="60" r="22" fill="#3B82F6" />
    <rect x="56" y="44" width="8" height="32" rx="4" fill="#fff" />
    <rect x="44" y="56" width="32" height="8" rx="4" fill="#fff" />
  </svg>
);

const JoinIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
    <rect x="20" y="40" width="80" height="40" rx="12" fill="#C7D2FE" />
    <circle cx="40" cy="60" r="10" fill="#6366F1" />
    <circle cx="80" cy="60" r="10" fill="#6366F1" />
    <rect x="55" y="55" width="10" height="10" rx="2" fill="#fff" />
  </svg>
);

const GameLobby: React.FC = () => {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [addLiquidity, setAddLiquidity] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [maxGames, setMaxGames] = useState(1);

  const [, navigate] = useLocation();
  const { createGame, joinGame, loading } = useSupabaseMultiplayer(user?.email || '');

  const handleCreateGame = async () => {
    if (!user?.name) {
      setError('User not authenticated');
      return;
    }
    try {
      setError(null);
      setIsCreating(true);
      const generatedRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      // You may want to pass betAmount and maxGames to createGame if supported
      await createGame(generatedRoomId, user.name);
      navigate(`/game/${generatedRoomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!user?.name || !roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }
    try {
      setError(null);
      setIsJoining(true);
      await joinGame(roomId.toUpperCase(), user.name);
      navigate(`/game/${roomId.toUpperCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setIsJoining(false);
    }
  };

  // Animation for sliding panels
  const slide = useSpring({
    transform: `translateX(${activeTab === 'create' ? '0%' : '-100%'})`,
  });

  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 w-full p-2">
      <div className="w-full max-w-lg mx-auto mt-8">
        {/* Animated Tab Buttons */}
        <div className="flex mb-6 rounded-full bg-blue-950/60 p-1 shadow-lg relative">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 z-10 ${
              activeTab === 'create'
                ? 'bg-blue-100 text-blue-700 shadow-md scale-105'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            <Plus className="inline-block mr-2 h-5 w-5" /> Create
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all duration-300 z-10 ${
              activeTab === 'join'
                ? 'bg-blue-600 text-white shadow-md scale-105'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            <FaUserFriends className="inline-block mr-2 h-5 w-5" /> Join
          </button>
        </div>
        {/* Sliding Panels */}
        <div className="relative w-full overflow-hidden h-[480px] bg-white/5 rounded-3xl shadow-xl border border-blue-900/30 mb-8">
          <animated.div
            style={slide}
            className="flex min-w-0 w-full h-full"
          >
            {/* Create Panel */}
            <div className="min-w-full px-8 py-10 flex flex-col justify-center items-center">
              <CreateIllustration />
              <h2 className="text-2xl font-bold text-blue-100 mb-2 text-center">Create a New Game Room</h2>
              <p className="text-blue-200 mb-6 text-center">Start a new game and invite your friends! Configure your rules and get playing instantly.</p>
              <div className="w-full space-y-4">
                <div className="flex flex-col gap-2">
                  {/* <div className="flex items-center">
                    <input
                      id="add-liquidity"
                      type="checkbox"
                      checked={addLiquidity}
                      onChange={() => setAddLiquidity((v) => !v)}
                      className="mr-2 accent-blue-600"
                    />
                    <label htmlFor="add-liquidity" className="text-sm text-blue-200">Add Liquidity</label>
                  </div> */}
                  {addLiquidity && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Betting Amount</label>
                        <input
                          type="number"
                          min={1}
                          value={betAmount}
                          onChange={e => setBetAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-blue-950/60 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-200 mb-1">Max Number of Games: {maxGames}</label>
                        <input
                          type="range"
                          min={1}
                          max={20}
                          value={maxGames}
                          onChange={e => setMaxGames(Number(e.target.value))}
                          className="w-full accent-blue-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCreateGame}
                  disabled={loading || isCreating}
                  className="w-full bg-blue-600 rounded-xl text-white mt-2 px-4 py-3 font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md"
                >
                  {isCreating ? 'Creating...' : 'Create Game'}
                </button>
              </div>
            </div>
            {/* Join Panel */}
            <div className="min-w-full px-8 py-10 flex flex-col justify-center items-center">
              <JoinIllustration />
              <h2 className="text-2xl font-bold text-blue-100 mb-2 text-center">Join a Game Room</h2>
              <p className="text-blue-200 mb-6 text-center">Have a room code? Enter it below to join your friends and start playing together.</p>
              <div className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">Room ID</label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="Enter room ID"
                    className="w-full px-3 py-2 bg-blue-950/60 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent capitalize"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleJoinGame}
                  disabled={loading || isJoining}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-md"
                >
                  {isJoining ? 'Joining...' : 'Join Game'}
                </button>
              </div>
            </div>
          </animated.div>
          {/* Error Message */}
          {error && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 p-2 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm text-center shadow-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameLobby; 