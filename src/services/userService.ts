const BACKEND_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL;



interface UserDetails {
  email: string;
  name: string;
  profile_picture?: string;
  twitter_handle?: string;
  aptos_address?: string;
}

export const getUserDetails = async (email: string): Promise<UserDetails> => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/user?email=${encodeURIComponent(email)}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch user details: ${response.status}`);
    }

    const userData = await response.json();
    return userData.user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}; 