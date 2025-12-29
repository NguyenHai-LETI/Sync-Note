import { create } from 'zustand';
import { SyncService } from '../services/SyncService';

interface SyncState {
    isSyncing: boolean;
    lastError: string | null;
    sync: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
    isSyncing: false,
    lastError: null,
    sync: async () => {
        set({ isSyncing: true, lastError: null });
        try {
            await SyncService.sync();
        } catch (e: any) {
            set({ lastError: e.message || 'Sync failed' });
        } finally {
            set({ isSyncing: false });
        }
    },
}));
