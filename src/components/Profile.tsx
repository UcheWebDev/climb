import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'wouter';
import { ArrowLeft, User, Mail, Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span>Back to Game</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 backdrop-blur-sm border border-blue-700/30 rounded-xl md:rounded-2xl p-4 md:p-8 shadow-xl">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="relative">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-blue-600 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-blue-600 bg-blue-700 flex items-center justify-center shadow-lg">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">{user.name}</h1>
              <p className="text-blue-200 text-sm md:text-base">Player Profile</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4 md:space-y-6">
            {/* Email Section */}
            <div className="bg-blue-800/30 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-700/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm font-medium text-blue-200 mb-1">Email Address</h3>
                    <p className="text-white font-mono text-sm md:text-base break-all">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(user.email, 'email')}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm w-full sm:w-auto"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4 text-white" />
                  )}
                  <span className="text-white">
                    {copiedField === 'email' ? 'Copied!' : 'Copy'}
                  </span>
                </button>
              </div>
            </div>

            {/* Aptos Address Section */}
            <div className="bg-blue-800/30 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-700/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs md:text-sm font-medium text-blue-200 mb-1">Aptos Address</h3>
                    <p className="text-white font-mono text-xs md:text-sm break-all">
                      {user.aptosAddress || 'Not connected'}
                    </p>
                  </div>
                </div>
                {user.aptosAddress && (
                  <button
                    onClick={() => copyToClipboard(user.aptosAddress!, 'aptos')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-sm w-full sm:w-auto"
                  >
                    {copiedField === 'aptos' ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                    <span className="text-white">
                      {copiedField === 'aptos' ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Twitter Handle Section (if available) */}
            {user.twitterHandle && (
              <div className="bg-blue-800/30 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-700/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs md:text-sm font-medium text-blue-200 mb-1">Twitter Handle</h3>
                      <p className="text-white text-sm md:text-base">@{user.twitterHandle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`@${user.twitterHandle}`, 'twitter')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-400 rounded-lg transition-colors text-sm w-full sm:w-auto"
                  >
                    {copiedField === 'twitter' ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                    <span className="text-white">
                      {copiedField === 'twitter' ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Account Created Date */}
            {user.createdAt && (
              <div className="bg-blue-800/30 rounded-lg md:rounded-xl p-4 md:p-6 border border-blue-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-medium text-blue-200 mb-1">Account Created</h3>
                    <p className="text-white text-sm md:text-base">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 