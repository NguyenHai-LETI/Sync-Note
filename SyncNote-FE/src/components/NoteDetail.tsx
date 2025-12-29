import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Plus, GripVertical, CheckSquare, Square } from 'lucide-react';

export const NoteDetail = () => {
    const { noteId } = useParams();
    const note = useLiveQuery(() => db.notes.get(noteId!), [noteId]);
    const items = useLiveQuery(
        () => db.items.where({ note: noteId }).filter(i => !i.is_deleted).sortBy('order_index'),
        [noteId]
    );

    const [title, setTitle] = useState('');
    const [newItemTitle, setNewItemTitle] = useState('');

    useEffect(() => {
        if (note) setTitle(note.title);
    }, [note]);

    const handleTitleChange = async (newTitle: string) => {
        setTitle(newTitle);
        if (noteId) {
            await db.notes.update(noteId, { title: newTitle, is_dirty: true, updated_at: new Date().toISOString() });
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim() || !noteId) return;

        await db.items.add({
            id: uuidv4(),
            note: noteId,
            title: newItemTitle,
            is_completed: false,
            order_index: items ? items.length : 0,
            is_deleted: false,
            is_dirty: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        setNewItemTitle('');
    };

    const toggleItem = async (itemId: string, currentStatus: boolean) => {
        await db.items.update(itemId, {
            is_completed: !currentStatus,
            is_dirty: true,
            updated_at: new Date().toISOString()
        });
    };

    const deleteItem = async (itemId: string) => {
        await db.items.update(itemId, { is_deleted: true, is_dirty: true, updated_at: new Date().toISOString() });
    };

    const deleteNote = async () => {
        if (window.confirm('Delete this note?')) {
            if (noteId) await db.notes.update(noteId, { is_deleted: true, is_dirty: true, updated_at: new Date().toISOString() });
            // Navigate back?
        }
    };

    if (!note) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    style={{ fontSize: '2rem', fontWeight: 'bold', border: 'none', width: '100%', outline: 'none' }}
                    placeholder="Note Title"
                />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                {items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.25rem' }}>
                        <button onClick={() => toggleItem(item.id, item.is_completed)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            {item.is_completed ? <CheckSquare size={20} color="green" /> : <Square size={20} />}
                        </button>
                        <span style={{
                            textDecoration: item.is_completed ? 'line-through' : 'none',
                            color: item.is_completed ? '#888' : 'inherit',
                            flex: 1
                        }}>
                            {item.title}
                        </span>
                        <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888' }}>
                <Plus size={20} />
                <input
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Add checklist item..."
                    style={{ border: 'none', outline: 'none', flex: 1, padding: '0.5rem' }}
                />
            </form>
        </div>
    );
};
