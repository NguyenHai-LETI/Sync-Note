import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const NoteList = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const notes = useLiveQuery(
        () => db.notes.where({ category: categoryId }).filter(n => !n.is_deleted).sortBy('updated_at'),
        [categoryId]
    );

    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !categoryId) return;

        const newId = uuidv4();
        await db.notes.add({
            id: newId,
            category: categoryId,
            title: title,
            is_deleted: false,
            is_dirty: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        setTitle('');
        setIsCreating(false);
        navigate(`/notes/${newId}`);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Notes</h3>
                <button onClick={() => setIsCreating(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    <Plus size={20} />
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note Title"
                        style={{ width: '100%', padding: '0.5rem' }}
                        onBlur={() => !title && setIsCreating(false)}
                    />
                </form>
            )}

            <div style={{ display: 'grid', gap: '0.5rem' }}>
                {notes?.map(note => (
                    <div
                        key={note.id}
                        onClick={() => navigate(`/notes/${note.id}`)}
                        style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FileText size={16} />
                        <span>{note.title}</span>
                    </div>
                ))}
                {notes?.length === 0 && <p style={{ color: '#888' }}>No notes in this category.</p>}
            </div>
        </div>
    );
};
