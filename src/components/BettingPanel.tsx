import React from 'react';
import { DollarSign } from 'lucide-react';

interface Bet {
  player: string;
  bet: number;
  coef: number;
  win: number;
  currency: string;
}

const dummyBets: Bet[] = [
  { player: 'Bhuvan mittal', bet: 20, coef: 1.95, win: 39, currency: '₹' },
  { player: '1win', bet: 250, coef: 1.95, win: 487.5, currency: '$' },
  { player: 'Rohit', bet: 50, coef: 1.95, win: 97.5, currency: '₹' },
  { player: 'Ankit', bet: 10, coef: 1.95, win: 19.5, currency: '₹' },
  { player: 'Ankush Thakur', bet: 100, coef: 1.95, win: 195, currency: '₹' },
  { player: '1win', bet: 10, coef: 1.95, win: 19.5, currency: '₹' },
  { player: '1win', bet: 50, coef: 1.95, win: 97.5, currency: '₹' },
  { player: 'Lokesh Das', bet: 10, coef: 1.95, win: 19.5, currency: '₹' },
  { player: 'Nandu Janraoji Kale', bet: 400, coef: 1.95, win: 780, currency: '₹' },
  { player: '1win', bet: 20, coef: 1.95, win: 39, currency: '₹' },
  { player: 'Meet singh', bet: 10, coef: 1.95, win: 19.5, currency: '₹' },
];

const BettingPanel: React.FC = () => {
  return (
    <div className="w-full md:w-80 bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-lg font-semibold">Live Bets</h3>
      </div>
      <div className="overflow-y-auto flex-grow">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-gray-700">
              <th className="py-2 w-1/4">Player</th>
              <th className="py-2 w-1/4">Bet</th>
              <th className="py-2 w-1/4">Coef</th>
              <th className="py-2 w-1/4">Win</th>
            </tr>
          </thead>
          <tbody>
            {dummyBets.map((bet, index) => (
              <tr key={index} className="text-white text-sm border-b border-gray-700 last:border-b-0">
                <td className="py-3 flex items-center">
                  <DollarSign size={16} className="text-yellow-400 mr-2" />
                  <span>{bet.player}</span>
                </td>
                <td className="py-3">{bet.bet} {bet.currency}</td>
                <td className="py-3">x{bet.coef}</td>
                <td className="py-3 text-green-400">{bet.win} {bet.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BettingPanel; 