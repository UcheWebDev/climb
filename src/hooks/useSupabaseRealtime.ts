// hooks/useSupabaseChat.ts

import { useState, useEffect, useCallback } from 'react';
import { createClient, RealtimePresenceState } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabaseFunctionUrl = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
const supabase = createClient(supabaseUrl, supabaseKey);

// Message type definition
interface ChatMessage {
    id: string;
    user_id: string;
    user_name: string;
    text: string;
    created_at: string;
}

// User presence type
interface UserPresence {
    user_id: string;
    username: string;
    avatar_url?: string;
    status?: 'online' | 'away' | 'offline';
    last_seen_at?: string;
}

// Hook return type
interface ChatHookReturn {
    messages: ChatMessage[];
    onlineUsers: UserPresence[];
    loading: boolean;
    error: Error | null;
    sendMessage: (message: string) => Promise<void>;
    setUserStatus: (status: 'online' | 'away') => void;
}

/**
 * Hook for using Supabase Realtime chat with presence
 * @param roomId - The chat room identifier
 * @param userId - The current user's identifier
 * @param userName - The current user's display name
 * @param avatarUrl - Optional avatar URL for the user
 * @returns Object with messages, online users, loading state, error state, and functions
 */
export function useSupabaseChat(
    roomId: string,
    userId: string,
    userName: string,
    avatarUrl?: string
): ChatHookReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [userStatus, setUserStatus] = useState<'online' | 'away'>('online');

    // Fetch initial messages
    useEffect(() => {
        if (!roomId) return;
        setLoading(true);
        supabase
            .from('games')
            .select('messages')
            .eq('room_id', roomId)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    setError(error);
                } else {
                    setMessages(data?.messages || []);
                }
                setLoading(false);
            });
    }, [roomId]);

    // Presence: use game players as online users, just like useSupabaseMultiplayer
    useEffect(() => {
        if (!roomId) return;
        let unsubscribed = false;
        // Helper to extract players from game row
        const extractPlayers = (game: any) => {
            const players = [];
            if (game.player1_id && game.player1_name) {
                players.push({
                    user_id: game.player1_id,
                    username: game.player1_name,
                    status: 'online' as const,
                    last_seen_at: game.updated_at || new Date().toISOString(),
                });
            }
            if (game.player2_id && game.player2_name) {
                players.push({
                    user_id: game.player2_id,
                    username: game.player2_name,
                    status: 'online' as const,
                    last_seen_at: game.updated_at || new Date().toISOString(),
                });
            }
            return players;
        };
        // Initial fetch
        supabase
            .from('games')
            .select('player1_id,player1_name,player2_id,player2_name,updated_at')
            .eq('room_id', roomId)
            .single()
            .then(({ data }) => {
                if (!unsubscribed && data) {
                    setOnlineUsers(extractPlayers(data));
                }
            });
        // Subscribe to game row updates
        const channel = supabase
            .channel(`game:${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'games',
                    filter: `room_id=eq.${roomId}`,
                },
                (payload) => {
                    setOnlineUsers(extractPlayers(payload.new));
                }
            )
            .subscribe();
        return () => {
            unsubscribed = true;
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    // Send a message
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || !roomId || !userId) return;
        const newMessage: ChatMessage = {
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
    }, [roomId, userId, userName]);

    return {
        messages,
        onlineUsers,
        loading,
        error,
        sendMessage,
        setUserStatus,
    };
}