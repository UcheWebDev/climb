import React from 'react';

const HowToPlay: React.FC = () => (
  <div className="max-w-2xl mx-auto p-8 mt-12 bg-white/10 rounded-2xl shadow-xl border border-blue-900/30 backdrop-blur-md">
    <h1 className="text-3xl font-bold text-blue-100 mb-6 text-center">How to Play</h1>
    <ol className="list-decimal list-inside text-blue-200 space-y-3 text-lg">
      <li>Click <b>Create</b> to start a new game, or <b>Join</b> to enter a room code from a friend.</li>
      <li>Wait for another player to join your room.</li>
      <li>On your turn, click <b>Roll</b> to roll the dice and move your piece.</li>
      <li>If you land on a ladder, you climb up! If you land on a snake, you slide down.</li>
      <li>The first player to reach square 100 wins the round. There are 5 rounds per match.</li>
      <li>The player who wins the most rounds is the overall winner!</li>
      <li>Use the chat to talk to your opponent during the game.</li>
    </ol>
  </div>
);

export default HowToPlay; 