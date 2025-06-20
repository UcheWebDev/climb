import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { getUserDetails } from '../services/userService';

 const BACKEND_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL;

interface Balance {
  amount: number;
  currency: string;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description?: string;
}

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
  aptosAddress?: string;
  twitterHandle?: string;
  createdAt?: string;
}

interface UserFinancials {
  balances?: Balance[];
  transactions?: Transaction[];
}

interface AuthContextType {
  user: UserProfile | null;
  financials: UserFinancials | null;
  isAuthenticated: boolean;
  serverToken: string | null;
  error: string | null;
  isLoading: boolean;
  handleGoogleLogin: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [financials, setFinancials] = useState<UserFinancials | null>(null);
  const [serverToken, setServerToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUserData = async () => {
    if (!user?.email || !serverToken) return;
    
    try {
      setIsLoading(true);
      const userData = await getUserDetails(user.email);
      // Update only profile data in localStorage
      const profileData = {
        email: user.email,
        name: userData.name,
        picture: userData.profile_picture,
        twitterHandle: userData.twitter_handle,
        aptosAddress: userData.aptos_address,
        createdAt: user.createdAt
      };
      
      setUser(profileData);
      localStorage.setItem('user', JSON.stringify(profileData));
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for stored user data and token on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('serverToken');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setServerToken(storedToken);
        // Fetch fresh financial data
        refreshUserData();
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('serverToken');
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const logoutSuccess = params.get('logout');
    
    if (logoutSuccess === 'success') {
      setUser(null);
      setFinancials(null);
      setServerToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('serverToken');
      localStorage.removeItem('id_token');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (token) {
      setServerToken(token);
      localStorage.setItem('serverToken', token);
      
      const idToken = params.get('id_token');
      if (idToken) {
        localStorage.setItem('id_token', idToken);
      }
      
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const profileData: UserProfile = {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          aptosAddress: decoded.aptosAddress,
          twitterHandle: decoded.twitterHandle,
          createdAt: decoded.createdAt
        };
        
        // Store only profile data in localStorage
        setUser(profileData);
        localStorage.setItem('user', JSON.stringify(profileData));
      
      } catch (e) {
        console.error("Failed to decode server token:", e);
        setError("Failed to decode authentication token");
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    const token = serverToken || localStorage.getItem('serverToken');
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Logout failed: ${response.status}`);
      }

      setUser(null);
      setFinancials(null);
      setServerToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('serverToken');
      localStorage.removeItem('id_token');
      
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to logout');
      
      setUser(null);
      setFinancials(null);
      setServerToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('serverToken');
      localStorage.removeItem('id_token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    window.location.href = `${BACKEND_URL}/auth/google`;
  };

  const clearError = () => {
    setError(null);
  };

  // Check if token is expired and auto-logout if needed
  useEffect(() => {
    if (serverToken) {
      try {
        const decoded = JSON.parse(atob(serverToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp < currentTime) {
          console.log('Token expired, logging out');
          logout();
        }
      } catch (e) {
        console.error('Failed to check token expiry:', e);
        // Invalid token, logout
        logout();
      }
    }
  }, [serverToken]);

  const value = {
    user,
    financials,
    isAuthenticated: !!user && !!serverToken,
    serverToken,
    error,
    isLoading,
    handleGoogleLogin,
    logout,
    clearError,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a wrapper component that provides both contexts
export const AuthProviderWithGoogle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};