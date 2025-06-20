import React from 'react';

const TermsOfUse: React.FC = () => (
  <div className="max-w-2xl mx-auto p-8 mt-12 bg-white/10 rounded-2xl shadow-xl border border-blue-900/30 backdrop-blur-md">
    <h1 className="text-3xl font-bold text-blue-100 mb-6 text-center">Terms of Use</h1>
    <div className="text-blue-200 space-y-4 text-lg">
      <p><b>Fair Play:</b> All players are expected to play honestly and treat others with respect. Cheating, exploiting bugs, or harassing other players is not tolerated.</p>
      <p><b>Privacy:</b> We respect your privacy. Your game data and chat messages are only used for gameplay and are not shared with third parties.</p>
      <p><b>Liability:</b> This game is provided as-is for entertainment purposes. We are not responsible for any losses, damages, or disputes arising from use of this game.</p>
      <p>By playing, you agree to these terms. Have fun and good luck!</p>
    </div>
  </div>
);

export default TermsOfUse; 