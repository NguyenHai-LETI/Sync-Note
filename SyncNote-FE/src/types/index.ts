export interface User {
    id: string;
    email: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    order_index: number;
    created_at?: string;
    updated_at?: string;
    is_deleted: boolean;
    synced_at?: string; // Local helper
    is_dirty?: boolean; // Local helper
}

export interface Note {
    id: string;
    category: string; // ID
    title: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    is_deleted: boolean;
    synced_at?: string;
    is_dirty?: boolean;
}

export interface NoteItem {
    id: string;
    note: string; // ID
    title: string;
    content?: string;
    is_completed: boolean;
    order_index: number;
    created_at?: string;
    updated_at?: string;
    is_deleted: boolean;
    synced_at?: string;
    is_dirty?: boolean;
}
