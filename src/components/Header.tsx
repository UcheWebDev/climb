import React, { useState, useRef, useEffect } from 'react';
import { LogIn, Wallet, LogOut } from 'lucide-react';
import { HelpCircle } from 'lucide-react';
import { FaUser, FaQuestionCircle, FaFileAlt, FaHistory, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { Link } from 'wouter';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, isLoading, handleGoogleLogin, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);

  const handleLogin = () => {
    handleGoogleLogin();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="fixed top-0 left-0 w-full p-4 shadow-0 z-50  relative">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-900/30 transition-colors">
            <span className="text-3xl md:text-4xl">🎲 </span>
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-wide drop-shadow">Climb</span>
          </Link>
        </div>
        {/* Center nav items - visible on md+ only */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/how-to-play" className="text-blue-100 hover:text-white transition-colors font-medium">How to Play</Link>
          <Link to="/terms" className="text-blue-100 hover:text-white transition-colors font-medium">Terms of use</Link>
          <Link to="/recent-games" className="text-blue-100 hover:text-white transition-colors font-medium">Recent Games</Link>
        </nav>
        <div className="flex items-center space-x-4 relative">
          {isAuthenticated ? (
            <>
              <button
                ref={profileBtnRef}
                onClick={() => setIsDropdownOpen((open) => !open)}
                className="focus:outline-none"
              >
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-blue-600 cursor-pointer"
                  />
                )}
              </button>
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-56 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 border border-blue-900/30 shadow-md backdrop-blur-md rounded-md shadow-lg py-1 z-[60] animate-dropdown"
                >
                  {/* Arrow */}
                  <div className="absolute -top-2 right-6 w-4 h-4">
                    <svg className="block" viewBox="0 0 16 16" width="16" height="16">
                      <polygon points="8,0 16,16 0,16" fill="#1E1E2D" stroke="#27272a" strokeWidth="1" />
                    </svg>
                  </div>
               
                  <div className="px-4 py-2 text-sm text-gray-300">
                    <div className="font-medium truncate">{user?.name}</div>
                    <div className="text-gray-400 truncate text-xs">{user?.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A3D] flex items-center gap-2"
                  >
                    <FaUser className="w-4 h-4" />
                    View Profile
                  </Link>
                 
                     {/* Mobile nav items - only visible on mobile */}
                     <div className="flex flex-col md:hidden border-b border-blue-900/30 mb-1 pb-1">
                    <Link to="/how-to-play" className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A3D] flex items-center gap-2">
                      <FaQuestionCircle className="w-4 h-4" />
                      How to Play
                    </Link>
                    <Link to="/terms" className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A3D] flex items-center gap-2">
                      <FaFileAlt className="w-4 h-4" />
                      Terms
                    </Link>
                    <Link to="/recent-games" className="block w-full text-left px-4 py-2 text-sm text-blue-300 hover:bg-[#2A2A3D] flex items-center gap-2">
                      <FaHistory className="w-4 h-4" />
                      Recent Games
                    </Link>
                  </div>
                  <button
                    onClick={logout}
                    disabled={isLoading}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A3D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaSignOutAlt className="w-4 h-4" />
                    {isLoading ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <button 
            onClick={handleLogin} 
            disabled={isLoading} 
            className="bg-blue-100 text-blue-700 px-4 py-4 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[48px] h-[40px]"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <LogIn className="h-6 w-6" />
                <span>Login</span>
              </>
            )}
          </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

/*
Add this to your global CSS (index.css):
.animate-dropdown {
  animation: dropdown-fade 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes dropdown-fade {
  0% { opacity: 0; transform: translateY(-8px); }
  100% { opacity: 1; transform: translateY(0); }
}
*/ 