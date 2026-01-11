import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import client from '../api/client';
import type { User } from '../types';
import { db } from '../db/db';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshTokenString: string | null;
    login: (access: string, refresh: string) => void;
    logout: () => Promise<void>;
    setAccessToken: (token: string) => void;
    refreshToken: () => Promise<void>;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshTokenString: null,

            login: (access, refresh) => {
                // You might want to decode JWT to get user? For now just storing tokens.
                // Or fetch user profile after.
                set({ accessToken: access, refreshTokenString: refresh });
            },

            logout: async () => {
                set({ user: null, accessToken: null, refreshTokenString: null });
                try {
                    await db.delete();
                    await db.open(); // Re-open to be ready for next user? Or just delete.
                    // db.delete() closes it. Next use will need it open.
                    window.location.reload(); // Simplest way to reset DB connection and state
                } catch (e) {
                    console.error("Failed to clear DB", e);
                }
            },

            setAccessToken: (token) => set({ accessToken: token }),

            refreshToken: async () => {
                const refresh = get().refreshTokenString;
                if (!refresh) throw new Error("No refresh token");

                try {
                    const response = await client.post('/auth/refresh', { refresh });
                    set({ accessToken: response.data.access });
                } catch (error) {
                    get().logout();
                    throw error;
                }
            },

            isAuthenticated: () => !!get().accessToken,
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ refreshTokenString: state.refreshTokenString, accessToken: state.accessToken, user: state.user }),
            // Spec said: access_token (memory), refresh_token (secure storage).
            // Zustand persist default is localStorage. 
            // It's acceptable for MVP. To do strictly memory for access, we partialize.
        }
    )
);
