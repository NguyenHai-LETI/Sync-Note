import Dexie, { type Table } from 'dexie';
import type { Category, Note, NoteItem } from '../types';

export class SyncNoteDB extends Dexie {
    categories!: Table<Category>;
    notes!: Table<Note>;
    items!: Table<NoteItem>;

    constructor() {
        super('SyncNoteDB');
        this.version(1).stores({
            categories: 'id, order_index, updated_at, is_deleted, is_dirty',
            notes: 'id, category, order_index, updated_at, is_deleted, is_dirty',
            items: 'id, note, order_index, updated_at, is_deleted, is_dirty'
        });
    }
}

export const db = new SyncNoteDB();
