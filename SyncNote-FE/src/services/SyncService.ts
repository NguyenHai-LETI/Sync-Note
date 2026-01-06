import { db } from '../db/db';
import client from '../api/client';


const LAST_SYNC_KEY = 'last_synced_at';

export const SyncService = {
    getLastSyncedAt: () => localStorage.getItem(LAST_SYNC_KEY),
    setLastSyncedAt: (iso: string) => localStorage.setItem(LAST_SYNC_KEY, iso),

    async pullChanges() {
        const lastSynced = this.getLastSyncedAt();
        const url = lastSynced ? `/sync?updated_after=${lastSynced}` : '/sync';

        try {
            const response = await client.get(url);
            // Renderer returns { success: true, data: { ... } }
            const data = response.data.data;

            await db.transaction('rw', db.categories, db.notes, db.items, async () => {
                // PROCESS CATEGORIES
                if (data.categories_changed?.length) {
                    for (const cat of data.categories_changed) {
                        if (cat.is_deleted) {
                            await db.categories.delete(cat.id);
                        } else {
                            const existing = await db.categories.get(cat.id);
                            if (!existing || !existing.is_dirty) {
                                // Only overwrite if not dirty (avoid conflict for now - simplistic "Last Write Wins" or "Server Wins" if not dirty)
                                await db.categories.put({ ...cat, is_dirty: false, synced_at: new Date().toISOString() });
                            }
                        }
                    }
                }

                // PROCESS NOTES
                if (data.notes_changed?.length) {
                    for (const note of data.notes_changed) {
                        if (note.is_deleted) {
                            await db.notes.delete(note.id);
                        } else {
                            const existing = await db.notes.get(note.id);
                            if (!existing || !existing.is_dirty) {
                                await db.notes.put({ ...note, is_dirty: false, synced_at: new Date().toISOString() });
                            }
                        }
                    }
                }

                // PROCESS ITEMS
                if (data.note_items_changed?.length) {
                    for (const item of data.note_items_changed) {
                        if (item.is_deleted) {
                            await db.items.delete(item.id);
                        } else {
                            const existing = await db.items.get(item.id);
                            if (!existing || !existing.is_dirty) {
                                await db.items.put({ ...item, is_dirty: false, synced_at: new Date().toISOString() });
                            }
                        }
                    }
                }
            });

            // Update check time to NOW (or server time if provided)
            this.setLastSyncedAt(new Date().toISOString());
        } catch (e) {
            console.error("Pull Sync Failed", e);
            throw e;
        }
    },

    async pushChanges() {
        // PUSH CATEGORIES
        const dirtyCats = await db.categories.filter(c => !!c.is_dirty).toArray();
        for (const cat of dirtyCats) {
            try {
                if (cat.is_deleted) {
                    await client.delete(`/categories/${cat.id}`);
                    await db.categories.delete(cat.id); // Hard delete after sync
                } else {
                    // Check if exists on server? Or just PUT?
                    // Best to use PUT for upsert if ID exists, but DRF might require POST for new.
                    // For simplicity: Try POST, if 400/fail, try PUT?
                    // OR: If created_at === updated_at (approx), maybe new?
                    // Better: Try to create, if error (already exists), update.
                    // Or: Since it IS dirty, we need to send it. Use a helper.

                    // Strategy: If it has synced_at, it was on server -> PUT. If not -> POST.
                    if (cat.synced_at) {
                        await client.put(`/categories/${cat.id}`, cat);
                    } else {
                        await client.post(`/categories`, cat);
                    }
                    await db.categories.update(cat.id, { is_dirty: false, synced_at: new Date().toISOString() });
                }
            } catch (e) {
                console.error(`Failed to push category ${cat.id}`, e);
            }
        }

        // PUSH NOTES
        const dirtyNotes = await db.notes.filter(n => !!n.is_dirty).toArray();
        for (const note of dirtyNotes) {
            try {
                if (note.is_deleted) {
                    await client.delete(`/notes/${note.id}`);
                    await db.notes.delete(note.id);
                } else {
                    if (note.synced_at) {
                        await client.put(`/notes/${note.id}`, note);
                    } else {
                        await client.post(`/categories/${note.category}/notes`, note);
                    }
                    await db.notes.update(note.id, { is_dirty: false, synced_at: new Date().toISOString() });
                }
            } catch (e) {
                console.error(`Failed to push note ${note.id}`, e);
            }
        }

        // PUSH ITEMS
        const dirtyItems = await db.items.filter(i => !!i.is_dirty).toArray();
        for (const item of dirtyItems) {
            try {
                if (item.is_deleted) {
                    await client.delete(`/items/${item.id}`);
                    await db.items.delete(item.id);
                } else {
                    if (item.synced_at) {
                        // Use PATCH for convenience as existing item
                        await client.put(`/items/${item.id}`, item);
                    } else {
                        await client.post(`/notes/${item.note}/items`, item);
                    }
                    await db.items.update(item.id, { is_dirty: false, synced_at: new Date().toISOString() });
                }
            } catch (e) {
                console.error(`Failed to push item ${item.id}`, e);
            }
        }
    },

    async sync() {
        await this.pushChanges();
        await this.pullChanges();
    }
};
